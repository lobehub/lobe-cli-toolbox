import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getBundledSkillPath, installSkill } from '../../../common/skill';

let root: string;
let source: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'lobe-skill-'));
  source = join(root, 'SKILL.md');
  writeFileSync(source, '---\nname: demo\n---\n');
});

afterEach(() => {
  rmSync(root, { force: true, recursive: true });
});

describe('installSkill', () => {
  it('installs into .agents/skills by default', () => {
    const results = installSkill({ cwd: root, name: 'demo', source });

    expect(results.map(({ agent, status }) => [agent, status])).toEqual([['agents', 'created']]);
    expect(readFileSync(join(root, '.agents/skills/demo/SKILL.md'), 'utf8')).toContain(
      'name: demo',
    );
  });

  it('also installs for Claude Code when the project uses it', () => {
    mkdirSync(join(root, '.claude'));

    const results = installSkill({ cwd: root, name: 'demo', source });
    expect(results.map(({ agent }) => agent)).toEqual(['agents', 'claude']);
    expect(existsSync(join(root, '.claude/skills/demo/SKILL.md'))).toBe(true);
  });

  it('reports unchanged and updated installs', () => {
    installSkill({ agents: ['claude'], cwd: root, name: 'demo', source });
    expect(installSkill({ agents: ['claude'], cwd: root, name: 'demo', source })[0]?.status).toBe(
      'unchanged',
    );

    writeFileSync(source, '---\nname: demo\n---\nnew\n');
    expect(installSkill({ agents: ['claude'], cwd: root, name: 'demo', source })[0]?.status).toBe(
      'updated',
    );
  });

  it('ships a SKILL.md whose name matches the folder', () => {
    const path = getBundledSkillPath(new URL('../index.ts', import.meta.url).href, 'lobe-i18n');
    expect(readFileSync(path, 'utf8')).toMatch(/^---\nname: lobe-i18n\ndescription: /);
  });
});
