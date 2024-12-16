// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { CommandStatus } from '@muspellheim/shared';
import { describe, expect, it } from 'vitest';

import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
  TalksQueryResult,
} from '../../../shared/messages.js';
import { Talk } from '../../../shared/talks.js';
import { Service } from '../../../api/application/service.js';
import { Repository } from '../../../api/infrastructure/repository.js';

describe('Service', () => {
  describe('Submit talk', () => {
    it('Adds talk to list', async () => {
      const { service, repository } = configure();

      const status = await service.submitTalk(
        SubmitTalkCommand.createTestInstance(),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });

  describe('Add comment', () => {
    it('Adds comment to talk', async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await service.addComment(
        AddCommentCommand.createTestInstance(),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstanceWithComment()]);
    });

    it('Reports an error when talk does not exist', async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await service.addComment(
        AddCommentCommand.createTestInstance({
          title: 'Non existing title',
        }),
      );

      expect(status).toEqual(
        CommandStatus.failure(
          'The comment cannot be added because the talk "Non existing title" does not exist.',
        ),
      );
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });

  describe('Delete talk', () => {
    it('Removes talk from list', async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await service.deleteTalk(
        DeleteTalkCommand.createTestInstance(),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    it('Does not report an error when talk does not exist', async () => {
      const { service, repository } = configure();

      const status = await service.deleteTalk(
        DeleteTalkCommand.createTestInstance(),
      );

      expect(status).toEqual(CommandStatus.success());
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });

  describe('Talks', () => {
    it('Lists all talks', async () => {
      const { service } = configure({
        talks: [
          Talk.createTestInstance({ title: 'Foo' }),
          Talk.createTestInstance({ title: 'Bar' }),
        ],
      });

      const result = await service.getTalks(TalksQuery.create());

      expect(result).toEqual(
        TalksQueryResult.create({
          talks: [
            Talk.createTestInstance({ title: 'Foo' }),
            Talk.createTestInstance({ title: 'Bar' }),
          ],
        }),
      );
    });

    it('Finds talk by title', async () => {
      const { service } = configure({
        talks: [
          Talk.createTestInstance({ title: 'Foo' }),
          Talk.createTestInstance({ title: 'Bar' }),
        ],
      });

      const result = await service.getTalks(
        TalksQuery.create({ title: 'Foo' }),
      );

      expect(result).toEqual(
        TalksQueryResult.create({
          talks: [Talk.createTestInstance({ title: 'Foo' })],
        }),
      );
    });
  });
});

function configure({ talks } = {}) {
  const repository = Repository.createNull({ talks });
  const service = new Service(repository);
  return { service, repository };
}
