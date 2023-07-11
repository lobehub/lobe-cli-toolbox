import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { View } from '@/index';

describe('View', () => {
  it('render', () => {
    const { lastFrame } = render(
      <View>
        <Text>children</Text>
      </View>,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('children')).toEqual(true);
  });
});
