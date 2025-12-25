#!/usr/bin/env ts-node
import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AIChatModelCard {
  contextWindowTokens: number;
  displayName: string;
  enabled?: boolean;
  id: string;
  maxOutput?: number;
  type: 'chat';
}

const LOBE_CHAT_CONFIG_URL =
  'https://raw.githubusercontent.com/lobehub/lobe-chat/refs/heads/next/packages/model-bank/src/aiModels/openai.ts';
const MODELS_FILE_PATH = path.join(__dirname, '../packages/common/models.ts');

/**
 * 从 URL 获取内容
 */
function fetchContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * 解析 TypeScript 配置文件内容，提取 openaiChatModels
 */
function parseOpenAIConfig(content: string): AIChatModelCard[] {
  const models: AIChatModelCard[] = [];

  // 查找 openaiChatModels 数组的开始
  const arrayStartMatch = content.match(
    /export const openaiChatModels:\s*AIChatModelCard\[]\s*=\s*\[/,
  );
  if (!arrayStartMatch) {
    throw new Error('无法找到 openaiChatModels 数组定义');
  }

  const arrayStartIndex = arrayStartMatch.index! + arrayStartMatch[0].length;

  // 找到数组的结束位置（匹配括号）
  let bracketCount = 1;
  let currentIndex = arrayStartIndex;
  let arrayEndIndex = -1;

  while (currentIndex < content.length && bracketCount > 0) {
    const char = content[currentIndex];
    if (char === '[') bracketCount++;
    else if (char === ']') bracketCount--;

    if (bracketCount === 0) {
      arrayEndIndex = currentIndex;
      break;
    }
    currentIndex++;
  }

  if (arrayEndIndex === -1) {
    throw new Error('无法找到 openaiChatModels 数组的结束位置');
  }

  // 提取数组内容
  // eslint-disable-next-line unicorn/prefer-string-slice
  const arrayContent = content.substring(arrayStartIndex, arrayEndIndex);

  // 使用更精确的正则表达式来匹配每个模型对象
  const modelObjectRegex = /{\s*abilities:[\S\s]*?},(?=\s*{|\s*$)/g;
  const matches = arrayContent.match(modelObjectRegex);

  if (!matches) {
    console.log('数组内容:', arrayContent.slice(0, 500) + '...');
    throw new Error('无法找到模型配置对象');
  }

  for (const modelStr of matches) {
    try {
      // 提取 id
      const idMatch = modelStr.match(/id:\s*["'`]([^"'`]+)["'`]/);
      if (!idMatch) continue;
      const id = idMatch[1];

      // 提取 displayName
      const displayNameMatch = modelStr.match(/displayName:\s*["'`]([^"'`]+)["'`]/);
      if (!displayNameMatch) continue;
      const displayName = displayNameMatch[1];

      // 提取 contextWindowTokens
      const contextTokensMatch = modelStr.match(/contextWindowTokens:\s*([\d,_]+)/);
      if (!contextTokensMatch || !contextTokensMatch[1]) continue;
      // @ts-ignore
      const contextTokens = Number.parseInt(contextTokensMatch[1].replaceAll(/[,_]/g, ''));

      // 提取 maxOutput (可选)
      const maxOutputMatch = modelStr.match(/maxOutput:\s*([\d,_]+)/);
      const maxOutput = maxOutputMatch?.[1]
        ? Number.parseInt(maxOutputMatch[1].replaceAll(/[,_]/g, ''))
        : undefined;

      // 提取 enabled (可选，默认为 true)
      const enabledMatch = modelStr.match(/enabled:\s*(true|false)/);
      const enabled = enabledMatch ? enabledMatch[1] === 'true' : true;

      // 确保必需的字段不为 undefined
      if (!displayName || !id) continue;

      models.push({
        contextWindowTokens: contextTokens,
        displayName,
        enabled,
        id,
        maxOutput,
        type: 'chat',
      });
    } catch (error) {
      console.warn(`解析模型对象时出错: ${error}`);
      continue;
    }
  }

  return models;
}

/**
 * 将模型 ID 转换为枚举名称
 */
function modelIdToEnumName(id: string): string {
  return id.toUpperCase().replaceAll('-', '_').replaceAll('.', '_').replaceAll('+', '_PLUS');
}

/**
 * 生成新的 models.ts 文件内容
 */
function generateModelsFile(models: AIChatModelCard[]): string {
  const header = `// refs: https://github.com/lobehub/lobe-chat/blob/main/src/config/modelProviders/openai.ts
// Auto-generated file. Do not edit manually.
// Last updated: ${new Date().toISOString()}

`;

  // 生成枚举
  const enumEntries = models
    .filter((model) => model.enabled !== false)
    .map((model) => {
      const enumName = modelIdToEnumName(model.id);
      return `  /**
   * ${model.displayName}
   */
  ${enumName} = '${model.id}',`;
    })
    .join('\n');

  const enumSection = `export enum LanguageModel {
${enumEntries}
}

`;

  // 生成 token 映射
  const tokenEntries = models
    .filter((model) => model.enabled !== false)
    .map((model) => {
      const enumName = modelIdToEnumName(model.id);
      return `  [LanguageModel.${enumName}]: ${model.contextWindowTokens.toLocaleString().replaceAll(',', '_')},`;
    })
    .join('\n');

  const tokenSection = `export const ModelTokens: Record<LanguageModel, number> = {
${tokenEntries}
};

`;

  // 设置默认模型（选择最新的 mini 模型）
  const defaultModelCandidate =
    models.find((m) => m.id === 'o4-mini') ||
    models.find((m) => m.id === 'gpt-4.1-mini') ||
    models.find((m) => m.id === 'gpt-4o-mini') ||
    models.find((m) => m.id === 'o3-mini') ||
    models[0];

  if (!defaultModelCandidate) {
    throw new Error('没有找到可用的默认模型');
  }

  const defaultModelEnum = modelIdToEnumName(defaultModelCandidate.id);
  const defaultSection = `export const defaultModel = LanguageModel.${defaultModelEnum};
`;

  return header + enumSection + tokenSection + defaultSection;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始更新模型配置...');

    // 1. 获取远程配置
    console.log('📥 获取 LobeChat OpenAI 配置...');
    const content = await fetchContent(LOBE_CHAT_CONFIG_URL);

    // 2. 解析配置
    console.log('🔍 解析模型配置...');
    const models = parseOpenAIConfig(content);
    console.log(`✅ 找到 ${models.length} 个聊天模型`);

    // 3. 生成新文件内容
    console.log('📝 生成新的 models.ts 文件...');
    const newContent = generateModelsFile(models);

    // 4. 写入文件
    console.log('💾 写入文件...');
    fs.writeFileSync(MODELS_FILE_PATH, newContent, 'utf8');

    console.log('✅ 模型配置更新完成！');
    console.log(`📁 文件位置: ${MODELS_FILE_PATH}`);

    // 显示更新的模型列表
    console.log('\n📋 更新的模型列表:');
    for (const model of models.filter((model) => model.enabled !== false)) {
      console.log(`  - ${model.displayName} (${model.id})`);
    }
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
}

const run = async () => {
  if (require.main === module) {
    await main();
  }
};

// 运行脚本
run();
