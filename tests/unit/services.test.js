import { describe, expect, test } from '@jest/globals';

import {
  deleteTalk,
  getTalks,
  submitTalk,
} from '../../src/application/services.js';

describe('services', () => {
  describe('submit talk', () => {
    test('adds talk to list of talks', async () => {
      const repository = new FakeRepository();

      await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, repository);

      const talks = await repository.findAll();
      expect(talks).toEqual([{ title: 'foobar', summary: 'lorem ipsum' }]);
    });
  });

  describe('query talks', () => {
    test('returns list of talks', async () => {
      const repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);

      const talks = await getTalks(repository);

      expect(talks).toEqual([{ title: 'foobar', summary: 'lorem ipsum' }]);
    });
  });

  describe('delete talk', () => {
    test('removes talk from list', async () => {
      const repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);

      await deleteTalk('foobar', repository);

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });
});

class FakeRepository {
  #talks;

  constructor(talks = []) {
    this.#talks = talks;
  }

  async findAll() {
    return this.#talks;
  }

  async add(talk) {
    this.#talks.push(talk);
  }

  async remove(title) {
    this.#talks = this.#talks.filter((talk) => talk.title !== title);
  }
}
