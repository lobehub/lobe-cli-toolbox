import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { BorderView } from '@/index';

describe('BorderView', () => {
  it('render', () => {
    const { lastFrame } = render(
      <BorderView>
        <Text>children</Text>
      </BorderView>,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('children')).toEqual(true);
  });
});
