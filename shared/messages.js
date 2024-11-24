import { Comment, Talk } from './talks.js';

export class SubmitTalkCommand {
  /**
   * @param {SubmitTalkCommand} command
   */
  static create({ title, presenter, summary } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  /**
   * @param {SubmitTalkCommand} command
   */
  static createTestInstance({
    title = 'Talk test title',
    presenter = 'Talk test presenter',
    summary = 'Talk test summary.',
  } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  /**
   * @param {string} title
   * @param {string} presenter
   * @param {string} summary
   */
  constructor(title, presenter, summary) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
  }
}

export class AddCommentCommand {
  /**
   * @param {AddCommentCommand} command
   */
  static create({ title, comment } = {}) {
    return new AddCommentCommand(title, comment);
  }

  /**
   * @param {AddCommentCommand} command
   */
  static createTestInstance({
    title = 'Talk test title',
    comment = Comment.createTestInstance(),
  } = {}) {
    return new AddCommentCommand(title, comment);
  }

  /**
   * @param {string} title
   * @param {Comment} comment
   */
  constructor(title, comment) {
    this.title = title;
    this.comment = comment;
  }
}

export class DeleteTalkCommand {
  /**
   * @param {DeleteTalkCommand} command
   */
  static create({ title } = {}) {
    return new DeleteTalkCommand(title);
  }

  /**
   * @param {DeleteTalkCommand} command
   */
  static createTestInstance({ title = 'Talk test title' } = {}) {
    return new DeleteTalkCommand(title);
  }

  /**
   * @param {string} title
   */
  constructor(title) {
    this.title = title;
  }
}

export class CommandStatus {
  // TODO Move CommandStatus to @muspellheim/shared

  static success() {
    return new CommandStatus(true);
  }

  /**
   * @param {string} errorMessage
   */
  static failure(errorMessage) {
    return new CommandStatus(false, errorMessage);
  }

  /**
   * @param {boolean} isSuccess
   * @param {string} errorMessage
   */
  constructor(isSuccess, errorMessage) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }
}

export class TalksQuery {
  /**
   * @param {TalksQuery} query
   */
  static create({ title } = {}) {
    return new TalksQuery(title);
  }

  /**
   * @param {TalksQuery} query
   */
  static createTestInstance({ title = 'Talk test title' } = {}) {
    return new TalksQuery(title);
  }

  /**
   * @param {string} [title=]
   */
  constructor(title) {
    this.title = title;
  }
}

export class TalksQueryResult {
  /**
   * @param {TalksQueryResult} result
   */
  static create({ talks = [] } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {TalksQueryResult} result
   */
  static createTestInstance({ talks = [Talk.createTestInstance()] } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {TalksQueryResult} result
   */
  static createTestInstanceWithComment({
    talks = [Talk.createTestInstanceWithComment()],
  } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {Talk[]|Talk} talks
   */
  constructor(talks) {
    this.talks = Array.isArray(talks) ? talks : [talks];
  }
}
