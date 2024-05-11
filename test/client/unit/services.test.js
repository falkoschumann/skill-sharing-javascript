import { describe, expect, test } from '@jest/globals';

import { Services } from '../../../public/js/application/services.js';
import { reducer } from '../../../public/js/domain/reducer.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { LongPollingClient } from '../../../public/js/infrastructure/long-polling-client.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';
import { createStore } from '../../../public/js/util/store.js';
import { Talk } from '../../../public/js/domain/talks.js';

describe('Services', () => {
  describe('Change user', () => {
    test('Updates user name', async () => {
      const { services, store, repository } = configure();

      await services.changeUser({ username: 'Bob' });

      expect(store.getState().user).toEqual('Bob');
      expect(repository.lastSettings).toEqual({ username: 'Bob' });
    });
  });

  describe('User', () => {
    test('Anon is the default user', async () => {
      const { services, store } = configure();

      await services.loadUser();

      expect(store.getState().user).toEqual('Anon');
    });

    test('Is stored user', async () => {
      const { services, store } = configure({ settings: { username: 'Bob' } });

      await services.loadUser();

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('Submit talk', () => {
    test('Submits talk', async () => {
      const { services, api } = configure();
      const talksPut = api.trackTalksPut();

      await services.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });

      expect(talksPut.data).toEqual([
        { title: 'Foobar', presenter: 'Anon', summary: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Post comment', () => {
    test('Posts comment', async () => {
      const { services, api } = configure();
      const commentsPosted = api.trackCommentsPosted();

      await services.addComment({ title: 'Foobar', comment: 'Lorem ipsum' });

      expect(commentsPosted.data).toEqual([
        { title: 'Foobar', author: 'Anon', message: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Delete talk', () => {
    test('Deletes talk', async () => {
      const { services, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await services.deleteTalk({ title: 'Foobar' });

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });
  });

  describe('Talks', () => {
    test('Updates talks', async () => {
      const { services, store, talksClient } = configure();
      await services.connectTalks();

      await talksClient.simulateResponse({
        status: 200,
        headers: { etag: '1' },
        body: [Talk.createTestInstance()],
      });
      await talksClient.simulateResponse({
        status: 200,
        headers: { etag: '2' },
        body: [Talk.createTestInstance(), Talk.createTestInstance()],
      });

      expect(store.getState().talks).toEqual([
        Talk.createTestInstance(),
        Talk.createTestInstance(),
      ]);
      talksClient.close();
    });
  });
});

function configure({ settings } = {}) {
  const store = createStore(reducer);
  const repository = Repository.createNull(settings);
  const talksClient = LongPollingClient.createNull();
  const api = new Api(async () => {}, talksClient);
  const services = new Services(store, repository, api);
  return { services, store, repository, api, talksClient };
}
