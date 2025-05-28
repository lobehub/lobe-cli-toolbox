import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { minimatch } from 'minimatch';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';

import { SUMMARY_PROMPT, SUMMARY_REFINE_PROMPT, promptCommits } from '@/prompts/commits';
import { selectors } from '@/store';
import { Config } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { addEmojiToMessage } from '@/utils/genCommitMessage';

import { ModelTokens } from '../../../common/models';
import { ChatPromptTemplate } from '../../../common/promptTemplate';
import { loadSummarizationChain } from '../../../common/summarizationChain';
import { RecursiveCharacterTextSplitter } from '../../../common/textSplitter';

export interface GenAiCommitProps {
  cacheSummary?: string;
  onStreamMessage?: (message: string) => void;
  setLoadingInfo: (text: string) => void;
  setSummary: (text: string) => void;
}
export class Commits {
  private client: OpenAI;
  private config: Config;
  private textSplitter: RecursiveCharacterTextSplitter;
  prompt: ChatPromptTemplate<{ summary: string }>;

  constructor() {
    this.config = selectors.getCommitConfig();

    if (!this.config.openaiToken) {
      alert.error(
        `Please set the OpenAI Token by ${chalk.bold.yellow('lobe-commit --config')}`,
        true,
      );
    }

    this.client = new OpenAI({
      apiKey: this.config.openaiToken,
      baseURL: this.config.apiBaseUrl,
      maxRetries: 10,
    });
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkOverlap: 0,
      chunkSize: this.config.diffChunkSize,
      lengthFunction: (text) => calcToken(text),
    });
    this.prompt = promptCommits();
  }

  async genCommit({ setLoadingInfo, setSummary, cacheSummary, onStreamMessage }: GenAiCommitProps) {
    setLoadingInfo(' Generating...');

    // STEP 1
    const summary = cacheSummary || (await this.genSummary({ setLoadingInfo, setSummary }));

    // STEP 2
    const messages = await this.prompt.formatMessages({
      summary,
    });

    if (this.config.stream && onStreamMessage) {
      return this.genCommitStream(messages, onStreamMessage);
    } else {
      return this.genCommitNonStream(messages);
    }
  }

  private async genCommitStream(
    messages: any[],
    onStreamMessage: (message: string) => void,
  ): Promise<string> {
    // 开始流式输出，先调用一次回调来切换UI状态
    onStreamMessage('');

    const stream = await this.client.chat.completions.create({
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      model: this.config.modelName,
      stream: true,
      temperature: 0.5,
    });

    let fullMessage = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullMessage += content;
        // 实时更新显示的消息
        const processedMessage = addEmojiToMessage(
          fullMessage.replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
        );
        onStreamMessage(processedMessage);
      }
    }

    if (!fullMessage) {
      alert.error('Diff summary failed, please check your network or try again...', true);
    }

    return addEmojiToMessage(
      fullMessage.replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
    );
  }

  private async genCommitNonStream(messages: any[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      model: this.config.modelName,
      temperature: 0.5,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result)
      alert.error('Diff summary failed, please check your network or try again...', true);

    return addEmojiToMessage(
      result!.replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
    );
  }

  async checkDiffMaxToken(diff: string) {
    const prompt = await this.prompt.formatMessages({ summary: diff });
    const token = calcToken(JSON.stringify(prompt));
    return token > ModelTokens[this.config.modelName] - 1024;
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

      const diffDocument = await this.textSplitter.createDocuments([diff]);
      summary = diff;
      setLoadingInfo(
        ` [1/3] Split diff info to (${diffDocument.length}) by ${this.config.diffChunkSize} chunk size...`,
      );

      // STEP 2
      const chain = loadSummarizationChain(this.client, {
        questionPrompt: SUMMARY_PROMPT,
        refinePrompt: SUMMARY_REFINE_PROMPT,
        type: 'refine',
      });
      setLoadingInfo(
        ` [2/3] Split diff info to (${diffDocument.length} * ${this.config.diffChunkSize} chunk-size), generate summary...`,
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
