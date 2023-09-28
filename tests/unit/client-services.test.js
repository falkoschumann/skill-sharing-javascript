import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  addComment,
  deleteTalk,
  pollTalks,
  submitTalk,
} from '../../public/js/application/client-services.js';
import { initialState, reducer } from '../../public/js/domain/reducer.js';
import { ConfigurableResponses } from '../configurable-responses.js';
import { Store } from '../../public/js/domain/store.js';

describe('client services', () => {
  let store;

  beforeEach(() => {
    store = new Store(reducer, initialState);
  });

  describe('poll talks', () => {
    test('sets talks', async () => {
      const api = new FakeApi({
        talks: new ConfigurableResponses([
          {
            notModified: false,
            tag: '1',
            talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
          },
        ]),
      });

      await pollTalks(store, api, 1);

      expect(store.getState()).toEqual({
        talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
        talk: { title: '', summary: '' },
      });
    });

    test('does not set talks, if not modified', async () => {
      const api = new FakeApi({
        talks: new ConfigurableResponses([{ notModified: true }]),
      });

      await pollTalks(store, api, 1);

      expect(store.getState()).toEqual({
        talks: [],
        talk: { title: '', summary: '' },
      });
    });

    test('recovers after error', async () => {
      const api = new FakeApi({
        talks: new ConfigurableResponses([
          new Error(),
          {
            notModified: false,
            tag: '1',
            talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
          },
        ]),
      });

      await pollTalks(store, api, 2);

      expect(store.getState()).toEqual({
        talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
        talk: { title: '', summary: '' },
      });
    });
  });

  describe('submit talk', () => {
    test('submits talk', async () => {
      const api = new FakeApi();

      await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, api);

      expect(api.putTalk).nthCalledWith(1, {
        title: 'foobar',
        summary: 'lorem ipsum',
      });
    });
  });

  describe('delete talk', () => {
    test('deletes talk', async () => {
      const api = new FakeApi();

      await deleteTalk('foobar', api);

      expect(api.deleteTalk).nthCalledWith(1, 'foobar');
    });
  });

  describe('add comment', () => {
    test('posts comment', async () => {
      const api = new FakeApi();

      await addComment('foobar', { message: 'lorem ipsum' }, api);

      expect(api.postComment).nthCalledWith(1, 'foobar', {
        message: 'lorem ipsum',
      });
    });
  });

  describe('store', () => {
    test('does not emit event, if state is not changed', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'foobar' });

      expect(listener).not.toBeCalled();
    });

    test('emits event, if state is changed', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch({
        type: 'new-talk-updated',
        name: 'title',
        value: 'foobar',
      });

      expect(listener).toBeCalledTimes(1);
    });

    test('does not emit event, if listener is unsubscribed', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.dispatch({ type: 'talk-updated', name: 'title', value: 'foobar' });

      expect(listener).not.toBeCalled();
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
