import { describe, expect, test } from 'vitest';

import { createStore, LongPollingClient } from '@muspellheim/shared';

import { Services } from '../../../src/application/services.js';
import { reducer } from '../../../src/domain/reducer.js';
import { Api } from '../../../src/infrastructure/api.js';
import { Repository } from '../../../src/infrastructure/repository.js';
import { Talk } from '../../../src/domain/talks.js';
import { User } from '../../../src/domain/users.js';

describe('Services', () => {
  describe('Change user', () => {
    test('Updates user name', async () => {
      const { services, store, repository } = configure();

      const user = User.createTestInstance();
      await services.changeUser(user);

      expect(store.getState().user).toEqual(user.username);
      expect(repository.lastUser).toEqual(user);
    });
  });

  describe('User', () => {
    test('Anon is the default user', async () => {
      const { services, store } = configure();

      await services.loadUser();

      expect(store.getState().user).toEqual('Anon');
    });

    test('Is stored user', async () => {
      const user = User.createTestInstance();
      const { services, store } = configure({ settings: user });

      await services.loadUser();

      expect(store.getState().user).toEqual(user.username);
    });
  });

  describe('Submit talk', () => {
    test('Adds talk to list', async () => {
      const { services, api } = configure();
      const talksPut = api.trackTalksPut();

      await services.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });

      expect(talksPut.data).toEqual([
        { title: 'Foobar', presenter: 'Anon', summary: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Adds comment', () => {
    test('Adds comment to an existing talk', async () => {
      const { services, api } = configure();
      const commentsPosted = api.trackCommentsPosted();

      await services.addComment({ title: 'Foobar', comment: 'Lorem ipsum' });

      expect(commentsPosted.data).toEqual([
        { title: 'Foobar', author: 'Anon', message: 'Lorem ipsum' },
      ]);
    });

    test.todo('Reports an error if talk does not exists');
  });

  describe('Delete talk', () => {
    test('Removes talk from list', async () => {
      const { services, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await services.deleteTalk({ title: 'Foobar' });

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });

    test('Ignores already removed talk', async () => {
      const { services, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await services.deleteTalk({ title: 'Foobar' });

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });
  });

  describe('Talks', () => {
    test('Lists all talks', async () => {
      const talk = Talk.createTestInstance();
      const { services, store, talksClient } = configure({
        fetchResponse: {
          status: 200,
          headers: { etag: '1' },
          body: JSON.stringify([talk]),
        },
      });
      const result = new Promise((resolve) =>
        talksClient.addEventListener('message', () => resolve()),
      );

      await services.connectTalks();
      await result;

      expect(store.getState().talks).toEqual([talk]);
      talksClient.close();
    });
  });
});

function configure({ settings, fetchResponse } = {}) {
  const store = createStore(reducer);
  const repository = Repository.createNull(settings);
  const fetchStub = async () => {};
  const talksClient = LongPollingClient.createNull({ fetchResponse });
  const api = new Api(talksClient, fetchStub);
  const services = new Services(store, repository, api);
  return { services, store, repository, api, talksClient };
}
