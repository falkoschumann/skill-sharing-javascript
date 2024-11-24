// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

export class User {
  /**
   * @param {User} user
   */
  static create({ username }) {
    return new User(username);
  }

  /**
   * @param {User} user
   */
  static createTestInstance({ username = 'User test username' } = {}) {
    return new User(username);
  }

  /**
   * @param {string} username
   */
  constructor(username) {
    this.username = username;
  }
}
