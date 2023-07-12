import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { SplitView } from '@/index';

describe('SplitView', () => {
  it('render', () => {
    const { lastFrame } = render(
      <SplitView>
        <Text>children</Text>
      </SplitView>,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('children')).toEqual(true);
  });
});
