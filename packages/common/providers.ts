/**
 * Wire protocol used to talk to the model endpoint.
 */
export type ApiType = 'chat-completions' | 'responses' | 'anthropic' | 'gemini';

export const API_TYPES: Record<ApiType, { defaultBaseURL: string; name: string }> = {
  'anthropic': {
    defaultBaseURL: 'https://api.anthropic.com/v1',
    name: 'Anthropic Messages (/v1/messages)',
  },
  'chat-completions': {
    defaultBaseURL: 'https://api.openai.com/v1',
    name: 'OpenAI Chat Completions (/v1/chat/completions)',
  },
  'gemini': {
    defaultBaseURL: 'https://generativelanguage.googleapis.com/v1beta',
    name: 'Google Gemini (generateContent)',
  },
  'responses': {
    defaultBaseURL: 'https://api.openai.com/v1',
    name: 'OpenAI Responses (/v1/responses)',
  },
};

export const isApiType = (value?: string): value is ApiType =>
  !!value && Object.prototype.hasOwnProperty.call(API_TYPES, value);

export interface ProviderPreset {
  /**
   * Environment variables checked for the API key, in order.
   */
  apiKeyEnv?: string[];
  defaultModel?: string;
  /**
   * Supported protocols and their base URLs, the default follows `API_TYPE_PRIORITY`.
   */
  endpoints: Partial<Record<ApiType, string>>;
  name: string;
  /**
   * Local runtimes that don't require an API key.
   */
  noApiKey?: boolean;
}

export const defaultModel = 'gpt-5-mini';

export const PROVIDERS = {
  anthropic: {
    apiKeyEnv: ['ANTHROPIC_API_KEY'],
    endpoints: { anthropic: 'https://api.anthropic.com/v1' },
    name: 'Anthropic',
  },
  deepseek: {
    apiKeyEnv: ['DEEPSEEK_API_KEY'],
    defaultModel: 'deepseek-chat',
    endpoints: {
      'anthropic': 'https://api.deepseek.com/anthropic',
      'chat-completions': 'https://api.deepseek.com/v1',
    },
    name: 'DeepSeek',
  },
  google: {
    apiKeyEnv: ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY'],
    endpoints: {
      'chat-completions': 'https://generativelanguage.googleapis.com/v1beta/openai',
      'gemini': 'https://generativelanguage.googleapis.com/v1beta',
    },
    name: 'Google Gemini',
  },
  groq: {
    apiKeyEnv: ['GROQ_API_KEY'],
    endpoints: { 'chat-completions': 'https://api.groq.com/openai/v1' },
    name: 'Groq',
  },
  lmstudio: {
    endpoints: { 'chat-completions': 'http://127.0.0.1:1234/v1' },
    name: 'LM Studio',
    noApiKey: true,
  },
  minimax: {
    apiKeyEnv: ['MINIMAX_API_KEY'],
    endpoints: {
      'anthropic': 'https://api.minimaxi.com/anthropic',
      'chat-completions': 'https://api.minimaxi.com/v1',
    },
    name: 'MiniMax',
  },
  mistral: {
    apiKeyEnv: ['MISTRAL_API_KEY'],
    endpoints: { 'chat-completions': 'https://api.mistral.ai/v1' },
    name: 'Mistral',
  },
  moonshot: {
    apiKeyEnv: ['MOONSHOT_API_KEY'],
    endpoints: {
      'anthropic': 'https://api.moonshot.cn/anthropic',
      'chat-completions': 'https://api.moonshot.cn/v1',
    },
    name: 'Moonshot (Kimi)',
  },
  ollama: {
    endpoints: { 'chat-completions': 'http://127.0.0.1:11434/v1' },
    name: 'Ollama',
    noApiKey: true,
  },
  openai: {
    apiKeyEnv: ['OPENAI_API_KEY'],
    defaultModel,
    endpoints: {
      'chat-completions': 'https://api.openai.com/v1',
      'responses': 'https://api.openai.com/v1',
    },
    name: 'OpenAI',
  },
  openrouter: {
    apiKeyEnv: ['OPENROUTER_API_KEY'],
    endpoints: { 'chat-completions': 'https://openrouter.ai/api/v1' },
    name: 'OpenRouter',
  },
  qwen: {
    apiKeyEnv: ['DASHSCOPE_API_KEY'],
    defaultModel: 'qwen-plus',
    endpoints: { 'chat-completions': 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
    name: 'Qwen (DashScope)',
  },
  siliconflow: {
    apiKeyEnv: ['SILICONFLOW_API_KEY', 'SILICONCLOUD_API_KEY'],
    endpoints: { 'chat-completions': 'https://api.siliconflow.cn/v1' },
    name: 'SiliconFlow',
  },
  volcengine: {
    apiKeyEnv: ['ARK_API_KEY'],
    endpoints: { 'chat-completions': 'https://ark.cn-beijing.volces.com/api/v3' },
    name: 'Volcengine Ark (Doubao)',
  },
  xai: {
    apiKeyEnv: ['XAI_API_KEY'],
    endpoints: { 'chat-completions': 'https://api.x.ai/v1' },
    name: 'xAI (Grok)',
  },
  zhipu: {
    apiKeyEnv: ['ZHIPU_API_KEY'],
    endpoints: {
      'anthropic': 'https://open.bigmodel.cn/api/anthropic',
      'chat-completions': 'https://open.bigmodel.cn/api/paas/v4',
    },
    name: 'Zhipu (GLM)',
  },
} satisfies Record<string, ProviderPreset>;

export type ProviderId = keyof typeof PROVIDERS;

/**
 * Not a preset: the user picks the protocol and fills in the base URL.
 */
export const CUSTOM_PROVIDER = 'custom';

export const providerIds = Object.keys(PROVIDERS) as ProviderId[];

export const isProviderId = (id?: string): id is ProviderId =>
  !!id && Object.prototype.hasOwnProperty.call(PROVIDERS, id);

export const getProviderPreset = (id?: string): ProviderPreset | undefined =>
  isProviderId(id) ? PROVIDERS[id] : undefined;

/**
 * Native protocols first: Responses for OpenAI, Gemini for Google, then Chat Completions.
 */
const API_TYPE_PRIORITY: ApiType[] = ['responses', 'gemini', 'chat-completions', 'anthropic'];

export const getProviderApiTypes = (id?: string): ApiType[] => {
  const preset = getProviderPreset(id);
  if (!preset) return ['chat-completions', 'responses', 'anthropic', 'gemini'];
  return API_TYPE_PRIORITY.filter((type) => preset.endpoints[type]);
};

export const getDefaultBaseURL = (id: string | undefined, apiType: ApiType) =>
  getProviderPreset(id)?.endpoints[apiType] || API_TYPES[apiType].defaultBaseURL;

export const getProviderLabel = (id?: string) =>
  getProviderPreset(id)?.name || (id === CUSTOM_PROVIDER ? 'Custom' : id || 'OpenAI');

/**
 * Environment variables that override the stored config, mainly for CI.
 */
export const ENV = {
  apiKey: 'LOBE_API_KEY',
  apiType: 'LOBE_API_TYPE',
  baseURL: 'LOBE_BASE_URL',
  provider: 'LOBE_PROVIDER',
} as const;

const readEnv = (names: string[] = []) => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
};

