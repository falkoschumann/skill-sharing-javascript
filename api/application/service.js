// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { AddCommentCommand, DeleteTalkCommand, SubmitTalkCommand, TalksQuery } from '../../shared/messages.js'
 * @import { Repository } from '../infrastructure/repository.js'
 */

import { CommandStatus, TalksQueryResult } from '../../shared/messages.js';
import { Talk } from '../../shared/talks.js';

export class Service {
  #repository;

  /**
   * @param {Repository} repository
   */
  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * @param {SubmitTalkCommand} command
   */
  async submitTalk(command) {
    const talk = Talk.create(command);
    await this.#repository.addOrUpdate(talk);
    return CommandStatus.success();
  }

  /**
   * @param {AddCommentCommand} command
   */
  async addComment(command) {
    const talk = await this.#repository.findByTitle(command.title);
    if (talk == null) {
      return CommandStatus.failure(
        `The comment cannot be added because the talk "${command.title}" does not exist.`,
      );
    }

    talk.comments.push(command.comment);
    await this.#repository.addOrUpdate(talk);
    return CommandStatus.success();
  }

  /**
   * @param {DeleteTalkCommand} command
   */
  async deleteTalk(command) {
    await this.#repository.remove(command.title);
    return CommandStatus.success();
  }

  /**
   * @param {TalksQuery=} query
   */
  async getTalks(query) {
    if (query?.title != null) {
      const talk = await this.#repository.findByTitle(query.title);
      return TalksQueryResult.create({ talks: talk ? [talk] : [] });
    }

    const talks = await this.#repository.findAll();
    return TalksQueryResult.create({ talks });
  }
}
