const storageKey = 'skillSharing';

export class Repository {
  static create() {
    return new Repository(localStorage);
  }

  static createNull({ settings } = {}) {
    return new Repository(new StorageStub(settings));
  }

  #storage;
  #lastSettings;

  constructor(storage) {
    this.#storage = storage;
  }

  async load() {
    let json = this.#storage.getItem(storageKey);
    if (json == null) {
      return {};
    }

    return JSON.parse(json);
  }

  async store(settings) {
    let json = JSON.stringify(settings);
    this.#storage.setItem(storageKey, json);
    this.#lastSettings = json;
  }

  get lastSettings() {
    return JSON.parse(this.#lastSettings);
  }
}

class StorageStub {
  #item;

  constructor(item) {
    this.#item = item != null ? JSON.stringify(item) : null;
  }

  getItem() {
    return this.#item;
  }

  setItem() {}
}