/**
 * Raw values as stored by the CLI config, all optional.
 */
export interface StoredProviderConfig {
  apiKey?: string;
  apiType?: string;
  baseURL?: string;
  model?: string;
  provider?: string;
}

export interface ResolvedProviderConfig {
  apiKey: string;
  apiType: ApiType;
  baseURL: string;
  model: string;
  noApiKey: boolean;
  provider: string;
  providerName: string;
}

/**
 * Precedence: `LOBE_*` env > stored config > provider env (e.g. `DEEPSEEK_API_KEY`) > preset default.
 *
 * Configs written before providers existed only have `openaiToken` / `apiBaseUrl`. They keep
 * the old behaviour: OpenAI Chat Completions, with `OPENAI_API_KEY` / `OPENAI_PROXY_URL`
 * taking precedence over the stored values.
 */
export const resolveProviderConfig = (
  stored: StoredProviderConfig = {},
): ResolvedProviderConfig => {
  const provider = process.env[ENV.provider] || stored.provider || '';
  const requestedApiType = process.env[ENV.apiType] || stored.apiType;
  const isLegacy = !provider && !requestedApiType;
  const preset = getProviderPreset(provider || 'openai');

  const apiType: ApiType = isApiType(requestedApiType)
    ? requestedApiType
    : isLegacy
      ? 'chat-completions'
      : (getProviderApiTypes(provider)[0] ?? 'chat-completions');

  const legacyEnv = (name: string) => (isLegacy ? process.env[name] : undefined);

  const baseURL =
    process.env[ENV.baseURL] ||
    legacyEnv('OPENAI_PROXY_URL') ||
    stored.baseURL ||
    getDefaultBaseURL(provider || 'openai', apiType);

  const apiKey =
    process.env[ENV.apiKey] ||
    legacyEnv('OPENAI_API_KEY') ||
    stored.apiKey ||
    readEnv(preset?.apiKeyEnv) ||
    '';

  return {
    apiKey,
    apiType,
    baseURL: baseURL.replace(/\/+$/, ''),
    model: stored.model || preset?.defaultModel || (isLegacy ? defaultModel : ''),
    noApiKey: Boolean(preset?.noApiKey),
    provider: provider || 'openai',
    providerName: getProviderLabel(provider || 'openai'),
  };
};

/**
 * Human readable reason why the config can't be used yet.
 */
export const getProviderConfigError = (config: ResolvedProviderConfig, configCommand: string) => {
  if (!config.model) return `Please choose a model by ${configCommand}`;
  if (!config.apiKey && !config.noApiKey) {
    return `Please set the ${config.providerName} API key by ${configCommand}`;
  }
  return undefined;
};
