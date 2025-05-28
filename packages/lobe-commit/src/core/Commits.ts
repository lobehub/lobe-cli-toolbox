import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
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

  async genCommit({ setLoadingInfo, setSummary, cacheSummary }: GenAiCommitProps) {
    setLoadingInfo(' Generating...');

    // STEP 1
    const summary = cacheSummary || (await this.genSummary({ setLoadingInfo, setSummary }));

    // STEP 2
    const messages = await this.prompt.formatMessages({
      summary,
    });

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

  getDiff() {
    return execSync(
      'git diff --staged --ignore-all-space --diff-algorithm=minimal --function-context --no-ext-diff --no-color',
      {
        maxBuffer: 1024 ** 6,
      },
    ).toString();
  }
}
