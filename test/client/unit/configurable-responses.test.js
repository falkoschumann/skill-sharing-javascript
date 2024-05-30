import { describe, expect, test } from '@jest/globals';

import { ConfigurableResponses } from '../../../public/js/util/configurable-responses.js';

describe('Configurable responses', () => {
  describe('Single value', () => {
    test('Always returns the same value', () => {
      const responses = ConfigurableResponses.create(42);

      expect(responses.next()).toBe(42);
      expect(responses.next()).toBe(42);
      expect(responses.next()).toBe(42);
    });

    test('Throws error if no value is given', () => {
      const responses = ConfigurableResponses.create();

      expect(() => responses.next()).toThrow('No more responses configured.');
    });
  });

  describe('Multiple values', () => {
    test('Returns values in order', () => {
      const responses = ConfigurableResponses.create([1, 2, 3]);

      expect(responses.next()).toBe(1);
      expect(responses.next()).toBe(2);
      expect(responses.next()).toBe(3);
    });

    test('Throws error if no more values', () => {
      const responses = ConfigurableResponses.create([1, 2, 3], 'foobar');

      responses.next();
      responses.next();
      responses.next();

      expect(() => responses.next()).toThrow(
        'No more responses configured in foobar.',
      );
    });

    test('Throws error if array is empty', () => {
      const responses = ConfigurableResponses.create([]);

      expect(() => responses.next()).toThrow('No more responses configured.');
    });
  });
});
