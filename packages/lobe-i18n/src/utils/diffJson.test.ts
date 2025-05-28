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
    });
  });
});
