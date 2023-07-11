import 'isomorphic-fetch';
import { loadSummarizationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { execSync } from 'node:child_process';

import { CONFIG_NAME, default as storeConfig } from '@/constants/config';
import gitmojis from '@/constants/gitmojis';

import template from './template';

const diffChunkSize: number | any = storeConfig.get(CONFIG_NAME.DIFF_CHUNK_SIZE) || 1000;
// const timeout: number | any = storeConfig.get(CONFIG_NAME.TIMEOUT) || 10_000;
const basePath: string | any = storeConfig.get(CONFIG_NAME.API_BASE_URL);
const openAIApiKey: string | any = storeConfig.get(CONFIG_NAME.OPENAI_TOKEN);
const addEmoji = (message: string) => {
  const [type, ...rest]: any = message.split(': ');
  let emoji: string = '🔧';
  for (const item of gitmojis) {
    if (type.includes(item.type)) emoji = item.emoji;
  }
  return `${emoji} ${type}: ${rest.join(': ')}`;
};

export default async () => {
  if (!openAIApiKey) throw new Error('🤯 Please set the OpenAI Token by lobe-commit --config');

  let diff = execSync('git diff --staged', {
    maxBuffer: 1024 ** 6,
  }).toString();

  if (!diff) throw new Error('🤯 No changes to commit');

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
  console.time(' ✅  Split diff info');
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: diffChunkSize });
  const diffDocument = await textSplitter.createDocuments([diff]);
  console.timeEnd(' ✅  Split diff info');
  console.time(' ✅  Generate diff summary');
  const chain = loadSummarizationChain(chat, { type: 'map_reduce' });
  const diffSummary = await chain.call({
    input_documents: diffDocument,
  });
  if (!diffSummary['text']) throw new Error('🤯 Diff summary failed');
  console.timeEnd(' ✅  Generate diff summary');
  const res = await chat.call([
    new SystemMessage(template),
    new HumanMessage(
      `Return only 1 type commit message describes the git diff summary: ${diffSummary['text']}`,
    ),
  ]);

  if (!res['text']) throw new Error('🤯 Diff summary failed');

  return addEmoji(
    res['text'].replace(/\((.*?)\):/, (match, p1) => match && `(${p1.toLowerCase()}):`),
  );
};
