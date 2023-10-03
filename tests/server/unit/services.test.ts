import { describe, expect, test } from '@jest/globals';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../../../src/server/application/services';
import { Talk } from '../../../src/client/domain/types';

describe('services', () => {
  describe('get talks', () => {
    test('returns list of talks', async () => {
      const repository = new FakeRepository([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      const talks = await getTalks(repository);

      expect(talks).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });
  });

  describe('get talk', () => {
    test('returns a talk', async () => {
      const repository = new FakeRepository([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      const talk = await getTalk({ title: 'foobar' }, repository);

      expect(talk).toEqual({
        title: 'foobar',
        presenter: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });
    });

    test('returns nothing if talk does not exist', async () => {
      const repository = new FakeRepository([
        {
          title: 'foo',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      const talk = await getTalk({ title: 'bar' }, repository);

      expect(talk).toBeUndefined();
    });
  });

  describe('submit talk', () => {
    test('adds talk to list of talks', async () => {
      const repository = new FakeRepository();

      await submitTalk(
        { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
        repository,
      );

      const talks = await repository.findAll();
      expect(talks).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });
  });

  describe('delete talk', () => {
    test('removes talk from list', async () => {
      const repository = new FakeRepository([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      await deleteTalk({ title: 'foobar' }, repository);

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });

  describe('add comment', () => {
    test('adds comment to an existing talk', async () => {
      const repository = new FakeRepository([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      const successful = await addComment(
        { title: 'foobar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(true);
      const talk = await repository.findByTitle('foobar');
      expect(talk).toEqual({
        title: 'foobar',
        presenter: 'Anon',
        summary: 'lorem ipsum',
        comments: [{ author: 'Bob', message: 'new comment' }],
      });
    });

    test('reports an error if talk does not exists', async () => {
      const repository = new FakeRepository([
        {
          title: 'foo',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);

      const successful = await addComment(
        { title: 'bar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(false);
      const talk = await repository.findByTitle('foo');
      expect(talk).toEqual({
        title: 'foo',
        presenter: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });
    });
  });
});

class FakeRepository {
  #talks: Array<Talk>;

  constructor(talks: Array<Talk> = []) {
    this.#talks = talks;
  }

  async findAll() {
    return this.#talks;
  }

  async findByTitle(title: string): Promise<Talk | undefined> {
    return this.#talks.find((t) => t.title === title);
  }

  async add(talk: Talk) {
    this.#talks.push(talk);
  }

  async remove(title: string) {
    this.#talks = this.#talks.filter((talk) => talk.title !== title);
  }
}
