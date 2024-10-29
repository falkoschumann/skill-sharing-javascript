import fs from 'node:fs/promises';
import { beforeEach, describe, expect, test } from 'vitest';

import { Talk } from '../../../public/js/domain/talks.js';
import { Repository } from '../../../lib/infrastructure/repository.js';
import { Status } from '@muspellheim/shared';

// TODO Use testdata folder
const testFile = new URL('../../../data/talks.test.json', import.meta.url)
  .pathname;
const exampleFile = new URL('../data/example.json', import.meta.url).pathname;
const nonExistingFile = new URL(
  '../../../data/non-existent.json',
  import.meta.url,
).pathname;
const corruptedFile = new URL('../data/corrupt.json', import.meta.url).pathname;

// TODO replace beforeEach and afterEach with test function

describe('Repository', () => {
  beforeEach(async () => {
    await fs.rm(testFile, { force: true });
    await fs.rm(nonExistingFile, { force: true });
  });

  describe('Find all', () => {
    test('Returns list of talks', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([Talk.createTestInstance()]);
      expect(repository.health()).toMatchObject({ status: Status.UP });
    });

    test('Returns empty list, if file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
      expect(repository.health()).toMatchObject({ status: Status.UP });
    });

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
      expect(repository.health()).toMatchObject({ status: Status.DOWN });
    });
  });

  describe('Find by title', () => {
    test('Returns talk with title', async () => {
      const repository = Repository.create({ fileName: exampleFile });
      const expectedTalk = Talk.createTestInstance();

      const actualTalk = await repository.findByTitle(expectedTalk.title);

      expect(actualTalk).toEqual(expectedTalk);
      expect(repository.health()).toMatchObject({ status: Status.UP });
    });

    test('Returns undefined, if talk with title does not exist', async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talk = await repository.findByTitle('not a talk');

      expect(talk).toBeUndefined();
      expect(repository.health()).toMatchObject({ status: Status.UP });
    });

    test('Returns undefined, if file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findByTitle('Foobar');

      expect(talks).toBeUndefined();
      expect(repository.health()).toMatchObject({ status: Status.UP });
    });

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const talk = await repository.findByTitle('Foobar');

      expect(talk).toBeUndefined();
      expect(repository.health()).toMatchObject({ status: Status.DOWN });
    });
  });

  describe('Add', () => {
    test('Creates file, if file does not exist', async () => {
      const repository = Repository.create({ fileName: testFile });

      const talk = Talk.createTestInstance();
      await repository.add(talk);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk]);
    });

    test('Adds talk, if file exists', async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk1 = Talk.createTestInstance({ title: 'Foo' });
      await repository.add(talk1);

      const talk2 = Talk.createTestInstance({ title: 'Bar' });
      await repository.add(talk2);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk1, talk2]);
    });

    test('Updates talk, if talk exists', async () => {
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

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const talk = Talk.createTestInstance();
      await repository.add(talk);

      expect(repository.health()).toMatchObject({ status: Status.DOWN });
    });
  });

  describe('Remove', () => {
    test('Removes talk from file', async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk = Talk.createTestInstance();
      await repository.add(talk);

      await repository.remove(talk.title);

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    test('Does nothing, if file does not exist', async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.remove('Foobar');

      expect(talks).toBeUndefined();
    });

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      await repository.remove('Foobar');

      expect(repository.health()).toMatchObject({ status: Status.DOWN });
    });
  });
});
