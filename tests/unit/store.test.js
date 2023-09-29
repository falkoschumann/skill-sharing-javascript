import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { Store } from '../../public/js/domain/store.js';

describe('store', () => {
  let store;

  beforeEach(() => {
    store = new Store(reducer, { user: 'Alice' });
  });

  test('does not emit event, if state is not changed', () => {
    const listener = jest.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'unknown-action' });

    expect(listener).not.toBeCalled();
  });

  test('emits event, if state is changed', () => {
    const listener = jest.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'user-changed', name: 'Bob' });

    expect(listener).toBeCalledTimes(1);
  });

  test('does not emit event, if listener is unsubscribed', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch({ type: 'user-changed', name: 'Bob' });

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
