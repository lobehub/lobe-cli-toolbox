import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import Tabs from './index';

describe('Tabs', () => {
  it('render', () => {
    const { lastFrame } = render(
      <Tabs
        activeKey={2}
        items={[
          { children: <Text>one</Text>, key: 1 },
          { children: <Text>two</Text>, key: 2 },
        ]}
      />,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('two')).toEqual(true);
  });
});
