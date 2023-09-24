import { describe, expect, jest, test } from '@jest/globals';

import {
  newTalk,
  pollTalks,
  talkUpdated,
} from '../../public/js/application/actions.js';
import { Store } from '../../public/js/domain/store.js';
import { ConfigurableResponses } from '../configurable-responses.js';

describe('actions', () => {
  describe('poll talks', () => {
    test('sets talks', async () => {
      const store = new Store();
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
      const store = new Store();
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
      const store = new Store();
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

  describe('talk updated', () => {
    test('updates a talk property ', async () => {
      const store = new Store();

      await talkUpdated('title', 'foobar', store);

      expect(store.getState()).toEqual({
        talks: [],
        talk: { title: 'foobar', summary: '' },
      });
    });
  });

  describe('new talk', () => {
    test('submits talk', async () => {
      const store = new Store();
      await talkUpdated('title', 'foobar', store);
      await talkUpdated('summary', 'lorem ipsum', store);
      const api = new FakeApi();

      await newTalk(store, api);

      expect(api.putTalk).nthCalledWith(1, {
        title: 'foobar',
        summary: 'lorem ipsum',
      });
    });
  });

  describe('store', () => {
    test('does not emit event, if state is not changed', () => {
      const listener = jest.fn();
      const store = new Store();
      store.subscribe(listener);

      store.dispatch({ type: 'foobar' });

      expect(listener).not.toBeCalled();
    });

    test('emits event, if state is changed', () => {
      const listener = jest.fn();
      const store = new Store();
      store.subscribe(listener);

      store.dispatch({ type: 'talk-updated', name: 'title', value: 'foobar' });

      expect(listener).toBeCalledTimes(1);
    });

    test('does not emit event, if listener is unsubscribed', () => {
      const listener = jest.fn();
      const store = new Store();
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
    this.putTalk = jest.fn();
    this.#talks = talks;
  }

  async getTalks() {
    return this.#talks.next();
  }
}
