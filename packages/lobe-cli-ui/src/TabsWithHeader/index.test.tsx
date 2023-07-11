import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import TabsWithHeader from './index';

describe('TabsWithHeader', () => {
  it('render', () => {
    const { lastFrame } = render(
      <TabsWithHeader
        activeKey={2}
        items={[
          { children: <Text>one</Text>, key: 1, title: 'ONE' },
          { children: <Text>two</Text>, key: 2, title: 'TWO' },
        ]}
      />,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('two')).toEqual(true);
    expect(lastFrame()?.includes('TWO')).toEqual(true);
  });
});
