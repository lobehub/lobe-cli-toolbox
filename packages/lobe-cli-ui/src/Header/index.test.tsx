import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';

import { Header } from '@/index';

describe('Header', () => {
  it('render', () => {
    const { lastFrame } = render(<Header title="title" />);
    console.log(lastFrame());
    expect(lastFrame()?.includes('title')).toEqual(true);
  });
});
