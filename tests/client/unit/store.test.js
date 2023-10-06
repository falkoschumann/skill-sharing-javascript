import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { Store } from '../../../src/client/domain/store.js';

describe('store', () => {
  let store;

  beforeEach(() => {
    store = new Store(reducer, { user: 'Alice' });
  });

  test('does not emit event, if state is not changed', () => {
    let listener = jest.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'unknown-action' });

    expect(store.getState()).toEqual({ user: 'Alice' });
    expect(listener).not.toBeCalled();
  });

  test('emits event, if state is changed', () => {
    let listener = jest.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'user-changed', name: 'Bob' });

    expect(store.getState()).toEqual({ user: 'Bob' });
    expect(listener).toBeCalledTimes(1);
  });

  test('does not emit event, if listener is unsubscribed', () => {
    let listener = jest.fn();
    let unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch({ type: 'user-changed', name: 'Bob' });

    expect(store.getState()).toEqual({ user: 'Bob' });
    expect(listener).not.toBeCalled();
  });
});

function reducer(state, action) {
  switch (action.type) {
    case 'user-changed':
      return { ...state, user: action.name };
    default:
      return state;
  }
}
