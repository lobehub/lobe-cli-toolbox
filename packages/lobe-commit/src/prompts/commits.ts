import { ChatPromptTemplate, PromptTemplate } from '@lobehub/cli-common/promptTemplate';

import gitmojis from '@/constants/gitmojis';
import { selectors } from '@/store';

export const DEFAULT_PROMPT = [
  `You are an expert developer assistant specialized in generating high-quality Git commit messages.`,
  `Your mission is to create clean, comprehensive, and meaningful commit messages following the conventional commit convention.`,
  ``,
  `## Core Principles:`,
  `- Explain WHAT changes were made and WHY they were necessary`,
  `- Use present tense, imperative mood (e.g., "Add feature" not "Added feature")`,
  `- Be concise but descriptive`,
  `- Focus on the business impact and technical significance`,
  ``,
  `## Git Diff Analysis:`,
  `Analyze the provided git diff and identify:`,
  `1. The type of change (feature, fix, refactor, etc.)`,
  `2. The scope/area affected`,
  `3. The main purpose and impact`,
  `4. Any breaking changes or important details`,
  ``,
  `## Response Format:`,
  `Return ONLY the commit message without any explanations or metadata.`,
  `The message should be clear enough that another developer can understand the change without reading the diff.`,
].join('\n');

const CONTEXT_AWARENESS_PROMPT = [
  `## Context Clues to Consider:`,
  `- File paths indicate the module/component affected`,
  `- Added/removed lines show the nature of changes`,
  `- Function/method names reveal the functionality involved`,
  `- Comments and documentation changes indicate intent`,
  `- Test file changes suggest the feature being tested`,
].join('\n');

const TYPES_EXAMPLE = gitmojis.map((item) => `- ${item.type}: ${item.desc}`).join('\n');

export const promptCommits = () => {
  const { includeWhy, locale, maxLength, prompt } = selectors.getCommitConfig();

  return ChatPromptTemplate.fromMessages<{ summary: string }>([
    [
      'system',
      [
        prompt || DEFAULT_PROMPT,
        ``,
        CONTEXT_AWARENESS_PROMPT,
        ``,
        `## Rules and Constraints:`,
        `- Choose ONLY 1 type from the type-to-description below: <${TYPES_EXAMPLE}>`,
        `- Commit message must be a maximum of ${maxLength} characters`,
        `- Lines must not be longer than 74 characters`,
        `- Use clear, professional language`,
        locale && `- Write the commit message in: ${locale}`,
        includeWhy &&
          `- Include a brief explanation of WHY the change was made after the main message`,
        `- Avoid redundant phrases like "This commit" or "This change"`,
        `- Focus on user/business value when applicable`,
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    [
      'user',
      [
        `Please analyze the following git diff and generate a single, well-crafted commit message:`,
        ``,
        `{summary}`,
        ``,
        `Remember: Return ONLY the commit message, formatted according to conventional commits with the appropriate emoji prefix.`,
      ].join('\n'),
    ],
  ]);
};

const SUMMARY_TEMPLATE = [
  `You are an expert at analyzing code changes and creating meaningful summaries.`,
  `Your task is to analyze the git diff and extract the key information needed for generating a commit message.`,
  ``,
  `Focus on:`,
  `- What files were changed and their purpose`,
  `- What functionality was added, modified, or removed`,
  `- The technical approach used`,
  `- Any architectural or design decisions`,
  ``,
  `--------`,
  `{text}`,
  `--------`,
  ``,
  `Provide a clear, technical summary that highlights the most important changes and their context.`,
  `This summary will be used to generate a commit message, so focus on actionable information.`,
].join('\n');

const REFINE_TEMPLATE = [
  `You are an expert at analyzing code changes and creating meaningful summaries.`,
  `The diff is too large to read at once, so it is summarized one part at a time.`,
  ``,
  `Summary of the previous parts:`,
  `--------`,
  `{existing_answer}`,
  `--------`,
  ``,
  `Next part of the git diff:`,
  `--------`,
  `{text}`,
  `--------`,
  ``,
  `Refine the summary so it covers every part seen so far.`,
  `- Keep technical accuracy while being concise`,
  `- Highlight breaking changes or important behavioral modifications`,
  `- This summary will be used to generate a commit message, so focus on actionable information`,
].join('\n');

export const SUMMARY_PROMPT = PromptTemplate.fromTemplate<{ text: string }>(SUMMARY_TEMPLATE);
export const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate<{
  existing_answer: string;
  text: string;
}>(REFINE_TEMPLATE);
