import { beforeEach, describe, expect, test } from '@jest/globals';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Repository } from '../../../src/infrastructure/repository.js';

const testFile = fileURLToPath(
  new URL('../../../data/talks.test.json', import.meta.url)
);
const exampleFile = fileURLToPath(
  new URL('../data/example.json', import.meta.url)
);
const nonExistingFile = fileURLToPath(
  new URL('../data/non-existent.json', import.meta.url)
);
const corruptedFile = fileURLToPath(
  new URL('../data/corrupt.json', import.meta.url)
);

beforeEach(() => {
  rmSync(testFile, { force: true });
});

describe('Find all', () => {
  test('Returns list of talks', async () => {
    let repository = new Repository({ fileName: exampleFile });

    let talks = await repository.findAll();

    expect(talks).toEqual([
      { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
    ]);
  });

  test('Returns empty list, if file does not exist', async () => {
    let repository = new Repository({ fileName: nonExistingFile });

    let talks = await repository.findAll();

    expect(talks).toEqual([]);
  });

  test('Reports an error, if file is corrupt', async () => {
    let repository = new Repository({ fileName: corruptedFile });

    await expect(repository.findAll()).rejects.toThrow();
  });
});

describe('Find by title', () => {
  test('Returns talk with title', async () => {
    let repository = new Repository({ fileName: exampleFile });

    let talk = await repository.findByTitle('Foobar');

    expect(talk).toEqual({
      title: 'Foobar',
      summary: 'Lorem ipsum',
      comments: [],
    });
  });

  test('Returns undefined if talk with title does not exist', async () => {
    let repository = new Repository({ fileName: exampleFile });

    let talk = await repository.findByTitle('not a talk');

    expect(talk).toBeUndefined();
  });
});

describe('Add', () => {
  test('Creates file, if file does not exist', async () => {
    let repository = new Repository({ fileName: testFile });

    await repository.add({
      title: 'foobar',
      author: 'Anon',
      summary: 'lorem ipsum',
      comments: [],
    });

    let talks = await repository.findAll();
    expect(talks).toEqual([
      {
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      },
    ]);
  });

  test('Adds talk, if file exists', async () => {
    let repository = new Repository({ fileName: testFile });
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

  test('Updates talk, if talk exists', async () => {
    let repository = new Repository({ fileName: testFile });
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

describe('Remove', () => {
  test('Removes talk from file', async () => {
    let repository = new Repository({ fileName: testFile });
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
