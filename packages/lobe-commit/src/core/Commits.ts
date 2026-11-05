import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { minimatch } from 'minimatch';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT, promptCommits } from '@/prompts/commits';
import { selectors } from '@/store';
import { Config } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { addEmojiToMessage } from '@/utils/genCommitMessage';

import { type ChatMessage, LLMClient } from '../../../common/llm';
import { ChatPromptTemplate } from '../../../common/promptTemplate';
import { getProviderConfigError } from '../../../common/providers';
import { loadSummarizationChain } from '../../../common/summarizationChain';
import { RecursiveCharacterTextSplitter } from '../../../common/textSplitter';

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
    const messages = await this.prompt.formatMessages({
      summary,
    });

    const inputTokens = calcToken(JSON.stringify(messages));
    const onText =
      this.config.stream && onStreamMessage
        ? (text: string) => onStreamMessage(formatMessage(text))
        : undefined;

    // 开始流式输出，先调用一次回调来切换UI状态
    onText?.('');

    const request = { messages: messages as ChatMessage[], temperature: 0.5 };
    const { text, totalTokens } = onText
      ? await this.client.stream(request, onText)
      : await this.client.generate(request);

    if (!text) alert.error('Diff summary failed, please check your network or try again...', true);

    onTokenUsage?.(totalTokens || inputTokens + calcToken(text));

    return formatMessage(text);
  }

  async checkDiffMaxToken(diff: string) {
    return calcToken(diff) > selectors.getDiffChunkTokens();
  }

  async genSummary({
    setLoadingInfo,
    setSummary,
  }: Pick<GenAiCommitProps, 'setLoadingInfo' | 'setSummary'>) {
    let summary: string;

    const diff = this.getDiff();
    const needSummary = await this.checkDiffMaxToken(diff);

    if (needSummary) {
      // STEP 1

      if (!diff) alert.warn('No changes to commit', true);

      const chunkSize = selectors.getDiffChunkTokens();
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 0,
        chunkSize,
        lengthFunction: (text) => calcToken(text),
      });
      const diffDocument = await textSplitter.createDocuments([diff]);
      summary = diff;
      setLoadingInfo(
        ` [1/3] Split diff info to (${diffDocument.length}) by ${chunkSize} chunk size...`,
      );

      // STEP 2
      const chain = loadSummarizationChain(this.client, {
        questionPrompt: SUMMARY_PROMPT,
        refinePrompt: SUMMARY_REFINE_PROMPT,
        type: 'refine',
      });
      setLoadingInfo(
        ` [2/3] Split diff info to (${diffDocument.length} * ${chunkSize} chunk-size), generate summary...`,
      );

      // STEP 3
      const diffSummary = await chain.call({
        input_documents: diffDocument,
      });

      if (!diffSummary['text'])
        alert.error('Diff summary failed, please check your network or try again...', true);

      summary = String(diffSummary['text']);

      setLoadingInfo(` [3/3] Generate commit message...`);
      setSummary(summary);
    } else {
      summary = diff;
    }

    return summary;
  }

  private getIgnorePatterns(): string[] {
    const ignoreFile = resolve(process.cwd(), '.lobecommitignore');
    const defaultIgnores = [
      '*-lock.*',
      '*.lock',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.png',
      '**/*.gif',
      '**/*.svg',
      '**/*.ico',
      '**/*.webp',
      '**/*.mp4',
      '**/*.mp3',
      '**/*.zip',
      '**/*.tar',
      '**/*.tar.gz',
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.min.js',
      '**/*.min.css',
    ];

    if (existsSync(ignoreFile)) {
      try {
        const customIgnores = readFileSync(ignoreFile, 'utf8')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'));
        return [...defaultIgnores, ...customIgnores];
      } catch (error) {
        console.warn('Failed to read .lobecommitignore file:', error);
      }
    }

    return defaultIgnores;
  }

  private filterDiffContent(diff: string): string {
    const ignorePatterns = this.getIgnorePatterns();
    const lines = diff.split('\n');
    const filteredLines: string[] = [];
    let shouldSkipFile = false;
    let currentFile = '';

    for (const line of lines) {
      // Detect file headers
      if (line.startsWith('diff --git')) {
        // Extract file path from "diff --git a/path/to/file b/path/to/file"
        const match = line.match(/diff --git a\/(.+?) b\/(.+)/);
        if (match && match[1]) {
          currentFile = match[1];
          // Create a closure to capture the current file value safely
          const fileToCheck = currentFile;
          shouldSkipFile = ignorePatterns.some((pattern) =>
            minimatch(fileToCheck, pattern, { dot: true }),
          );
        }
      }

      // If we're not skipping this file, include the line
      if (!shouldSkipFile) {
        filteredLines.push(line);
      }

      // Reset when we hit the next file or end of diff
      if (line.startsWith('diff --git') && filteredLines.length > 0) {
        shouldSkipFile = false;
      }
    }

    return filteredLines.join('\n');
  }

  private compressDiff(diff: string, maxLines: number = 200): string {
    const lines = diff.split('\n');

    if (lines.length <= maxLines) {
      return diff;
    }

    const headerLines: string[] = [];
    const contextLines: string[] = [];
    const changeLines: string[] = [];

    for (const line of lines) {
      if (
        line.startsWith('diff --git') ||
        line.startsWith('index ') ||
        line.startsWith('+++') ||
        line.startsWith('---')
      ) {
        headerLines.push(line);
      } else if (line.startsWith('+') || line.startsWith('-')) {
        changeLines.push(line);
      } else if (line.startsWith('@@')) {
        contextLines.push(line);
      } else if (
        (line.trim() === '' || line.startsWith(' ')) && // Only include context lines if we have room
        headerLines.length + changeLines.length + contextLines.length < maxLines * 0.8
      ) {
        contextLines.push(line);
      }
    }

    // Prioritize: headers > changes > context
    const result = [
      ...headerLines,
      ...changeLines.slice(0, Math.max(50, maxLines - headerLines.length - contextLines.length)),
      ...contextLines.slice(0, Math.max(20, maxLines - headerLines.length - changeLines.length)),
    ];

    if (result.length < lines.length) {
      result.push(`\n... (${lines.length - result.length} lines truncated for brevity) ...`);
    }

    return result.join('\n');
  }

  getDiff() {
    const rawDiff = execSync(
      'git diff --staged --ignore-all-space --diff-algorithm=minimal --function-context --no-ext-diff --no-color',
      {
        maxBuffer: 1024 ** 6,
      },
    ).toString();

    const filteredDiff = this.filterDiffContent(rawDiff);
    return this.compressDiff(filteredDiff);
  }
}
