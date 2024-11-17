// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, test } from 'vitest';

import {
  CommandStatus,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQueryResult,
} from '../../../shared/messages.js';
import { Comment, Talk } from '../../../shared/talks.js';
import { Services } from '../../../api/application/services.js';
import { Repository } from '../../../api/infrastructure/repository.js';

describe('Services', () => {
  describe('Submit talk', () => {
    test('Adds talk to list', async () => {
      const { services, repository } = configure();

      const status = await services.submitTalk(
        SubmitTalkCommand.create({
          title: 'Talk test title',
          presenter: 'Talk test presenter',
          summary: 'Talk test summary.',
        }),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([
        Talk.create({
          title: 'Talk test title',
          presenter: 'Talk test presenter',
          summary: 'Talk test summary.',
          comments: [],
        }),
      ]);
    });
  });

  describe('Add comment', () => {
    test('Adds comment to an existing talk', async () => {
      const { services, repository } = configure({
        talks: [
          Talk.create({
            title: 'Foobar',
            presenter: 'Talk test presenter',
            summary: 'Talk test summary.',
            comments: [],
          }),
        ],
      });

      const status = await services.addComment({
        title: 'Foobar',
        comment: Comment.createTestInstance(),
      });

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([
        Talk.createTestInstance({
          title: 'Foobar',
          comments: [Comment.createTestInstance()],
        }),
      ]);
    });

    test('Reports an error if talk does not exists', async () => {
      const { services, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await services.addComment({
        title: 'non-existing-talk',
        comment: Comment.createTestInstance({ message: 'Foobar' }),
      });

      expect(status).toEqual(CommandStatus.failure('Talk not found.'));
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });

  describe('Delete talk', () => {
    test('Removes talk from list', async () => {
      const { services, repository } = configure({
        talks: [Talk.createTestInstance({ title: 'Foobar' })],
      });

      const status = await services.deleteTalk(
        DeleteTalkCommand.create({ title: 'Foobar' }),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    test('Ignores already removed talk', async () => {
      const { services, repository } = configure();

      const status = await services.deleteTalk({ title: 'Foobar' });

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });

  describe('Talks', () => {
    test('Lists all talks', async () => {
      const { services } = configure({ talks: [Talk.createTestInstance()] });

      const result = await services.getTalks();

      expect(result).toEqual(
        TalksQueryResult.create({ talks: [Talk.createTestInstance()] }),
      );
    });
  });
});

function configure({ talks } = {}) {
  const repository = Repository.createMemory({ talks });
  const services = new Services(repository);
  return { services, repository };
}
