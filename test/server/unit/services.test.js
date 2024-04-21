import { describe, expect, test } from '@jest/globals';

import * as services from '../../../src/application/services.js';
import { Repository } from '../../../src/infrastructure/repository.js';

describe('Services', () => {
  describe('Submit talk', () => {
    test('Adds talk to list of talks', async () => {
      const repository = Repository.createNull();

      await services.submitTalk(
        { title: 'Foobar', presenter: 'Alice', summary: 'Lorem ipsum' },
        repository,
      );

      expect(repository.lastStored).toEqual({
        Foobar: {
          title: 'Foobar',
          presenter: 'Alice',
          summary: 'Lorem ipsum',
          comments: [],
        },
      });
    });
  });

  describe('Post comment', () => {
    test('Adds comment to an existing talk', async () => {
      const repository = Repository.createNull([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);

      const { isSuccessful } = await services.addComment(
        { title: 'Foobar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(isSuccessful).toEqual(true);
      expect(repository.lastStored).toEqual({
        Foobar: {
          title: 'Foobar',
          summary: 'Lorem ipsum',
          comments: [{ author: 'Bob', message: 'new comment' }],
        },
      });
    });

    test('Reports an error if talk does not exists', async () => {
      const repository = Repository.createNull([
        { title: 'foo', summary: 'Lorem ipsum', comments: [] },
      ]);

      const { isSuccessful } = await services.addComment(
        { title: 'bar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(isSuccessful).toEqual(false);
      expect(repository.lastStored).toBeUndefined();
    });
  });

  describe('Delete talk', () => {
    test('Removes talk from list', async () => {
      const repository = Repository.createNull([
        { title: 'Foobar', summary: 'Lorem ipsum' },
      ]);

      await services.deleteTalk({ title: 'Foobar' }, repository);

      expect(repository.lastStored).toEqual({});
    });
  });

  describe('Talks', () => {
    test('Is a list of talks', async () => {
      const repository = Repository.createNull([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);

      const talks = await services.getTalks(repository);

      expect(talks).toEqual([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);
    });
  });

  describe('Talk', () => {
    test('Is a single talk', async () => {
      const repository = Repository.createNull([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);

      const talk = await services.getTalk({ title: 'Foobar' }, repository);

      expect(talk).toEqual({
        title: 'Foobar',
        summary: 'Lorem ipsum',
        comments: [],
      });
    });

    test('Is undefined if talk does not exist', async () => {
      const repository = Repository.createNull([
        { title: 'foo', summary: 'Lorem ipsum', comments: [] },
      ]);

      const talk = await services.getTalk({ title: 'bar' }, repository);

      expect(talk).toBeUndefined();
    });
  });
});
