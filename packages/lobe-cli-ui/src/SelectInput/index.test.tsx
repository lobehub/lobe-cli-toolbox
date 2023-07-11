import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { SelectInput } from '@/index';

describe('Tabs', () => {
  it('render', () => {
    const { lastFrame } = render(
      <SelectInput
        items={[
          {
            label: 'First',
            value: 'first',
          },
          {
            label: 'Second',
            value: 'second',
          },
        ]}
      />,
    );
    console.log(lastFrame());
    expect(lastFrame()?.includes('Second')).toEqual(true);
  });
});
