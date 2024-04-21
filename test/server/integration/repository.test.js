import { beforeEach, describe, expect, test } from '@jest/globals';
import { rmSync } from 'node:fs';

import { Repository } from '../../../src/infrastructure/repository.js';

const testFile = new URL('../../../data/talks.test.json', import.meta.url)
  .pathname;
const exampleFile = new URL('../data/example.json', import.meta.url).pathname;
const nonExistingFile = new URL('../data/non-existent.json', import.meta.url)
  .pathname;
const corruptedFile = new URL('../data/corrupt.json', import.meta.url).pathname;

describe('Repository', () => {
  beforeEach(() => {
    rmSync(testFile, { force: true });
  });

  describe('Find all', () => {
    test('Returns list of talks', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);
    });

    test('Returns empty list, if file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.findAll();

      await expect(result).rejects.toThrow();
    });
  });

  describe('Find by title', () => {
    test('Returns talk with title', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talk = await repository.findByTitle('Foobar');

      expect(talk).toEqual({
        title: 'Foobar',
        summary: 'Lorem ipsum',
        comments: [],
      });
    });

    test('Returns undefined if talk with title does not exist', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talk = await repository.findByTitle('not a talk');

      expect(talk).toBeUndefined();
    });
  });

  describe('Add', () => {
    test('Creates file, if file does not exist', async () => {
      const repository = Repository.create({ fileName: testFile });

      await repository.add({
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });

      const talks = await repository.findAll();
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
      const repository = Repository.create({ fileName: testFile });
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

      const talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foo', author: 'Anon', summary: 'lorem', comments: [] },
        { title: 'bar', author: 'Bob', summary: 'ipsum', comments: [] },
      ]);
    });

    test('Updates talk, if talk exists', async () => {
      const repository = Repository.create({ fileName: testFile });
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

      const talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foo', author: 'Bob', summary: 'ipsum', comments: [] },
      ]);
    });
  });

  describe('Remove', () => {
    test('Removes talk from file', async () => {
      const repository = Repository.create({ fileName: testFile });
      await repository.add({
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });

      await repository.remove('foobar');

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });
});
