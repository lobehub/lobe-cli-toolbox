import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import ConfigPanel from './index';

describe('ConfigPanel', () => {
  it('render', () => {
    const { lastFrame } = render(
      <ConfigPanel
        items={[
          {
            children: <Text>test</Text>,
            defaultValue: 100,
            key: 'timeout',
            label: 'Timeout',
            value: 200,
          },
        ]}
        logo="🤯"
        title="setting"
      />,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('Exit')).toEqual(true);
  });
});
