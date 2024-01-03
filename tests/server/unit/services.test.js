import { describe, expect, test } from '@jest/globals';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../../../src/application/services.js';

describe('Submit talk', () => {
  test('Adds talk to list of talks', async () => {
    let repository = new FakeRepository();

    await submitTalk(
      { title: 'foobar', presenter: 'Alice', summary: 'lorem ipsum' },
      repository,
    );

    let talks = await repository.findAll();
    expect(talks).toEqual([
      {
        title: 'foobar',
        presenter: 'Alice',
        summary: 'lorem ipsum',
        comments: [],
      },
    ]);
  });
});

describe('Post comment', () => {
  test('Adds comment to an existing talk', async () => {
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

  test('Reports an error if talk does not exists', async () => {
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

describe('Delete talk', () => {
  test('Removes talk from list', async () => {
    let repository = new FakeRepository([
      { title: 'foobar', summary: 'lorem ipsum' },
    ]);

    await deleteTalk({ title: 'foobar' }, repository);

    let talks = await repository.findAll();
    expect(talks).toEqual([]);
  });
});

describe('Talks', () => {
  test('Is a list of talks', async () => {
    let repository = new FakeRepository([
      { title: 'foobar', summary: 'lorem ipsum', comments: [] },
    ]);

    let talks = await getTalks(repository);

    expect(talks).toEqual([
      { title: 'foobar', summary: 'lorem ipsum', comments: [] },
    ]);
  });
});

describe('Talk', () => {
  test('Is a single talk', async () => {
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

  test('Is undefined if talk does not exist', async () => {
    let repository = new FakeRepository([
      { title: 'foo', summary: 'lorem ipsum', comments: [] },
    ]);

    let talk = await getTalk({ title: 'bar' }, repository);

    expect(talk).toBeUndefined();
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
