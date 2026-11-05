import type { LLMClient } from './llm';
import type { PromptTemplate } from './promptTemplate';
import type { Document } from './textSplitter';

export interface SummarizeOptions {
  /** Summarizes the first document; receives `{text}`. */
  questionPrompt: PromptTemplate<{ text: string }>;
  /** Folds each following document into the summary; receives `{existing_answer}` and `{text}`. */
  refinePrompt: PromptTemplate<{ existing_answer: string; text: string }>;
  temperature?: number;
}

/** "Refine" summarization: summarize the first document, then refine with each next one. */
export const summarizeDocuments = async (
  client: LLMClient,
  documents: Document[],
  { questionPrompt, refinePrompt, temperature = 0.5 }: SummarizeOptions,
): Promise<string> => {
  let summary = '';

  for (const [i, { pageContent }] of documents.entries()) {
    const prompt =
      i === 0
        ? questionPrompt.format({ text: pageContent })
        : refinePrompt.format({ existing_answer: summary, text: pageContent });

    ({ text: summary } = await client.generate({
      messages: [{ content: prompt, role: 'user' }],
      temperature,
    }));
  }

  return summary;
};
