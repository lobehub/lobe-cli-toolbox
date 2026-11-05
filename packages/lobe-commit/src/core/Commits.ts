import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { LLMClient } from '@lobehub/cli-common/llm';
import type { ChatPromptTemplate } from '@lobehub/cli-common/promptTemplate';
import { getProviderConfigError } from '@lobehub/cli-common/providers';
import { summarizeDocuments } from '@lobehub/cli-common/summarize';
import { RecursiveCharacterTextSplitter } from '@lobehub/cli-common/textSplitter';
import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';

import { promptCommits, SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT } from '@/prompts/commits';
import { selectors } from '@/store';
import type { Config } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { compressDiff, DEFAULT_IGNORES, filterDiff } from '@/utils/diff';
import { addEmojiToMessage } from '@/utils/genCommitMessage';

export interface GenAiCommitProps {
  cacheSummary?: string;
  onStreamMessage?: (message: string) => void;
  onTokenUsage?: (tokenUsage: number) => void;
  setLoadingInfo: (text: string) => void;
  setSummary: (text: string) => void;
}

const formatMessage = (message: string) =>
  addEmojiToMessage(
    message.replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
  );

export class Commits {
  private client: LLMClient;
  private config: Config;
  prompt: ChatPromptTemplate<{ summary: string }>;

  constructor() {
    this.config = selectors.getCommitConfig();

    const provider = selectors.getProviderConfig();
    const error = getProviderConfigError(provider, chalk.bold.yellow('lobe-commit --option'));
    if (error) alert.error(error, true);

    this.client = new LLMClient(provider, { maxRetries: 10 });
    this.prompt = promptCommits();
  }

  async genCommit({
    setLoadingInfo,
    setSummary,
    cacheSummary,
    onStreamMessage,
    onTokenUsage,
  }: GenAiCommitProps) {
    setLoadingInfo(' Generating...');

    // STEP 1
    const summary = cacheSummary || (await this.genSummary({ setLoadingInfo, setSummary }));

    // STEP 2
    const messages = this.prompt.formatMessages({ summary });

    const inputTokens = calcToken(JSON.stringify(messages));
    const onText =
      this.config.stream && onStreamMessage
        ? (text: string) => onStreamMessage(formatMessage(text))
        : undefined;

    // 开始流式输出，先调用一次回调来切换UI状态
    onText?.('');

    const request = { messages, temperature: 0.5 };
    const { text, totalTokens } = onText
      ? await this.client.stream(request, onText)
      : await this.client.generate(request);

    if (!text) alert.error('Diff summary failed, please check your network or try again...', true);

    onTokenUsage?.(totalTokens || inputTokens + calcToken(text));

    return formatMessage(text);
  }

  async genSummary({
    setLoadingInfo,
    setSummary,
  }: Pick<GenAiCommitProps, 'setLoadingInfo' | 'setSummary'>) {
    const diff = this.getDiff();
    if (!diff.trim()) alert.warn('No changes to commit', true);

    const chunkSize = selectors.getDiffChunkTokens();
    if (calcToken(diff) <= chunkSize) return diff;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 0,
      chunkSize,
      lengthFunction: calcToken,
    });
    const documents = textSplitter.createDocuments([diff]);
    setLoadingInfo(
      ` [1/2] Summarizing diff in ${documents.length} chunks of ${chunkSize} tokens...`,
    );

    const summary = await summarizeDocuments(this.client, documents, {
      questionPrompt: SUMMARY_PROMPT,
      refinePrompt: SUMMARY_REFINE_PROMPT,
    });
    if (!summary)
      alert.error('Diff summary failed, please check your network or try again...', true);

    setLoadingInfo(' [2/2] Generating commit message...');
    setSummary(summary);
    return summary;
  }

  private getIgnorePatterns(): string[] {
    const ignoreFile = resolve(process.cwd(), '.lobecommitignore');
    if (!existsSync(ignoreFile)) return DEFAULT_IGNORES;

    const customIgnores = readFileSync(ignoreFile, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    return [...DEFAULT_IGNORES, ...customIgnores];
  }

  getDiff() {
    const rawDiff = execSync(
      'git diff --staged --ignore-all-space --diff-algorithm=minimal --function-context --no-ext-diff --no-color',
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );

    return compressDiff(filterDiff(rawDiff, this.getIgnorePatterns()));
  }
}
