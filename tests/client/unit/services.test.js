import { describe, expect, test } from '@jest/globals';

import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../../../public/js/application/services.js';
import { initialState, reducer } from '../../../public/js/domain/reducer.js';
import { Store } from '../../../public/js/domain/store.js';
import { Api } from '../../../public/js/infrastructure/api.js';
import { Repository } from '../../../public/js/infrastructure/repository.js';

describe('Change user', () => {
  test('Updates user name', async () => {
    let store = new Store(reducer, initialState);
    let repository = Repository.createNull();

    await changeUser({ userName: 'Bob' }, store, repository);

    expect(store.getState().user).toEqual('Bob');
    expect(repository.lastStored).toEqual({ userName: 'Bob' });
  });
});

describe('User', () => {
  test('Anon is the default user', async () => {
    let store = new Store(reducer, initialState);
    let repository = Repository.createNull();

    await getUser(store, repository);

    expect(store.getState().user).toEqual('Anon');
  });

  test('Is stored user', async () => {
    let store = new Store(reducer, initialState);
    let repository = Repository.createNull({ userName: 'Bob' });

    await getUser(store, repository);

    expect(store.getState().user).toEqual('Bob');
  });
});

describe('Submit talk', () => {
  test('Submits talk', async () => {
    let store = new Store(reducer, initialState);
    let api = Api.createNull();
    let talksPut = api.trackTalksPut();

    await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, store, api);

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
    let store = new Store(reducer, initialState);
    let api = Api.createNull();
    let commentsPosted = api.trackCommentsPosted();

    await addComment({ title: 'foobar', comment: 'lorem ipsum' }, store, api);

    expect(commentsPosted.data).toEqual([
      { title: 'foobar', author: 'Anon', message: 'lorem ipsum' },
    ]);
  });
});

describe('Delete talk', () => {
  test('Deletes talk', async () => {
    let api = Api.createNull();
    let talksDeleted = api.trackTalksDeleted();

    await deleteTalk({ title: 'foobar' }, api);

    expect(talksDeleted.data).toEqual([{ title: 'foobar' }]);
  });
});

describe('Talks', () => {
  test('Polls talks', async () => {
    let store = new Store(reducer, initialState);
    let api = Api.createNull({
      headers: { etag: '1' },
      body: '[{"title":"foobar","presenter":"Anon","summary":"lorem ipsum"}]',
    });

    await pollTalks(store, api, 1);

    expect(store.getState().talks).toEqual([
      { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
    ]);
  });

  test('Does not update talks, if not modified', async () => {
    let store = new Store(reducer, initialState);
    let api = Api.createNull({ status: 304 });

    await pollTalks(store, api, 1);

    expect(store.getState().talks).toEqual([]);
  });

  test('Recovers after error', async () => {
    let store = new Store(reducer, initialState);
    let api = Api.createNull([
      new Error(),
      {
        headers: { etag: '1' },
        body: '[{"title":"foobar","presenter":"Anon","summary":"lorem ipsum"}]',
      },
    ]);

    await pollTalks(store, api, 2);

    expect(store.getState().talks).toEqual([
      { title: 'foobar', presenter: 'Anon', summary: 'lorem ipsum' },
    ]);
  });
});
