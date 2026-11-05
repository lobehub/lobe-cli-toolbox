import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

import { KEYS, press, tick } from '../test-utils';
import SelectInput from './index';

const items = [
  { label: 'First', value: 'first' },
  { hint: 'the second one', label: 'Second', value: 'second' },
  { label: 'Third', value: 'third' },
];

describe('SelectInput', () => {
  it('renders labels and hints with the first item highlighted', () => {
    const { lastFrame } = render(<SelectInput items={items} />);
    expect(lastFrame()).toContain('❯ First');
    expect(lastFrame()).toContain('the second one');
  });

  it('starts at initialValue and wraps around', async () => {
    const onSelect = vi.fn();
    const { stdin, lastFrame } = render(
      <SelectInput initialValue="third" items={items} onSelect={onSelect} />,
    );
    await tick();
    expect(lastFrame()).toContain('❯ Third');

    await press(stdin, KEYS.down, KEYS.enter);
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'first' }));

    await press(stdin, KEYS.up, KEYS.enter);
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'third' }));
  });

  it('reports the highlighted item, including the initial one', async () => {
    const onHighlight = vi.fn();
    const { stdin } = render(<SelectInput items={items} onHighlight={onHighlight} />);
    await tick();
    expect(onHighlight).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'first' }));

    await press(stdin, KEYS.down);
    expect(onHighlight).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'second' }));
  });

  it('scrolls a long list and shows how many items are hidden', async () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: String(i) }));
    const { stdin, lastFrame } = render(<SelectInput items={many} limit={5} />);
    expect(lastFrame()).toContain('↓ 15 more');

    await press(stdin, KEYS.up);
    expect(lastFrame()).toContain('❯ Item 19');
    expect(lastFrame()).toContain('↑ 15 more');
  });
});
