import { LLMClient } from './llm';
import { PromptTemplate } from './promptTemplate';
import { Document } from './textSplitter';

export interface SummarizationChainOptions {
  questionPrompt: PromptTemplate;
  refinePrompt: PromptTemplate;
  type: 'refine' | 'map_reduce';
}

export class SummarizationChain {
  private client: LLMClient;
  private questionPrompt: PromptTemplate;
  private refinePrompt: PromptTemplate;

  constructor(client: LLMClient, options: SummarizationChainOptions) {
    this.client = client;
    this.questionPrompt = options.questionPrompt;
    this.refinePrompt = options.refinePrompt;
  }

  async call(inputs: { input_documents: Document[] }): Promise<{ text: string }> {
    const { input_documents } = inputs;

    if (input_documents.length === 0) {
      return { text: '' };
    }

    if (input_documents.length === 1) {
      // 只有一个文档，直接使用 questionPrompt
      const firstDoc = input_documents[0];
      if (!firstDoc) {
        return { text: '' };
      }

      const prompt = this.questionPrompt.format({
        text: firstDoc.pageContent,
      });

      const { text } = await this.client.generate({
        messages: [{ content: prompt, role: 'user' }],
        temperature: 0.5,
      });

      return { text };
    }

    // 多个文档，使用 refine 方法
    let currentSummary = '';

    for (const [i, doc] of input_documents.entries()) {
      if (!doc) continue;

      let prompt: string;

      if (i === 0) {
        // 第一个文档使用 questionPrompt
        prompt = this.questionPrompt.format({
          text: doc.pageContent,
        });
      } else {
        // 后续文档使用 refinePrompt，包含之前的摘要
        prompt = this.refinePrompt.format({
          existing_answer: currentSummary,
          text: doc.pageContent,
        });
      }

      const { text } = await this.client.generate({
        messages: [{ content: prompt, role: 'user' }],
        temperature: 0.5,
      });

      currentSummary = text;
    }

    return { text: currentSummary };
  }
}

export function loadSummarizationChain(
  client: LLMClient,
  options: SummarizationChainOptions,
): SummarizationChain {
  return new SummarizationChain(client, options);
}
