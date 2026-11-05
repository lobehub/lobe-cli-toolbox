import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

import { KEYS, press, tick } from '../test-utils';
import SearchSelect, { MultiSearchSelect } from './index';

const items = [
  { hint: 'Fix a bug', label: 'fix', value: 'fix' },
  { hint: 'Introduce new features', label: 'feat', value: 'feat' },
  { hint: 'Documentation', label: 'docs', value: 'docs' },
];

describe('SearchSelect', () => {
  it('filters as you type and selects the best match', async () => {
    const onSelect = vi.fn();
    const { stdin, lastFrame } = render(<SearchSelect items={items} onSelect={onSelect} />);
    await press(stdin, ...'doc');
    expect(lastFrame()).toContain('❯ docs');
    expect(lastFrame()).not.toContain('feat');

    await press(stdin, KEYS.enter);
    expect(onSelect).toHaveBeenCalledWith('docs');
  });

  it('offers the typed text as a custom value', async () => {
    const onSelect = vi.fn();
    const { stdin, lastFrame } = render(
      <SearchSelect allowCustom items={items} onSelect={onSelect} />,
    );
    await press(stdin, ...'fe');
    expect(lastFrame()).toContain('Use "fe"');

    await press(stdin, KEYS.down, KEYS.enter);
    expect(onSelect).toHaveBeenCalledWith('fe');
  });

  it('clears the query on esc before cancelling', async () => {
    const onCancel = vi.fn();
    const { stdin, lastFrame } = render(
      <SearchSelect items={items} onCancel={onCancel} onSelect={vi.fn()} />,
    );
    await press(stdin, 'x', KEYS.esc);
    expect(onCancel).not.toHaveBeenCalled();
    expect(lastFrame()).toContain('feat');

    await press(stdin, KEYS.esc);
    expect(onCancel).toHaveBeenCalled();
  });

  it('starts at initialValue', async () => {
    const onSelect = vi.fn();
    const { stdin } = render(
      <SearchSelect initialValue="feat" items={items} onSelect={onSelect} />,
    );
    await tick();
    await press(stdin, KEYS.enter);
    expect(onSelect).toHaveBeenCalledWith('feat');
  });
});

describe('MultiSearchSelect', () => {
  it('toggles with space and submits in item order', async () => {
    const onSubmit = vi.fn();
    const { stdin, lastFrame } = render(
      <MultiSearchSelect defaultValue={['docs']} items={items} onSubmit={onSubmit} />,
    );
    await press(stdin, ' ');
    expect(lastFrame()).toContain('◼ fix');

    await press(stdin, ...'feat', ' ', KEYS.enter);
    expect(onSubmit).toHaveBeenCalledWith(['fix', 'feat', 'docs']);
  });
});
