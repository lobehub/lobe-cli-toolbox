import { alert } from '@lobehub/cli-ui';
import { homedir } from 'node:os';
import { relative } from 'node:path';

import { type SkillAgent, getBundledSkillPath, installSkill } from './skill';

export interface SkillFlags {
  agent?: SkillAgent[];
  global?: boolean;
}

const AGENT_HINT: Record<SkillAgent, string> = {
  agents: 'Codex, Cursor, Copilot, Gemini CLI, OpenCode...',
  claude: 'Claude Code',
};

const displayPath = (path: string, global?: boolean) =>
  global ? path.replace(homedir(), '~') : relative(process.cwd(), path) || path;

export const runSkillInstall = (name: string, metaUrl: string, flags: SkillFlags = {}) => {
  try {
    const results = installSkill({
      agents: flags.agent,
      global: flags.global,
      name,
      source: getBundledSkillPath(metaUrl, name),
    });
    for (const { agent, path, status } of results) {
      alert.success(`${status} ${displayPath(path, flags.global)} (${AGENT_HINT[agent]})`);
    }
  } catch (error) {
    alert.error(`Failed to install the ${name} skill: ${(error as Error).message}`, true);
  }
};
