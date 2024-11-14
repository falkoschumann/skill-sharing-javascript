// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { User } from '../domain/users.js';

const storageKey = 'skillSharing';

export class Repository {
  static create() {
    return new Repository(localStorage);
  }

  static createNull(user) {
    return new Repository(new StorageStub(user));
  }

  #storage;
  #lastUser;

  constructor(/** @type {Storage} */ storage) {
    this.#storage = storage;
  }

  async load() {
    const json = this.#storage.getItem(storageKey);
    if (json == null) {
      return {};
    }

    const user = JSON.parse(json);
    return User.create(user);
  }

  async store(user) {
    const json = JSON.stringify(user);
    this.#storage.setItem(storageKey, json);
    this.#lastUser = json;
  }

  get lastUser() {
    return JSON.parse(this.#lastUser);
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
