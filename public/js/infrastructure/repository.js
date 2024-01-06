const storageKey = 'skillSharing';

export class Repository {
  #storage;
  #lastStored;

  static create() {
    return new Repository(localStorage);
  }

  static createNull({ userName = 'Anon' } = {}) {
    let stored = JSON.stringify({ userName });
    return new Repository(new StorageStub(stored));
  }

  constructor(storage) {
    this.#storage = storage;
  }

  async load() {
    let json = this.#storage.getItem(storageKey);
    return JSON.parse(json) || {};
  }

  async store(state) {
    let json = JSON.stringify(state);
    this.#storage.setItem(storageKey, json);
    this.#lastStored = json;
  }

  get lastStored() {
    return this.#lastStored != null ? JSON.parse(this.#lastStored) : undefined;
  }
}

class StorageStub {
  #item;

  constructor(item) {
    this.#item = item;
  }

  getItem() {
    return this.#item;
  }

  setItem() {}
}
