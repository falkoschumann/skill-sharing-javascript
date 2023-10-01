export class Repository {
  #key;

  constructor({ key = 'userName' } = {}) {
    this.#key = key;
  }

  async load() {
    return localStorage.getItem(this.#key);
  }

  async store(userName) {
    localStorage.setItem(this.#key, userName);
  }
}
