import { describe, expect, test } from '@jest/globals';

import * as services from '../../../public/js/application/services.js';
import { reducer } from '../../../public/js/domain/reducer.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';
import { createStore } from '../../../public/js/util/store.js';

describe('Services', () => {
  describe('Change user', () => {
    test('Updates user name', async () => {
      const store = createStore(reducer);
      const repository = Repository.createNull();

      await services.changeUser({ username: 'Bob' }, store, repository);

      expect(store.getState().user).toEqual('Bob');
      expect(repository.lastSettings).toEqual({ username: 'Bob' });
    });
  });

  describe('User', () => {
    test('Anon is the default user', async () => {
      const store = createStore(reducer);
      const repository = Repository.createNull();

      await services.getUser(store, repository);

      expect(store.getState().user).toEqual('Anon');
    });

    test('Is stored user', async () => {
      const store = createStore(reducer);
      const repository = Repository.createNull({ username: 'Bob' });

      await services.getUser(store, repository);

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('Submit talk', () => {
    test('Submits talk', async () => {
      const store = createStore(reducer);
      const api = Api.createNull();
      const talksPut = api.trackTalksPut();

      await services.submitTalk(
        { title: 'Foobar', summary: 'Lorem ipsum' },
        store,
        api,
      );

      expect(talksPut.data).toEqual([
        {
          title: 'Foobar',
          presenter: 'Anon',
          summary: 'Lorem ipsum',
        },
      ]);
    });
  });

  describe('Post comment', () => {
    test('Posts comment', async () => {
      const store = createStore(reducer);
      const api = Api.createNull();
      const commentsPosted = api.trackCommentsPosted();

      await services.addComment(
        { title: 'Foobar', comment: 'Lorem ipsum' },
        store,
        api,
      );

      expect(commentsPosted.data).toEqual([
        { title: 'Foobar', author: 'Anon', message: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Delete talk', () => {
    test('Deletes talk', async () => {
      const api = Api.createNull();
      const talksDeleted = api.trackTalksDeleted();

      await services.deleteTalk({ title: 'Foobar' }, api);

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });
  });

  describe('Talks', () => {
    test('Talks updated', async () => {
      const store = createStore(reducer);

      await services.talksUpdated(
        {
          talks: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
          ],
        },
        store,
      );

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
    });

    test('Polls talks', async () => {
      const store = createStore(reducer);
      const api = Api.createNull([
        {
          status: 200,
          headers: { etag: '1' },
          body: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
          ],
        },
        {
          status: 200,
          headers: { etag: '2' },
          body: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
            {
              title: 'title 2',
              presenter: 'presenter 2',
              summary: 'summary 2',
            },
          ],
        },
      ]);

      await services.pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
        { title: 'title 2', presenter: 'presenter 2', summary: 'summary 2' },
      ]);
    });

    test('Does not update talks, if not modified', async () => {
      const store = createStore(reducer);
      const api = Api.createNull([
        {
          status: 200,
          headers: { etag: '1' },
          body: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
          ],
        },
        { status: 304 },
      ]);
      const talksGet = api.trackTalksGet();

      await services.pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
      expect(talksGet.data).toEqual([
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
        'not modified',
      ]);
    });

    test('Recovers after network error', async () => {
      const store = createStore(reducer);
      const api = Api.createNull([
        new Error('network error'),
        {
          status: 200,
          headers: { etag: '1' },
          body: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
          ],
        },
      ]);
      const talksGet = api.trackTalksGet();

      await services.pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
      expect(talksGet.data).toEqual([
        'network error',
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
      ]);
    });

    test('Recovers after server error', async () => {
      const store = createStore(reducer);
      const api = Api.createNull([
        {
          status: 500,
        },
        {
          status: 200,
          headers: { etag: '1' },
          body: [
            {
              title: 'title 1',
              presenter: 'presenter 1',
              summary: 'summary 1',
            },
          ],
        },
      ]);
      const talksGet = api.trackTalksGet();

      await services.pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
      expect(talksGet.data).toEqual([
        'HTTP error: 500',
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
      ]);
    });
  });
});
