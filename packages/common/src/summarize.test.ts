import { describe, expect, it, vi } from 'vitest';

import type { LLMClient } from './llm';
import { PromptTemplate } from './promptTemplate';
import { summarizeDocuments } from './summarize';

const createClient = () => {
  const generate = vi.fn(async ({ messages }: { messages: { content: string }[] }) => ({
    text: `summary(${messages[0]!.content})`,
  }));
  return { client: { generate } as unknown as LLMClient, generate };
};

const options = {
  questionPrompt: PromptTemplate.fromTemplate<{ text: string }>('Q:{text}'),
  refinePrompt: PromptTemplate.fromTemplate<{ existing_answer: string; text: string }>(
    'R:{existing_answer}+{text}',
  ),
};

describe('summarizeDocuments', () => {
  it('returns an empty summary without documents', async () => {
    const { client, generate } = createClient();
    expect(await summarizeDocuments(client, [], options)).toBe('');
    expect(generate).not.toHaveBeenCalled();
  });

  it('feeds the running summary into every refine step', async () => {
    const { client, generate } = createClient();
    const documents = ['a', 'b', 'c'].map((pageContent) => ({ pageContent }));

    expect(await summarizeDocuments(client, documents, options)).toBe(
      'summary(R:summary(R:summary(Q:a)+b)+c)',
    );
    expect(generate).toHaveBeenCalledTimes(3);
  });
});
