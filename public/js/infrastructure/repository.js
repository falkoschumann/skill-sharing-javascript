export class Repository {
  #key;

  constructor({ key = 'skillSharing' } = {}) {
    this.#key = key;
  }

  async load() {
    let json = localStorage.getItem(this.#key);
    return JSON.parse(json) || {};
  }

  async store(state) {
    let json = JSON.stringify(state);
    localStorage.setItem(this.#key, json);
  }
}
