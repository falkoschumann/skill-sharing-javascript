import { rmSync } from 'node:fs';

import { beforeEach, describe, expect, test } from '@jest/globals';

import { Repository } from '../../src/infrastructure/repository.js';

const fileName = './data/talks.test.json';

describe('repository', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
  });

  describe('find all', () => {
    test('returns list of talks', async () => {
      const repository = new Repository({
        fileName: './tests/data/example.json',
      });

      const talks = await repository.findAll();

      expect(talks).toEqual([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);
    });

    test('returns empty list, if file does not exist', async () => {
      const repository = new Repository({
        fileName: './tests/data/non-existent.json',
      });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    test('returns empty list, if file is corrupt', async () => {
      const repository = new Repository({
        fileName: './tests/data/corrupt.json',
      });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });
  });

  describe('find by title', () => {
    test('returns talk with title', async () => {
      const repository = new Repository({
        fileName: './tests/data/example.json',
      });

      const talk = await repository.findByTitle('Foobar');

      expect(talk).toEqual({
        title: 'Foobar',
        summary: 'Lorem ipsum',
        comments: [],
      });
    });

    test('returns undefined if talk with title does not exist', async () => {
      const repository = new Repository({
        fileName: './tests/data/example.json',
      });

      const talk = await repository.findByTitle('not a talk');

      expect(talk).toBeUndefined();
    });
  });

  describe('add', () => {
    test('creates file, if file does not exist', async () => {
      const repository = new Repository({ fileName });
      let talks = await repository.findAll();

      await repository.add({
        title: 'foobar',
        summary: 'lorem ipsum',
        comments: [],
      });

      talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);
    });

    test('adds talk, if file exists', async () => {
      const repository = new Repository({ fileName });
      let talks = await repository.findAll();
      await repository.add({ title: 'foo', summary: 'lorem', comments: [] });

      await repository.add({ title: 'bar', summary: 'ipsum', comments: [] });

      talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foo', summary: 'lorem', comments: [] },
        { title: 'bar', summary: 'ipsum', comments: [] },
      ]);
    });

    test('updates talk, if talk exists', async () => {
      const repository = new Repository({ fileName });
      let talks = await repository.findAll();
      await repository.add({ title: 'foo', summary: 'lorem', comments: [] });

      await repository.add({ title: 'foo', summary: 'ipsum', comments: [] });

      talks = await repository.findAll();
      expect(talks).toEqual([{ title: 'foo', summary: 'ipsum', comments: [] }]);
    });
  });

  describe('remove', () => {
    test('removes talk from file', async () => {
      const repository = new Repository({ fileName });
      let talks = await repository.findAll();
      await repository.add({
        title: 'foobar',
        summary: 'lorem ipsum',
        comments: [],
      });

      await repository.remove('foobar');

      talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });
});
