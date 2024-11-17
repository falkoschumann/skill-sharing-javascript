// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { AddCommentCommand, DeleteTalkCommand, SubmitTalkCommand } from '../../shared/messages.js'
 */

import { CommandStatus, TalksQueryResult } from '../../shared/messages.js';
import { Talk } from '../../shared/talks.js';
import { Repository } from '../infrastructure/repository.js';

export class Services {
  static create() {
    return new Services(Repository.create());
  }

  #repository;

  constructor(/** @type {Repository} */ repository) {
    this.#repository = repository;
  }

  async getTalks() {
    const talks = await this.#repository.findAll();
    return TalksQueryResult.create({ talks });
  }

  async submitTalk(/** @type {SubmitTalkCommand} */ command) {
    const talk = Talk.create(command);
    await this.#repository.add(talk);
    return CommandStatus.success();
  }

  async deleteTalk(/** @type {DeleteTalkCommand} */ command) {
    await this.#repository.remove(command.title);
    return CommandStatus.success();
  }

  async addComment(/** @type {AddCommentCommand} */ command) {
    const talk = await this.#repository.findByTitle(command.title);
    if (talk == null) {
      return CommandStatus.failure('Talk not found.');
    }

    talk.comments.push(command.comment);
    await this.#repository.add(talk);
    return CommandStatus.success();
  }
}
