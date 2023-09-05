import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import Panel from './index';

describe('Panel', () => {
  it('render', () => {
    const { lastFrame } = render(
      <Panel footer={<Text>footer</Text>} title="title">
        <Text>body</Text>
      </Panel>,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('body')).toEqual(true);
  });
  it('reverse', () => {
    const { lastFrame } = render(
      <Panel footer={<Text>footer</Text>} reverse title="title">
        <Text>reverse</Text>
      </Panel>,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('reverse')).toEqual(true);
  });
});
