import {describe, expect, test} from '@jest/globals';

import {queryTalks} from '../../src/application/services.js';

const repository = {
  loadTalks: () => [
    {title: 'Unituning', summary: 'Modifying your cycle for extra style'},
  ],
};

describe('services', () => {
  describe('query talks', () => {
    test('loads talks', () => {
      const talks = queryTalks(repository);

      expect(talks).toEqual([
        {title: 'Unituning', summary: 'Modifying your cycle for extra style'},
      ]);
    });
  });
});
