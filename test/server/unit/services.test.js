import { describe, expect, test } from '@jest/globals';

import { Services } from '../../../src/application/services.js';
import { Repository } from '../../../src/infrastructure/repository.js';
import { Talk } from '../../../public/js/domain/talks.js';
import { HealthRegistry } from '../../../src/util/health.js';

describe('Services', () => {
  describe('Submit talk', () => {
    test('Adds talk to list', async () => {
      const { services, repository } = configure({ talks: [] });

      await services.submitTalk({
        title: 'Foobar',
        presenter: 'Alice',
        summary: 'Lorem ipsum',
      });

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

  describe('Add comment', () => {
    test('Adds comment to an existing talk', async () => {
      const title = 'Title 1';
      const talk = Talk.createTestInstance({ title });
      const { services, repository } = configure({
        talks: [talk],
      });

      const { isSuccessful } = await services.addComment({
        title,
        comment: { author: 'Bob', message: 'new comment' },
      });

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

      const { isSuccessful } = await services.addComment({
        title: 'non-existing-talk',
        comment: { author: 'Bob', message: 'new comment' },
      });

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

      await services.deleteTalk({ title });

      expect(repository.lastStored).toEqual({});
    });

    test('Ignores already removed talk', async () => {
      const { services, repository } = configure();

      await services.deleteTalk({ title: 'Foobar' });

      expect(repository.lastStored).toEqual({});
    });
  });

  describe('Talks', () => {
    test('Lists all talks', async () => {
      const { services } = configure({
        talks: [Talk.createTestInstance()],
      });

      const result = await services.getTalks();

      expect(result).toEqual([Talk.createTestInstance()]);
    });
  });

  describe('Metrics', () => {
    test('Counts talks, presenter and comments', async () => {
      const { services } = configure({
        talks: [
          Talk.createTestInstance({ title: 'Talk 1', presenter: 'Alice' }),
          Talk.createTestInstance({ title: 'Talk 2', presenter: 'Bob' }),
          Talk.createTestInstance({ title: 'Talk 3', presenter: 'Alice' }),
        ],
      });

      const metrics = await services.getMetrics();

      expect(metrics).toEqual({
        talksCount: 3,
        presentersCount: 2,
        commentsCount: 3,
      });
    });
  });
});

function configure({ talks } = {}) {
  const repository = Repository.createNull({ talks });
  const services = new Services(repository, HealthRegistry.create());
  return { services, repository };
}
