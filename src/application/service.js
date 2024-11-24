// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { Store } from '@muspellheim/shared'
 */

import { createStore } from '@muspellheim/shared';

import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

// TODO Handle errors
// TODO Add logging
// TODO Add validation
// TODO Add metrics

export class Service {
  /** @type {Service} */ static #instance;

  static get() {
    if (Service.#instance == null) {
      Service.#instance = new Service(
        createStore(reducer),
        Repository.create(),
        Api.create(),
      );
    }

    return Service.#instance;
  }

  #store;
  #repository;
  #api;

  /**
   * @param {Store} store
   * @param {Repository} repository
   * @param {Api} api
   */
  constructor(store, repository, api) {
    this.#store = store;
    this.#repository = repository;
    this.#api = api;
  }

  get store() {
    return this.#store;
  }

  async changeUser({ username }) {
    this.#store.dispatch({ type: 'change-user', username });
    await this.#repository.store({ username });
  }

  async loadUser() {
    const { username = 'Anon' } = await this.#repository.load();
    this.#store.dispatch({ type: 'change-user', username });
  }

  async submitTalk({ title, summary }) {
    const presenter = this.#store.getState().user;
    const talk = { title, presenter, summary };
    await this.#api.putTalk(talk);
  }

  async addComment({ title, comment }) {
    const author = this.#store.getState().user;
    await this.#api.postComment(title, {
      author,
      message: comment,
    });
  }

  async deleteTalk({ title }) {
    await this.#api.deleteTalk(title);
  }

  async connectTalks() {
    this.#api.addEventListener('talks-updated', (event) =>
      this.#store.dispatch({ type: 'talks-updated', talks: event.talks }),
    );
    await this.#api.connectTalks();
  }
}
