import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { type LanguageModel, type ModelMessage, Output, generateText, streamText } from 'ai';

import type { ApiType, ResolvedProviderConfig } from './providers';

// Warnings (e.g. unsupported settings) would be printed into the ink UI.
globalThis.AI_SDK_LOG_WARNINGS = false;

export interface ChatMessage {
  content: string;
  role: string;
}

export interface ChatRequest {
  /**
   * Ask the model for a JSON object, the raw text is still returned.
   */
  json?: boolean;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
}

export interface ChatResult {
  text: string;
  totalTokens?: number;
}

type ConnectionConfig = Pick<ResolvedProviderConfig, 'apiKey' | 'apiType' | 'baseURL'>;

/**
 * The Anthropic SDK expects `.../v1`, while Anthropic compatible endpoints are usually
 * documented without it (e.g. `https://api.deepseek.com/anthropic`).
 */
const normalizeAnthropicBaseURL = (baseURL: string) =>
  /\/v1$/.test(baseURL) ? baseURL : `${baseURL}/v1`;

export const createLanguageModel = (
  { apiKey, apiType, baseURL }: ConnectionConfig,
  model: string,
): LanguageModel => {
  switch (apiType) {
    case 'anthropic': {
      return createAnthropic({ apiKey, baseURL: normalizeAnthropicBaseURL(baseURL) }).messages(
        model,
      );
    }
    case 'gemini': {
      return createGoogleGenerativeAI({ apiKey, baseURL })(model);
    }
    case 'responses': {
      return createOpenAI({ apiKey, baseURL }).responses(model);
    }
    default: {
      return createOpenAICompatible({
        apiKey: apiKey || undefined,
        baseURL,
        includeUsage: true,
        name: 'lobe',
      })(model);
    }
  }
};

/**
 * System messages go to `instructions`, the SDK rejects them inside `messages`.
 */
const toPrompt = (messages: ChatMessage[]) => {
  const instructions = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');

  return {
    instructions: instructions || undefined,
    messages: messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        content: message.content,
        role: message.role === 'assistant' ? 'assistant' : 'user',
      })) as ModelMessage[],
  };
};

const isUnsupportedSamplingError = (error: any) => {
  const status = error?.statusCode ?? error?.status;
  if (status !== 400 && status !== 422) return false;
  const message = String(error?.responseBody || error?.message || '').toLowerCase();
  return ['temperature', 'top_p', 'topp'].some((key) => message.includes(key));
};

const getErrorText = (error: any): string | undefined =>
  typeof error?.text === 'string' && error.text ? error.text : undefined;

export class LLMClient {
  readonly config: ResolvedProviderConfig;
  private maxRetries: number;
  private model: LanguageModel;

  constructor(config: ResolvedProviderConfig, { maxRetries = 4 }: { maxRetries?: number } = {}) {
    this.config = config;
    this.maxRetries = maxRetries;
    this.model = createLanguageModel(config, config.model);
  }

  private buildOptions({ messages, temperature, topP }: ChatRequest, withSampling: boolean) {
    // Anthropic models reject `temperature` and `top_p` together.
    const dropTopP = this.config.apiType === 'anthropic' && temperature !== undefined;
    return {
      ...toPrompt(messages),
      maxRetries: this.maxRetries,
      model: this.model,
      ...(withSampling && {
        temperature,
        topP: dropTopP ? undefined : topP,
      }),
    };
  }

  /**
   * Some models (reasoning models in particular) only accept default sampling params,
   * so retry once without them instead of maintaining a model list.
   */
  private async withSamplingFallback<T>(run: (withSampling: boolean) => Promise<T>) {
    try {
      return await run(true);
    } catch (error) {
      if (isUnsupportedSamplingError(error)) return run(false);
      throw error;
    }
  }

  async generate(request: ChatRequest): Promise<ChatResult> {
    return this.withSamplingFallback(async (withSampling) => {
      try {
        const result = await generateText({
          ...this.buildOptions(request, withSampling),
          ...(request.json && { output: Output.json() }),
        });
        return { text: result.text, totalTokens: result.usage.totalTokens };
      } catch (error) {
        // JSON output that fails to parse still carries the raw text for lenient parsing.
        const text = request.json ? getErrorText(error) : undefined;
        if (text) return { text };
        throw error;
      }
    });
  }

  async stream(request: ChatRequest, onText: (text: string) => void): Promise<ChatResult> {
    return this.withSamplingFallback(async (withSampling) => {
      const result = streamText(this.buildOptions(request, withSampling));
      let text = '';

      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          text += part.text;
          onText(text);
        } else if (part.type === 'error') {
          throw part.error;
        }
      }

      const usage = await result.totalUsage;
      return { text, totalTokens: usage.totalTokens };
    });
  }
}

const MODELS_TIMEOUT = 10_000;

/**
 * List model ids from the endpoint, used by the interactive setup.
 */
export const listModels = async ({ apiKey, apiType, baseURL }: ConnectionConfig) => {
  const headers: Record<string, string> = {};
  let url = `${baseURL}/models`;

  if (apiType === 'anthropic') {
    url = `${normalizeAnthropicBaseURL(baseURL)}/models?limit=1000`;
    headers['anthropic-version'] = '2023-06-01';
    if (apiKey) headers['x-api-key'] = apiKey;
  } else if (apiType === 'gemini') {
    url = `${baseURL}/models?pageSize=1000`;
    if (apiKey) headers['x-goog-api-key'] = apiKey;
  } else if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(MODELS_TIMEOUT) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const body: any = await res.json();
  const items: any[] = body?.data ?? body?.models ?? (Array.isArray(body) ? body : []);

  return [
    ...new Set(
      items
        .map((item) => String(item?.id ?? item?.name ?? '').replace(/^models\//, ''))
        .filter(Boolean),
    ),
  ].sort();
};

export const API_TYPE_SHORT: Record<ApiType, string> = {
  'anthropic': 'Anthropic',
  'chat-completions': 'Chat Completions',
  'gemini': 'Gemini',
  'responses': 'Responses',
};
