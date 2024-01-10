import { describe, expect, test } from '@jest/globals';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../../../src/application/services.js';
import { Repository } from '../../../src/infrastructure/repository.js';

describe('Services', () => {
  describe('Submit talk', () => {
    test('Adds talk to list of talks', async () => {
      let repository = Repository.createNull();

      await submitTalk(
        { title: 'foobar', presenter: 'Alice', summary: 'lorem ipsum' },
        repository,
      );

      expect(repository.lastStored).toEqual({
        foobar: {
          title: 'foobar',
          presenter: 'Alice',
          summary: 'lorem ipsum',
          comments: [],
        },
      });
    });
  });

  describe('Post comment', () => {
    test('Adds comment to an existing talk', async () => {
      let repository = Repository.createNull([
        { title: 'foobar', summary: 'lorem ipsum', comments: [] },
      ]);

      let successful = await addComment(
        { title: 'foobar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(true);
      expect(repository.lastStored).toEqual({
        foobar: {
          title: 'foobar',
          summary: 'lorem ipsum',
          comments: [{ author: 'Bob', message: 'new comment' }],
        },
      });
    });

    test('Reports an error if talk does not exists', async () => {
      let repository = Repository.createNull([
        { title: 'foo', summary: 'lorem ipsum', comments: [] },
      ]);

      let successful = await addComment(
        { title: 'bar', comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(successful).toEqual(false);
      expect(repository.lastStored).toBeUndefined();
    });
  });

  describe('Delete talk', () => {
    test('Removes talk from list', async () => {
      let repository = Repository.createNull([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);

      await deleteTalk({ title: 'foobar' }, repository);

      expect(repository.lastStored).toEqual({});
    });
  });

  describe('Talks', () => {
    test('Is a list of talks', async () => {
      let repository = Repository.createNull([
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
      let repository = Repository.createNull([
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
      let repository = Repository.createNull([
        { title: 'foo', summary: 'lorem ipsum', comments: [] },
      ]);

      let talk = await getTalk({ title: 'bar' }, repository);

      expect(talk).toBeUndefined();
    });
  });
});
