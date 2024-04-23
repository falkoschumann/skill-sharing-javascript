import { describe, expect, test } from '@jest/globals';

import { Services } from '../../../public/js/application/services.js';
import { reducer } from '../../../public/js/domain/reducer.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';
import { createStore } from '../../../public/js/util/store.js';

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

      await services.getUser();

      expect(store.getState().user).toEqual('Anon');
    });

    test('Is stored user', async () => {
      const { services, store } = configure({ settings: { username: 'Bob' } });

      await services.getUser();

      expect(store.getState().user).toEqual('Bob');
    });
  });

  describe('Submit talk', () => {
    test('Submits talk', async () => {
      const { services, api } = configure();
      const talksPut = api.trackTalksPut();

      await services.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });

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
    test('Talks updated', async () => {
      const { services, store } = configure();

      await services.talksUpdated({
        talks: [
          {
            title: 'title 1',
            presenter: 'presenter 1',
            summary: 'summary 1',
          },
        ],
      });

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
    });

    test('Polls talks', async () => {
      const { services, store } = configure({
        talks: [
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
        ],
      });

      await services.pollTalks(2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
        { title: 'title 2', presenter: 'presenter 2', summary: 'summary 2' },
      ]);
    });

    test('Does not update talks, if not modified', async () => {
      const { services, store, api } = configure({
        talks: [
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
        ],
      });
      const talksGet = api.trackTalksGet();

      await services.pollTalks(2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
      expect(talksGet.data).toEqual([
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
        'not modified',
      ]);
    });

    test('Recovers after network error', async () => {
      const { services, store, api } = configure({
        talks: [
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
        ],
      });
      const talksGet = api.trackTalksGet();

      await services.pollTalks(2);

      expect(store.getState().talks).toEqual([
        { title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' },
      ]);
      expect(talksGet.data).toEqual([
        'network error',
        [{ title: 'title 1', presenter: 'presenter 1', summary: 'summary 1' }],
      ]);
    });

    test('Recovers after server error', async () => {
      const { services, store, api } = configure({
        talks: [
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
        ],
      });
      const talksGet = api.trackTalksGet();

      await services.pollTalks(2);

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

function configure({ settings, talks } = {}) {
  const store = createStore(reducer);
  const repository = Repository.createNull(settings);
  const api = Api.createNull(talks);
  const services = new Services(store, repository, api);
  return { services, store, repository, api };
}
