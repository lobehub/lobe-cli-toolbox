import { render } from 'ink-testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCommitStore } from '@/store/commitStore';

import Commit from './index';

vi.mock('@/utils/getIssuesList', () => ({
  default: vi.fn(async () => ({ error: 'NO_TOKEN', success: false })),
}));

const ENTER = '\r';
const ESC = '\u001B';
const BACKSPACE = '\u007F';

const tick = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 20);
  });

const press = async (stdin: { write: (data: string) => void }, ...keys: string[]) => {
  for (const key of keys) {
    stdin.write(key);
    await tick();
  }
};

const initialState = useCommitStore.getState();

beforeEach(() => {
  useCommitStore.setState(initialState, true);
});

describe('Commit wizard', () => {
  it('builds a message step by step and goes back with esc', async () => {
    const { stdin, lastFrame, frames } = render(<Commit />);
    await tick();
    expect(lastFrame()).toContain('Commit type');

    await press(stdin, ...'fix', ENTER);
    expect(lastFrame()).toContain('◇  Type');
    expect(lastFrame()).toContain('Scope');

    await press(stdin, ...'Api Client', ENTER);
    expect(lastFrame()).toContain('api-client');

    await press(stdin, ENTER);
    expect(lastFrame()).toContain('The subject can not be empty');

    await press(stdin, ESC);
    expect(lastFrame()).toContain('Search or type a scope');

    await press(stdin, ENTER, ...'handle 404', ENTER);
    expect(lastFrame()).toContain('Link issues');
    expect(lastFrame()).toContain('Add a GitHub token');

    await press(stdin, ...'12', BACKSPACE, '3', ENTER);
    expect(lastFrame()).toContain('How do these issues relate?');

    await press(stdin, '\u001B[B', ENTER);
    const outro = frames.findLast((frame) => frame.trim());
    expect(outro).toContain('🐛 fix(api-client): Handle 404 (close #13)');
    expect(outro).toContain('Running git commit');
  });

  it('cancels from the first step', async () => {
    const { stdin, frames } = render(<Commit />);
    await press(stdin, ESC);
    expect(frames.findLast((frame) => frame.trim())).toContain('Cancelled');
  });
});
