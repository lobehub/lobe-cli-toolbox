import { describe, expect, it } from 'vitest';

import { diff } from './diffJson';

describe('diffJson', () => {
  describe('diff', () => {
    it('should detect added keys', () => {
      const entry = {
        key1: 'value1',
        key2: 'value2',
        newKey: 'newValue',
      };
      const target = {
        key1: 'value1',
        key2: 'value2',
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(1);
      expect(result.add[0]).toEqual({
        op: 'add',
        path: ['newKey'],
        value: 'newValue',
      });
      expect(result.entry).toEqual({ newKey: 'newValue' });
    });

    it('should detect removed keys', () => {
      const entry = {
        key1: 'value1',
      };
      const target = {
        key1: 'value1',
        key2: 'value2',
      };

      const result = diff(entry, target);

      expect(result.remove).toHaveLength(1);
      expect(result.remove[0]).toEqual({
        op: 'remove',
        path: ['key2'],
      });
      expect(result.target).toEqual({ key1: 'value1' });
    });

    it('should handle nested objects', () => {
      const entry = {
        level1: {
          level2: {
            key1: 'value1',
            newKey: 'newValue',
          },
        },
      };
      const target = {
        level1: {
          level2: {
            key1: 'value1',
          },
        },
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(1);
      expect(result.add[0]).toEqual({
        op: 'add',
        path: ['level1', 'level2', 'newKey'],
        value: 'newValue',
      });
      expect(result.entry).toEqual({
        level1: {
          level2: {
            newKey: 'newValue',
          },
        },
      });
    });

    it('should flatten nested paths when keyStyle is flat', () => {
      const entry = {
        a: {
          bc: {
            b: 'value',
          },
        },
      };
      const target = {
        a: {
          bc: {},
        },
      };

      const result = diff(entry, target, { keyStyle: 'flat' });

      expect(result.entry).toEqual({
        'a.bc.b': 'value',
      });
    });

    it('should keep array indexes out of flat keys', () => {
      const entry = {
        'faq.list': [{ q: 'First' }, { q: 'Second' }, { q: 'Third' }],
        'faq.title': 'FAQ',
      };
      const target = {
        'faq.list': [{ q: '第一' }],
        'faq.title': '常见问题',
      };

      const result = diff(entry, target, { keyStyle: 'flat' });

      expect(result.entry).toEqual({
        'faq.list': { '1': { q: 'Second' }, '2': { q: 'Third' } },
      });
    });

    it('should preserve mixed keys when keyStyle is auto', () => {
      const entry = {
        'a.bc.b': 'value',
        'nested': {
          key: 'value2',
        },
      };
      const target = {};

      const result = diff(entry, target, { keyStyle: 'auto' });

      expect(result.entry).toEqual({
        'a.bc.b': 'value',
        'nested': {
          key: 'value2',
        },
      });
    });

    it('should handle mixed add and remove operations', () => {
      const entry = {
        common: 'value',
        nested: {
          addedKey: 'addedValue',
        },
        newKey: 'newValue',
      };
      const target = {
        common: 'value',
        nested: {
          existingKey: 'existingValue',
        },
        removedKey: 'removedValue',
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(2);
      expect(result.remove).toHaveLength(2);

      // Check added items
      expect(result.add).toContainEqual({
        op: 'add',
        path: ['newKey'],
        value: 'newValue',
      });
      expect(result.add).toContainEqual({
        op: 'add',
        path: ['nested', 'addedKey'],
        value: 'addedValue',
      });

      // Check removed items
      expect(result.remove).toContainEqual({
        op: 'remove',
        path: ['removedKey'],
      });
      expect(result.remove).toContainEqual({
        op: 'remove',
        path: ['nested', 'existingKey'],
      });

      // Check resulting objects
      expect(result.target).toEqual({
        common: 'value',
        nested: {},
      });
      expect(result.entry).toEqual({
        nested: {
          addedKey: 'addedValue',
        },
        newKey: 'newValue',
      });
    });

    it('should handle identical objects', () => {
      const entry = {
        key1: 'value1',
        key2: 'value2',
      };
      const target = {
        key1: 'value1',
        key2: 'value2',
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toHaveLength(0);
      expect(result.target).toEqual(target);
      expect(result.entry).toEqual({});
    });

    it('should handle empty objects', () => {
      const entry = {};
      const target = {};

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toHaveLength(0);
      expect(result.target).toEqual({});
      expect(result.entry).toEqual({});
    });

    it('should handle entry being empty', () => {
      const entry = {};
      const target = {
        key1: 'value1',
        key2: 'value2',
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toHaveLength(2);
      expect(result.target).toEqual({});
      expect(result.entry).toEqual({});
    });

    it('should handle target being empty', () => {
      const entry = {
        key1: 'value1',
        key2: 'value2',
      };
      const target = {};

      const result = diff(entry, target);

      expect(result.add).toHaveLength(2);
      expect(result.remove).toHaveLength(0);
      expect(result.target).toEqual({});
      expect(result.entry).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should not mutate original objects', () => {
      const entry = {
        key1: 'value1',
        newKey: 'newValue',
      };
      const target = {
        key1: 'value1',
        removedKey: 'removedValue',
      };

      const originalEntry = structuredClone(entry);
      const originalTarget = structuredClone(target);

      diff(entry, target);

      expect(entry).toEqual(originalEntry);
      expect(target).toEqual(originalTarget);
    });

    it('should handle arrays in objects', () => {
      const entry = {
        array: [1, 2, 3, 4],
      };
      const target = {
        array: [1, 2, 3],
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(1);
      expect(result.add[0]).toEqual({
        op: 'add',
        path: ['array', 3],
        value: 4,
      });
      expect(result.entry).toEqual({ array: { '3': 4 } });
      expect(result.target).toEqual({ array: [1, 2, 3] });
    });

    it('should truncate extra tail items without leaving holes', () => {
      const entry = {
        array: [1, 2],
      };
      const target = {
        array: [1, 2, 3, 4],
      };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toEqual([
        { op: 'remove', path: ['array', 3] },
        { op: 'remove', path: ['array', 2] },
      ]);
      expect(result.target).toEqual({ array: [1, 2] });
      expect(result.entry).toEqual({});
    });

    it('should not treat translated strings as new work', () => {
      const entry = { title: 'Hello', tips: ['A', 'B'] };
      const target = { title: '你好', tips: ['甲', '乙'] };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toHaveLength(0);
      expect(result.entry).toEqual({});
      expect(result.target).toEqual(target);
    });

    it('should drop removed object keys and keep remaining translations', () => {
      const entry = { title: 'Hello' };
      const target = { gone: '已删除', title: '你好' };

      const result = diff(entry, target);

      expect(result.add).toHaveLength(0);
      expect(result.remove).toEqual([{ op: 'remove', path: ['gone'] }]);
      expect(result.entry).toEqual({});
      expect(result.target).toEqual({ title: '你好' });
    });

    it('should recurse into overlapping array objects for new and removed fields', () => {
      const entry = {
        list: [{ title: 'First', extra: 'New' }, { title: 'Second' }],
      };
      const target = {
        list: [{ title: '第一', gone: '旧字段' }],
      };

      const result = diff(entry, target);

      expect(result.remove).toEqual([{ op: 'remove', path: ['list', 0, 'gone'] }]);
      expect(result.add).toEqual(
        expect.arrayContaining([
          { op: 'add', path: ['list', 0, 'extra'], value: 'New' },
          { op: 'add', path: ['list', 1], value: { title: 'Second' } },
        ]),
      );
      expect(result.add).toHaveLength(2);
      expect(result.target).toEqual({ list: [{ title: '第一' }] });
      expect(result.entry).toEqual({
        list: { '0': { extra: 'New' }, '1': { title: 'Second' } },
      });
    });
  });
});
