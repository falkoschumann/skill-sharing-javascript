import { describe, expect, test } from '@jest/globals';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../../src/application/services.js';

describe('services', () => {
  describe('get talks', () => {
    test('returns list of talks', async () => {
      let repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);

      let talks = await getTalks(repository);

      expect(talks).toEqual([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);
    });
  });

  describe('get talk', () => {
    test('returns a talk', async () => {
      let repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);

      let talk = await getTalk({ title: 'foobar' }, repository);

      expect(talk).toEqual({
        title: 'foobar',
        summary: 'lorem ipsum',
        comments: [],
      });
    });

    test('returns nothing if talk does not exist', async () => {
      let repository = new FakeRepository([
        { title: 'foo', summary: 'lorem ipsum', comments: [] },
      ]);

      let talk = await getTalk({ title: 'bar' }, repository);

      expect(talk).toBeUndefined();
    });
  });

  describe('submit talk', () => {
    test('adds talk to list of talks', async () => {
      let repository = new FakeRepository();

      await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, repository);

      let talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);
    });
  });

  describe('delete talk', () => {
    test('removes talk from list', async () => {
      let repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);

      await deleteTalk({ title: 'foobar' }, repository);

      let talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });

  describe('add comment', () => {
    test('adds comment to an existing talk', async () => {
      let repository = new FakeRepository([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);

      let successful = await addComment(
        { title: 'foobar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(true);
      let talk = await repository.findByTitle('foobar');
      expect(talk).toEqual({
        title: 'foobar',
        summary: 'lorem ipsum',
        comments: [{ author: 'Bob', message: 'new comment' }],
      });
    });

    test('reports an error if talk does not exists', async () => {
      let repository = new FakeRepository([
        { title: 'foo', summary: 'lorem ipsum', comments: [] },
      ]);

      let successful = await addComment(
        { title: 'bar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(false);
      let talk = await repository.findByTitle('foo');
      expect(talk).toEqual({
        title: 'foo',
        summary: 'lorem ipsum',
        comments: [],
      });
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

  async findByTitle(title) {
    return this.#talks.find((t) => t.title === title);
  }

  async add(talk) {
    this.#talks.push(talk);
  }

  async remove(title) {
    this.#talks = this.#talks.filter((talk) => talk.title !== title);
  }
}
