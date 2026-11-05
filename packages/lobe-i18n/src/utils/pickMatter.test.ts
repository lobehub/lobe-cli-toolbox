import { describe, expect, it } from 'vitest';

import { pickMatter } from './pickMatter';

describe('pickMatter', () => {
  it('picks the non-empty string values of the given keys', () => {
    const data = { description: '', order: 7, tags: ['a'], title: '标题' };
    expect(pickMatter(data, ['title', 'description', 'order', 'tags', 'missing'])).toEqual({
      title: '标题',
    });
  });

  it('picks nothing without keys', () => {
    expect(pickMatter({ title: '标题' })).toEqual({});
  });
});
