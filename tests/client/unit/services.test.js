import { describe, expect, test } from '@jest/globals';

import services from '../../../public/js/application/services.js';
import { reducer } from '../../../public/js/domain/reducer.js';
import { createStore } from '../../../public/js/domain/store.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';

describe('Services', () => {
  describe('Change user', () => {
    test('Updates user name', async () => {
      let store = createStore(reducer);
      let repository = Repository.createNull();

      await services.changeUser({ userName: 'Bob' }, store, repository);

      expect(store.getState().user).toEqual('Bob');
      expect(repository.lastStored).toEqual({ userName: 'Bob' });
    });
  });

  describe('User', () => {
    test('Anon is the default user', async () => {
      let store = createStore(reducer);
      let repository = Repository.createNull();

      await services.getUser(store, repository);

      expect(store.getState().user).toEqual('Anon');
    });

    test('Is stored user', async () => {
      let store = createStore(reducer);
      let repository = Repository.createNull({ userName: 'Bob' });

      await services.getUser(store, repository);

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('Submit talk', () => {
    test('Submits talk', async () => {
      let store = createStore(reducer);
      let api = Api.createNull();
      let talksPut = api.trackTalksPut();

      await services.submitTalk(
        { title: 'foobar', summary: 'lorem ipsum' },
        store,
        api,
      );

      expect(talksPut.data).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
        },
      ]);
    });
  });

  describe('Post comment', () => {
    test('Posts comment', async () => {
      let store = createStore(reducer);
      let api = Api.createNull();
      let commentsPosted = api.trackCommentsPosted();

      await services.addComment(
        { title: 'foobar', comment: 'lorem ipsum' },
        store,
        api,
      );

      expect(commentsPosted.data).toEqual([
        { title: 'foobar', author: 'Anon', message: 'lorem ipsum' },
      ]);
    });
  });

  describe('Delete talk', () => {
    test('Deletes talk', async () => {
      let api = Api.createNull();
      let talksDeleted = api.trackTalksDeleted();

      await services.deleteTalk({ title: 'foobar' }, api);

      expect(talksDeleted.data).toEqual([{ title: 'foobar' }]);
    });
  });

  describe('Talks', () => {
    test('Talks updated', async () => {
      let store = createStore(reducer);

      await services.talksUpdated(
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
        store,
      );

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
    });

    test('Polls talks', async () => {
      let store = createStore(reducer);
      let api = Api.createNull([
        {
          status: 200,
          headers: { etag: '1' },
          body: '[{"title":"title 1","presenter":"presenter 1","summary":"summary 1"}]',
        },
        {
          status: 200,
          headers: { etag: '2' },
          body: '[{"title":"title 1","presenter":"presenter 1","summary":"summary 1"},{"title":"title 2","presenter":"presenter 2","summary":"summary 2"}]',
        },
      ]);

      await services.pollTalks(store, api, 2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
        { title: 'title 2', presenter: 'presenter 2', summary: 'summary 2' },
      ]);
    });

    test('Does not update talks, if not modified', async () => {
      let store = createStore(reducer);
      let api = Api.createNull([
        {
          status: 200,
          headers: { etag: '1' },
          body: '[{"title":"title 1","presenter":"presenter 1","summary":"summary 1"}]',
        },
        { status: 304 },
      ]);
      let talksGet = api.trackTalksGet();

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
      let store = createStore(reducer);
      let api = Api.createNull([
        new Error('network error'),
        {
          status: 200,
          headers: { etag: '1' },
          body: '[{"title":"title 1","presenter":"presenter 1","summary":"summary 1"}]',
        },
      ]);
      let talksGet = api.trackTalksGet();

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
      let store = createStore(reducer);
      let api = Api.createNull([
        {
          status: 500,
        },
        {
          status: 200,
          headers: { etag: '1' },
          body: '[{"title":"title 1","presenter":"presenter 1","summary":"summary 1"}]',
        },
      ]);
      let talksGet = api.trackTalksGet();

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
