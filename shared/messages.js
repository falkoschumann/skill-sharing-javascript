/**
 * @import { Comment, Talk } from "./talks.js"
 */

export class SubmitTalkCommand {
  static create({ title, presenter, summary } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  constructor(
    /** @type {string} */ title,
    /** @type {string} */ presenter,
    /** @type {string} */ summary,
  ) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
  }
}

export class AddCommentCommand {
  static create({ title, comment } = {}) {
    return new AddCommentCommand(title, comment);
  }

  constructor(/** @type {string} */ title, /** @type {Comment} */ comment) {
    this.title = title;
    this.comment = comment;
  }
}

export class DeleteTalkCommand {
  static create({ title } = {}) {
    return new DeleteTalkCommand(title);
  }

  constructor(/** @type {string} */ title) {
    this.title = title;
  }
}

export class CommandStatus {
  // TODO Move CommandStatus to @muspellheim/shared

  static success() {
    return new CommandStatus(true);
  }

  static failure(/** @type {string} */ errorMessage) {
    return new CommandStatus(false, errorMessage);
  }

  constructor(
    /** @type {boolean} */ success,
    /** @type {string} */ errorMessage,
  ) {
    this.success = success;
    this.errorMessage = errorMessage;
  }
}

export class TalksQueryResult {
  static create({ talks } = {}) {
    return new TalksQueryResult(talks);
  }

  constructor(/** @type {Talk[]} */ talks) {
    this.talks = talks;
  }
}
