import { describe, expect, test } from '@jest/globals';

import { Services } from '../../../src/application/services.js';
import { Repository } from '../../../src/infrastructure/repository.js';
import { Talk } from '../../../public/js/domain/talks.js';

describe('Services', () => {
  describe('Submit talk', () => {
    test('Adds talk to list of talks', async () => {
      const { services, repository } = configure({ talks: [] });

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
      const title = 'Title 1';
      const talk = Talk.createTestInstance({ title });
      const { services, repository } = configure({
        talks: [talk],
      });

      const { isSuccessful } = await services.addComment(
        { title, comment: { author: 'Bob', message: 'new comment' } },
        repository,
      );

      expect(isSuccessful).toEqual(true);
      expect(repository.lastStored).toEqual({
        [title]: {
          ...talk,
          comments: [
            ...talk.comments,
            { author: 'Bob', message: 'new comment' },
          ],
        },
      });
    });

    test('Reports an error if talk does not exists', async () => {
      const { services, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const { isSuccessful } = await services.addComment(
        {
          title: 'non-existing-talk',
          comment: { author: 'Bob', message: 'new comment' },
        },
        repository,
      );

      expect(isSuccessful).toEqual(false);
      expect(repository.lastStored).toBeUndefined();
    });
  });

  describe('Delete talk', () => {
    test('Removes talk from list', async () => {
      const title = 'Title 1';
      const { services, repository } = configure({
        talks: [Talk.createTestInstance({ title })],
      });

      await services.deleteTalk({ title }, repository);

      expect(repository.lastStored).toEqual({});
    });
  });

  describe('Talks', () => {
    test('Is a list of talks', async () => {
      const { services, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const result = await services.getTalks(repository);

      expect(result).toEqual([Talk.createTestInstance()]);
    });
  });

  describe('Talk', () => {
    test('Is a single talk', async () => {
      const talk = Talk.createTestInstance();
      const { services, repository } = configure({ talks: [talk] });

      const result = await services.getTalk({ title: talk.title }, repository);

      expect(result).toEqual(talk);
    });

    test('Is undefined if talk does not exist', async () => {
      const { services, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const talk = await services.getTalk(
        { title: 'non-existing-talk' },
        repository,
      );

      expect(talk).toBeUndefined();
    });
  });

  describe('Metrics', () => {
    test('Counts talks and presenter', async () => {
      const { services } = configure({
        talks: [
          Talk.createTestInstance({ title: 'Talk 1', presenter: 'Alice' }),
          Talk.createTestInstance({ title: 'Talk 2', presenter: 'Bob' }),
          Talk.createTestInstance({ title: 'Talk 3', presenter: 'Alice' }),
        ],
      });

      const metrics = await services.getMetrics();

      expect(metrics).toEqual({ talksCount: 3, presentersCount: 2 });
    });
  });
});

function configure({ talks }) {
  const repository = Repository.createNull(talks);
  const services = new Services(repository);
  return { services, repository };
}
