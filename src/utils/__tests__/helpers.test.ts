import {
  chunk,
  debounce,
  generateId,
  groupBy,
  omit,
  pick,
  sleep,
  throttle,
  uniqueBy,
} from '../helpers';

describe('Helper Functions', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(95); // Allow small margin for timing variance
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.runAllTimers();

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('pick', () => {
    it('should pick specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const items = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' },
      ];

      const result = groupBy(items, 'category');

      expect(result).toEqual({
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
        ],
        vegetable: [{ category: 'vegetable', name: 'carrot' }],
      });
    });

    it('should group array by function', () => {
      const items = [
        { age: 10, name: 'Alice' },
        { age: 20, name: 'Bob' },
        { age: 15, name: 'Charlie' },
      ];

      const result = groupBy(items, (item) => (item.age < 18 ? 'minor' : 'adult'));

      expect(result).toEqual({
        minor: [
          { age: 10, name: 'Alice' },
          { age: 15, name: 'Charlie' },
        ],
        adult: [{ age: 20, name: 'Bob' }],
      });
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates by key', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' },
      ];

      const result = uniqueBy(items, 'id');

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = chunk(array, 3);

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle empty arrays', () => {
      const result = chunk([], 3);
      expect(result).toEqual([]);
    });
  });
});
