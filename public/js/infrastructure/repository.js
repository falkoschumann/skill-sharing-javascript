const storageKey = 'skillSharing';

export class Repository {
  #storage;
  #lastStored;

  static create() {
    return new Repository(localStorage);
  }

  static createNull(state) {
    let stored = state != null ? JSON.stringify(state) : null;
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
    if (this.#lastStored != null) {
      return JSON.parse(this.#lastStored);
    }

    return this.#lastStored;
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
