import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

import SelectInput from '../SelectInput';
import { KEYS, press } from '../test-utils';
import { TextField } from '../TextInput';
import ConfigPanel, { type ConfigPanelItem } from './index';

const createItems = (onSave: (value: string) => void): ConfigPanelItem[] => [
  {
    desc: 'Request timeout in ms',
    key: 'timeout',
    label: 'Timeout',
    modified: true,
    render: (close) => (
      <TextField
        defaultValue="200"
        validate={(v) => (Number(v) > 0 ? undefined : 'Must be a positive number')}
        onSubmit={(v) => {
          onSave(v);
          close(true);
        }}
      />
    ),
    value: 200,
  },
  { key: 'token', label: 'Token', render: () => null, secret: true, value: 'sk-123' },
];

describe('ConfigPanel', () => {
  it('lists values, hides secrets and describes the highlighted item', () => {
    const { lastFrame } = render(<ConfigPanel items={createItems(vi.fn())} title="Settings" />);
    const frame = lastFrame()!;
    expect(frame).toContain('200 •');
    expect(frame).toContain('••••••••');
    expect(frame).not.toContain('sk-123');
    expect(frame).toContain('Request timeout in ms');
  });

  it('edits an item, validates it and returns with a notice', async () => {
    const onSave = vi.fn();
    const { stdin, lastFrame } = render(
      <ConfigPanel items={createItems(onSave)} title="Settings" />,
    );

    await press(stdin, KEYS.enter);
    expect(lastFrame()).toContain('◆  Timeout');

    await press(stdin, '\u007F', '\u007F', '\u007F', KEYS.enter);
    expect(lastFrame()).toContain('Must be a positive number');
    expect(onSave).not.toHaveBeenCalled();

    await press(stdin, ...'500', KEYS.enter);
    expect(onSave).toHaveBeenCalledWith('500');
    expect(lastFrame()).toContain('✔ Timeout saved');
  });

  it('goes back to the list on esc', async () => {
    const { stdin, lastFrame } = render(
      <ConfigPanel items={createItems(vi.fn())} title="Settings" />,
    );
    await press(stdin, KEYS.down, KEYS.enter, KEYS.esc);
    expect(lastFrame()).toContain('◆  Settings');
    expect(lastFrame()).toContain('❯ Token');
  });

  it('keeps the edited item highlighted when an editor uses a SelectInput too', async () => {
    const items: ConfigPanelItem[] = [
      { key: 'a', label: 'Alpha', render: () => null, value: 'x' },
      {
        key: 'mode',
        label: 'Mode',
        render: (close) => (
          <SelectInput
            items={[
              { label: 'Fast', value: 'fast' },
              { label: 'Slow', value: 'slow' },
            ]}
            onSelect={() => close(true)}
          />
        ),
        value: 'fast',
      },
    ];
    const { stdin, lastFrame } = render(<ConfigPanel items={items} title="Settings" />);
    await press(stdin, KEYS.down, KEYS.enter);
    expect(lastFrame()).toContain('❯ Fast');

    await press(stdin, KEYS.down, KEYS.enter);
    expect(lastFrame()).toContain('❯ Mode');
    expect(lastFrame()).toContain('✔ Mode saved');
  });
});
