import 'isomorphic-fetch';
import { loadSummarizationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { execSync } from 'node:child_process';

import { CONFIG_NAME, default as storeConfig } from '@/constants/config';
import template from '@/constants/template';
import { addEmojiToMessage } from '@/utils/genCommitMessage';

const diffChunkSize: number | any = storeConfig.get(CONFIG_NAME.DIFF_CHUNK_SIZE) || 1000;
// const timeout: number | any = storeConfig.get(CONFIG_NAME.TIMEOUT) || 10_000;
const basePath: string | any = storeConfig.get(CONFIG_NAME.API_BASE_URL);
const openAIApiKey: string | any = storeConfig.get(CONFIG_NAME.OPENAI_TOKEN);

const chat = new ChatOpenAI(
  {
    maxRetries: 10,
    openAIApiKey,
    temperature: 0.5,
  },
  {
    basePath,
  },
);

interface GenAiCommitProps {
  cacheSummary?: string;
  setLoading: (state: boolean) => void;
  setLoadingInfo: (text: string) => void;
  setMessage: (text: string) => void;
  setSummary: (text: string) => void;
}

const genAiCommit = async ({
  setLoadingInfo,
  setMessage,
  setLoading,
  setSummary,
  cacheSummary,
}: GenAiCommitProps) => {
  setLoadingInfo(' Generating...');
  setLoading(true);
  if (!openAIApiKey) throw new Error('🤯 Please set the OpenAI Token by lobe-commit --config');

  let summary = cacheSummary;

  if (!summary) {
    let diff = execSync('git diff --staged', {
      maxBuffer: 1024 ** 6,
    }).toString();

    // STEP 1
    if (!diff) throw new Error('🤯 No changes to commit');
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: diffChunkSize });
    const diffDocument = await textSplitter.createDocuments([diff]);
    summary = diff;
    setLoadingInfo(
      ` [1/3] Split diff info to (${diffDocument.length}) by ${diffChunkSize} chunk size...`,
    );

    // STEP 2
    const chain = loadSummarizationChain(chat, { type: 'map_reduce' });
    setLoadingInfo(
      ` [2/3] Split diff info to (${diffDocument.length} * ${diffChunkSize} chunk-size), generate summary...`,
    );

    // STEP 3
    const diffSummary = await chain.call({
      input_documents: diffDocument,
    });
    if (!diffSummary['text']) throw new Error('🤯 Diff summary failed');
    summary = String(diffSummary['text']);
    setSummary(summary);
    setLoadingInfo(` [3/3] Generate commit message...`);
  }

  // STEP 4
  const res = await chat.call([
    new SystemMessage(template),
    new HumanMessage(
      `Return only 1 type commit message describes the git diff summary: ${summary}`,
    ),
  ]);
  if (!res['text']) throw new Error('🤯 Diff summary failed');

  const message = addEmojiToMessage(
    res['text'].replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
  );

  setMessage(message);
  setLoading(false);
};

export default genAiCommit;
