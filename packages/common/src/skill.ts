import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `.agents/skills` is the cross-agent location (Codex, Cursor, Copilot, Gemini CLI, OpenCode...),
 * Claude Code only reads `.claude/skills`.
 */
export const SKILL_AGENTS = {
  agents: '.agents/skills',
  claude: '.claude/skills',
} as const;

export type SkillAgent = keyof typeof SKILL_AGENTS;

export const skillAgents = Object.keys(SKILL_AGENTS) as SkillAgent[];

export const isSkillAgent = (value: string): value is SkillAgent =>
  Object.prototype.hasOwnProperty.call(SKILL_AGENTS, value);

export interface InstallSkillOptions {
  /**
   * Defaults to `.agents/skills`, plus `.claude/skills` when a `.claude` folder exists
   */
  agents?: SkillAgent[];
  cwd?: string;
  /**
   * Install into the home directory instead of the current project
   */
  global?: boolean;
  name: string;
  /**
   * Path of the bundled SKILL.md
   */
  source: string;
}

export interface InstalledSkill {
  agent: SkillAgent;
  path: string;
  status: 'created' | 'unchanged' | 'updated';
}

/**
 * Bundled skills live in `<package>/skills/<name>/SKILL.md`, next to both `src/` and `dist/`.
 */
export const getBundledSkillPath = (metaUrl: string, name: string) =>
  fileURLToPath(new URL(`../skills/${name}/SKILL.md`, metaUrl));

const findProjectRoot = (cwd: string) => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return cwd;
  }
};

export const installSkill = ({
  agents,
  cwd = process.cwd(),
  global,
  name,
  source,
}: InstallSkillOptions): InstalledSkill[] => {
  const root = global ? homedir() : findProjectRoot(cwd);
  const targets: SkillAgent[] =
    agents && agents.length > 0
      ? agents
      : existsSync(join(root, '.claude'))
        ? ['agents', 'claude']
        : ['agents'];
  const content = readFileSync(source, 'utf8');

  return targets.map((agent) => {
    const path = join(root, SKILL_AGENTS[agent], name, 'SKILL.md');
    const previous = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
    if (previous === content) return { agent, path, status: 'unchanged' };

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return { agent, path, status: previous === undefined ? 'created' : 'updated' };
  });
};
