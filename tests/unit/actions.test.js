import { describe, expect, jest, test } from '@jest/globals';

import {
  newTalk,
  pollTalks,
  talkUpdated,
} from '../../public/js/application/actions.js';
import { Store } from '../../public/js/domain/store.js';

describe('actions', () => {
  test('polls talks', async () => {
    const store = new Store();
    const api = new FakeApi({
      talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
    });

    await pollTalks(store, api);

    expect(store.getState()).toEqual({
      talks: [{ title: 'foobar', summary: 'lorem ipsum' }],
      talk: { title: '', summary: '' },
    });
  });

  test('talks updated', async () => {
    const store = new Store();

    await talkUpdated('title', 'foobar', store);

    expect(store.getState()).toEqual({
      talks: [],
      talk: { title: 'foobar', summary: '' },
    });
  });

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

class FakeApi {
  #talks;

  constructor({ talks = [] } = {}) {
    this.putTalk = jest.fn();
    this.#talks = talks;
  }

  async getTalks() {
    return this.#talks;
  }
}
