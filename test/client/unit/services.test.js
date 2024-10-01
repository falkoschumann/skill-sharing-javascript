import { describe, expect, test } from '@jest/globals';

import { createStore, LongPollingClient } from '@falkoschumann/shared';

import { Services } from '../../../public/js/application/services.js';
import { reducer } from '../../../public/js/domain/reducer.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';
import { Talk } from '../../../public/js/domain/talks.js';
import { User } from '../../../public/js/domain/users.js';

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
      const { services, store, talksClient } = configure();
      await services.connectTalks();

      const talk = Talk.createTestInstance();
      await talksClient.simulateResponse({
        status: 200,
        headers: { etag: '1' },
        body: [talk],
      });

      expect(store.getState().talks).toEqual([talk]);
      talksClient.close();
    });
  });
});

function configure({ settings } = {}) {
  const store = createStore(reducer);
  const repository = Repository.createNull(settings);
  const fetchStub = async () => {};
  const talksClient = LongPollingClient.createNull();
  const api = new Api(talksClient, fetchStub);
  const services = new Services(store, repository, api);
  return { services, store, repository, api, talksClient };
}
