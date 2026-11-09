import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import Panel, { StepSummary } from './index';

describe('Panel', () => {
  it('renders the title, a rail along the body and the key hints', () => {
    const { lastFrame } = render(
      <Panel
        subtitle="1/4"
        title="Select type"
        hints={[
          ['enter', 'confirm'],
          ['esc', 'back'],
        ]}
      >
        <Text>body</Text>
      </Panel>,
    );
    const frame = lastFrame()!;
    expect(frame).toContain('◆  Select type  1/4');
    expect(frame).toContain('│  body');
    expect(frame).toContain('└  enter confirm · esc back');
  });

  it('renders nothing when hidden', () => {
    const { lastFrame } = render(
      <Panel show={false} title="hidden">
        <Text>body</Text>
      </Panel>,
    );
    expect(lastFrame()).toBe('');
  });
});

describe('StepSummary', () => {
  it('shows a dash for empty values', () => {
    const { lastFrame } = render(<StepSummary label="Scope" />);
    expect(lastFrame()).toContain('◇  Scope');
    expect(lastFrame()).toContain('—');
  });
});

describe('Panel status icons and rail ends', () => {
  it('warning uses triangle not warning-sign emoji', () => {
    const { lastFrame } = render(
      <Panel status="warning" title="Warning step">
        <Text>Check the remote</Text>
      </Panel>,
    );
    const frame = lastFrame()!;
    expect(frame).toContain('▲  Warning step');
    expect(frame).not.toContain('⚠');
    expect(frame).toContain('└');
  });

  it('error panel keeps the bottom corner', () => {
    const { lastFrame } = render(
      <Panel status="error" title="Error step">
        <Text>Something failed</Text>
      </Panel>,
    );
    const frame = lastFrame()!;
    expect(frame).toContain('▲  Error step');
    expect(frame).toMatch(/│\s+Something failed/);
    expect(frame.trimEnd().endsWith('└') || frame.includes('\n└')).toBe(true);
    const lines = frame.replaceAll('\r', '').split('\n').filter(Boolean);
    expect(lines.at(-1)).toContain('└');
  });

  it('status stack keeps a corner under every panel including the last error', () => {
    const { lastFrame } = render(
      <Box flexDirection="column">
        <Panel status="active" title="Active step">
          <Text>Working…</Text>
        </Panel>
        <Panel status="done" title="Done step">
          <Text>Saved</Text>
        </Panel>
        <Panel status="warning" title="Warning step">
          <Text>Check the remote</Text>
        </Panel>
        <Panel status="error" title="Error step">
          <Text>Something failed</Text>
        </Panel>
      </Box>,
    );
    const frame = lastFrame()!;
    expect(frame).toContain('◆  Active step');
    expect(frame).toContain('◇  Done step');
    expect(frame).toContain('▲  Warning step');
    expect(frame).toContain('▲  Error step');
    expect(frame).not.toContain('⚠');
    const corners = [...frame.matchAll(/└/g)];
    expect(corners.length).toBe(4);
    expect(frame.replaceAll('\r', '').trimEnd().split('\n').at(-1)).toContain('└');
  });
});
