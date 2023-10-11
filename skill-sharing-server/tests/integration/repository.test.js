import { beforeEach, describe, expect, test } from '@jest/globals';
import { rmSync } from 'node:fs';

import { Repository } from '../../src/infrastructure/repository.js';

const fileName = new URL('../../data/talks.test.json', import.meta.url);

beforeEach(() => {
  rmSync(fileName, { force: true });
});

describe('find all', () => {
  test('returns list of talks', async () => {
    let repository = new Repository({
      fileName: new URL('../data/example.json', import.meta.url),
    });

    let talks = await repository.findAll();

    expect(talks).toEqual([
      { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
    ]);
  });

  test('returns empty list, if file does not exist', async () => {
    let repository = new Repository({
      fileName: new URL('../data/non-existent.json', import.meta.url),
    });

    let talks = await repository.findAll();

    expect(talks).toEqual([]);
  });

  test('reports an error, if file is corrupt', async () => {
    let repository = new Repository({
      fileName: new URL('../data/corrupt.json', import.meta.url),
    });

    await expect(repository.findAll()).rejects.toThrow();
  });
});

describe('find by title', () => {
  test('returns talk with title', async () => {
    let repository = new Repository({
      fileName: new URL('../data/example.json', import.meta.url),
    });

    let talk = await repository.findByTitle('Foobar');

    expect(talk).toEqual({
      title: 'Foobar',
      summary: 'Lorem ipsum',
      comments: [],
    });
  });

  test('returns undefined if talk with title does not exist', async () => {
    let repository = new Repository({
      fileName: new URL('../data/example.json', import.meta.url),
    });

    let talk = await repository.findByTitle('not a talk');

    expect(talk).toBeUndefined();
  });
});

describe('add', () => {
  test('creates file, if file does not exist', async () => {
    let repository = new Repository({ fileName });
    let talks = await repository.findAll();

    await repository.add({
      title: 'foobar',
      author: 'Anon',
      summary: 'lorem ipsum',
      comments: [],
    });

    talks = await repository.findAll();
    expect(talks).toEqual([
      {
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      },
    ]);
  });

  test('adds talk, if file exists', async () => {
    let repository = new Repository({ fileName });
    await repository.add({
      title: 'foo',
      author: 'Anon',
      summary: 'lorem',
      comments: [],
    });

    await repository.add({
      title: 'bar',
      author: 'Bob',
      summary: 'ipsum',
      comments: [],
    });

    let talks = await repository.findAll();
    expect(talks).toEqual([
      { title: 'foo', author: 'Anon', summary: 'lorem', comments: [] },
      { title: 'bar', author: 'Bob', summary: 'ipsum', comments: [] },
    ]);
  });

  test('updates talk, if talk exists', async () => {
    let repository = new Repository({ fileName });
    await repository.add({
      title: 'foo',
      author: 'Anon',
      summary: 'lorem',
      comments: [],
    });

    await repository.add({
      title: 'foo',
      author: 'Bob',
      summary: 'ipsum',
      comments: [],
    });

    let talks = await repository.findAll();
    expect(talks).toEqual([
      { title: 'foo', author: 'Bob', summary: 'ipsum', comments: [] },
    ]);
  });
});

describe('remove', () => {
  test('removes talk from file', async () => {
    let repository = new Repository({ fileName });
    await repository.add({
      title: 'foobar',
      author: 'Anon',
      summary: 'lorem ipsum',
      comments: [],
    });

    await repository.remove('foobar');

    let talks = await repository.findAll();
    expect(talks).toEqual([]);
  });
});
