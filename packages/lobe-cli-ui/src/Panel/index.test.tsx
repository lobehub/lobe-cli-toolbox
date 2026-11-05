import { Text } from 'ink';
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
