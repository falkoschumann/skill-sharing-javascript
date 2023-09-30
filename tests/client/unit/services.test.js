/** @jest-environment jsdom */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../../../public/js/application/services.js';
import { initialState, reducer } from '../../../public/js/domain/reducer.js';
import { ConfigurableResponses } from '../../configurable-responses.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';
import { Store } from '../../../public/js/domain/store.js';

describe('client services', () => {
  let store;

  beforeEach(() => {
    store = new Store(reducer, initialState);
    localStorage.clear();
  });

  describe('change user', () => {
    test('updates user name', async () => {
      const repository = new Repository();

      await changeUser({ name: 'Bob' }, store, repository);

      expect(store.getState().user).toEqual('Bob');
      expect(await repository.load()).toEqual('Bob');
    });
  });

  describe('get user', () => {
    test('gets user Anon if no user is stored', async () => {
      const repository = new Repository();

      await getUser(store, repository);

      expect(store.getState().user).toEqual('Anon');
    });

    test('gets stored user', async () => {
      const repository = new Repository();
      await repository.store('Bob');

      await getUser(store, repository);

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('poll talks', () => {
    test('sets talks', async () => {
      const api = new FakeApi({
        talks: new ConfigurableResponses([
          {
            notModified: false,
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
      const api = new FakeApi({
        talks: new ConfigurableResponses([{ notModified: true }]),
      });

      await pollTalks(store, api, 1);

      expect(store.getState().talks).toEqual([]);
    });

    test('recovers after error', async () => {
      const api = new FakeApi({
        talks: new ConfigurableResponses([
          new Error(),
          {
            notModified: false,
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
      const api = new FakeApi();

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
      const api = new FakeApi();

      await deleteTalk({ title: 'foobar' }, api);

      expect(api.deleteTalk).nthCalledWith(1, 'foobar');
    });
  });

  describe('add comment', () => {
    test('posts comment', async () => {
      const api = new FakeApi();

      await addComment(
        { talkTitle: 'foobar', comment: 'lorem ipsum' },
        store,
        api,
      );

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
    this.putTalk = jest.fn();
    this.deleteTalk = jest.fn();
    this.postComment = jest.fn();
  }

  async getTalks() {
    return this.#talks.next();
  }
}
