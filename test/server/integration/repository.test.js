// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import fs from 'node:fs/promises';
import { beforeEach, describe, expect, it } from 'vitest';

import { Talk } from '../../../shared/talks.js';
import { Repository } from '../../../api/infrastructure/repository.js';

const testFile = new URL(
  '../../../testdata/integration.repository.json',
  import.meta.url,
).pathname;

const nonExistingFile = new URL('../data/non-existent.json', import.meta.url)
  .pathname;
const exampleFile = new URL('../data/example.json', import.meta.url).pathname;
const corruptedFile = new URL('../data/corrupt.json', import.meta.url).pathname;

describe('Repository', () => {
  beforeEach(async () => {
    await fs.rm(testFile, { force: true });
  });

  describe('Find all', () => {
    it('returns list of talks', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([Talk.createTestInstance()]);
    });

    it('returns empty list, when file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    it('reports an error, when file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.findAll();

      expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe('Find by title', () => {
    it('returns talk with title', async () => {
      const repository = Repository.create({ fileName: exampleFile });
      const expectedTalk = Talk.createTestInstance();

      const actualTalk = await repository.findByTitle(expectedTalk.title);

      expect(actualTalk).toEqual(expectedTalk);
    });

    it('returns undefined, when talk with title does not exist', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talk = await repository.findByTitle('not a talk');

      expect(talk).toBeUndefined();
    });

    it('returns undefined, when file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findByTitle('Foobar');

      expect(talks).toBeUndefined();
    });

    it('reports an error, when file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.findByTitle('Foobar');

      expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe('Add', () => {
    it('creates file, when file does not exist', async () => {
      const repository = Repository.create({ fileName: testFile });

      const talk = Talk.createTestInstance();
      await repository.add(talk);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk]);
    });

    it('adds talk, when file exists', async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk1 = Talk.createTestInstance({ title: 'Foo' });
      await repository.add(talk1);

      const talk2 = Talk.createTestInstance({ title: 'Bar' });
      await repository.add(talk2);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk1, talk2]);
    });

    it('updates talk, when talk exists', async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk1 = Talk.createTestInstance({
        title: 'Foo',
        presenter: 'Alice',
      });
      await repository.add(talk1);

      const talk2 = Talk.createTestInstance({ title: 'Foo', presenter: 'Bob' });
      await repository.add(talk2);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk2]);
    });

    it('reports an error, when file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const talk = Talk.createTestInstance();
      const result = repository.add(talk);

      expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe('Remove', () => {
    it('removes talk from file', async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk = Talk.createTestInstance();
      await repository.add(talk);

      await repository.remove(talk.title);

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    it('does nothing, when file does not exist', async () => {
      const repository = Repository.create({ fileName: testFile });

      const talks = await repository.remove('Foobar');

      expect(talks).toBeUndefined();
    });

    it('reports an error, when file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.remove('Foobar');

      expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe('Memory repository', () => {
    it('creates empty', async () => {
      const repository = Repository.createMemory();

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    it('initializes talks', async () => {
      const repository = Repository.createMemory({
        talks: [Talk.createTestInstance()],
      });

      const talks = await repository.findAll();

      expect(talks).toEqual([Talk.createTestInstance()]);
    });

    it('writes and reads talks', async () => {
      const repository = Repository.createMemory();

      await repository.add(Talk.createTestInstance());
      const talks = await repository.findAll();

      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });
});
