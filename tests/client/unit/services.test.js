import { describe, expect, jest, test } from '@jest/globals';

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

import { ConfigurableResponses } from '../../configurable-responses.js';

describe('Change user', () => {
  test('Updates user name', async () => {
    let store = new Store(reducer, initialState);
    let repository = new FakeRepository();

    await changeUser({ userName: 'Bob' }, store, repository);

    expect(store.getState().user).toEqual('Bob');
    expect(await repository.load()).toEqual({ userName: 'Bob' });
  });
});

describe('User', () => {
  test('Anon is the default user', async () => {
    let store = new Store(reducer, initialState);
    let repository = new FakeRepository();

    await getUser(store, repository);

    expect(store.getState().user).toEqual('Anon');
  });

  test('Is stored user', async () => {
    let store = new Store(reducer, initialState);
    let repository = new FakeRepository();
    await repository.store({ userName: 'Bob' });

    await getUser(store, repository);

    expect(store.getState().user).toEqual('Bob');
  });
});

describe('Submit talk', () => {
  test('Submits talk', async () => {
    let store = new Store(reducer, initialState);
    let api = new FakeApi();

    await submitTalk({ title: 'foobar', summary: 'lorem ipsum' }, store, api);

    expect(api.putTalk).nthCalledWith(1, {
      title: 'foobar',
      presenter: 'Anon',
      summary: 'lorem ipsum',
    });
  });
});

describe('Post comment', () => {
  test('Posts comment', async () => {
    let store = new Store(reducer, initialState);
    let api = new FakeApi();

    await addComment({ title: 'foobar', comment: 'lorem ipsum' }, store, api);

    expect(api.postComment).nthCalledWith(1, 'foobar', {
      author: 'Anon',
      message: 'lorem ipsum',
    });
  });
});

describe('Delete talk', () => {
  test('Deletes talk', async () => {
    let api = new FakeApi();

    await deleteTalk({ title: 'foobar' }, api);

    expect(api.deleteTalk).nthCalledWith(1, 'foobar');
  });
});

describe('Talks', () => {
  test('Polls talks', async () => {
    let store = new Store(reducer, initialState);
    let api = new FakeApi({
      talks: new ConfigurableResponses([
        {
          isNotModified: false,
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

  test('Does not update talks, if not modified', async () => {
    let store = new Store(reducer, initialState);
    let api = new FakeApi({
      talks: new ConfigurableResponses([{ isNotModified: true }]),
    });

    await pollTalks(store, api, 1);

    expect(store.getState().talks).toEqual([]);
  });

  test('Recovers after error', async () => {
    let store = new Store(reducer, initialState);
    let api = new FakeApi({
      talks: new ConfigurableResponses([
        new Error(),
        {
          isNotModified: false,
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

class FakeRepository {
  #talks;

  constructor(talks = []) {
    this.#talks = talks;
  }

  async load() {
    return this.#talks;
  }

  async store(talks) {
    this.#talks = talks;
  }
}

class FakeApi {
  #talks;

  constructor({ talks = new ConfigurableResponses() } = {}) {
    this.#talks = talks;
    this.putTalk = jest.fn(() => Promise.resolve());
    this.deleteTalk = jest.fn(() => Promise.resolve());
    this.postComment = jest.fn(() => Promise.resolve());
  }

  async getTalks() {
    return this.#talks.next();
  }
}
