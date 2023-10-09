export class AbstractRepository {
  async load() {
    return {};
  }

  // eslint-disable-next-line no-unused-vars
  async store(state) {
    return;
  }
}

export class Repository extends AbstractRepository {
  #key;

  constructor({ key = 'skillSharing' } = {}) {
    super();
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
