/** @jest-environment jsdom */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../../../src/client/application/services.js';
import { initialState, reducer } from '../../../src/client/domain/reducer.js';
import { ConfigurableResponses } from '../../configurable-responses.js';
import { Repository } from '../../../src/client/infrastructure/repository.js';
import { Store } from '../../../src/client/domain/store.js';

describe('client services', () => {
  let store;

  beforeEach(() => {
    store = new Store(reducer, initialState);
    localStorage.clear();
  });

  describe('change user', () => {
    test('updates user name', async () => {
      let repository = new Repository();

      await changeUser({ userName: 'Bob' }, store, repository);

      expect(store.getState().user).toEqual('Bob');
      expect(await repository.load()).toEqual({ userName: 'Bob' });
    });
  });

  describe('get user', () => {
    test('gets user Anon if no user is stored', async () => {
      let repository = new Repository();

      await getUser(store, repository);

      expect(store.getState().user).toEqual('Anon');
    });

    test('gets stored user', async () => {
      let repository = new Repository();
      await repository.store({ userName: 'Bob' });

      await getUser(store, repository);

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('poll talks', () => {
    test('sets talks', async () => {
      let api = new FakeApi({
        talks: new ConfigurableResponses([
          {
            isNotModified: false,
            tag: '1',
            talks: [
              { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
            ],
          },
        ]),
      });

      await pollTalks(store, api, 1);

      expect(store.getState().talks).toEqual([
        { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
      ]);
    });

    test('does not set talks, if not modified', async () => {
      let api = new FakeApi({
        talks: new ConfigurableResponses([{ isNotModified: true }]),
      });

      await pollTalks(store, api, 1);

      expect(store.getState().talks).toEqual([]);
    });

    test('recovers after error', async () => {
      let api = new FakeApi({
        talks: new ConfigurableResponses([
          new Error(),
          {
            isNotModified: false,
            tag: '1',
            talks: [
              { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
            ],
          },
        ]),
      });

      await pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
      ]);
    });
  });

  describe('submit talk', () => {
    test('submits talk', async () => {
      let api = new FakeApi();

      await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, store, api);

      expect(api.putTalk).nthCalledWith(1, {
        title: 'foobar',
        presenter: 'Anon',
        summary: 'lorem ipsum',
      });
    });
  });

  describe('delete talk', () => {
    test('deletes talk', async () => {
      let api = new FakeApi();

      await deleteTalk({ title: 'foobar' }, api);

      expect(api.deleteTalk).nthCalledWith(1, 'foobar');
    });
  });

  describe('add comment', () => {
    test('posts comment', async () => {
      let api = new FakeApi();

      await addComment({ title: 'foobar', comment: 'lorem ipsum' }, store, api);

      expect(api.postComment).nthCalledWith(1, 'foobar', {
        author: 'Anon',
        message: 'lorem ipsum',
      });
    });
  });
});

class FakeApi {
  #talks;

  constructor({ talks = new ConfigurableResponses() } = {}) {
    this.#talks = talks;
    this.putTalk = jest.fn(() => Promise.resolve());
    this.deleteTalk = jest.fn(() => Promise.resolve());
    this.postComment = jest.fn(() => Promise.resolve());
  }

  async getTalks() {
    return this.#talks.next();
  }
}
