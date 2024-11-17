// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

export class Talk {
  static create({ title, presenter, summary, comments = [] } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  static createTestInstance({
    title = 'Talk test title',
    presenter = 'Talk test presenter',
    summary = 'Talk test summary.',
    comments = [Comment.createTestInstance()],
  } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  constructor(
    /** @type {string} */ title,
    /** @type {string} */ presenter,
    /** @type {string} */ summary,
    /** @type {Comment[]} */ comments,
  ) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
    this.comments = comments;
  }
}

export class Comment {
  static create({ author, message }) {
    return new Comment(author, message);
  }

  static createTestInstance({
    author = 'Comment test author',
    message = 'Comment test message',
  } = {}) {
    return new Comment(author, message);
  }

  constructor(/** @type {string} */ author, /** @type {string} */ message) {
    this.author = author;
    this.message = message;
  }
}
