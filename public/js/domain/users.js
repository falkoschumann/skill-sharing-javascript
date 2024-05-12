export class User {
  static create({ username }) {
    return new User(username);
  }

  static createTestInstance({ username = 'User test username' } = {}) {
    return new User(username);
  }

  constructor(username) {
    this.username = username;
  }
}
