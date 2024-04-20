import { describe, expect, test } from '@jest/globals';

import { createStore } from '../../../public/js/domain/store.js';

describe('Store', () => {
  describe('Create store', () => {
    test('Creates store with initial state', () => {
      const store = new createStore(reducer, initialState);

      expect(store.getState()).toEqual(initialState);
    });

    test('Creates store and initializes state with reducer', () => {
      const store = new createStore(reducer);

      expect(store.getState()).toEqual(initialState);
    });
  });

  describe('Subscribe', () => {
    test('Does not emit event, if state is not changed', () => {
      const store = configureStore();
      let called = 0;
      store.subscribe(() => called++);

      store.dispatch({ type: 'unknown-action' });

      expect(store.getState()).toEqual({ user: 'Alice' });
      expect(called).toBe(0);
    });

    test('Emits event, if state is changed', () => {
      const store = configureStore();
      let called = 0;
      store.subscribe(() => called++);

      store.dispatch({ type: 'user-changed', name: 'Bob' });

      expect(store.getState()).toEqual({ user: 'Bob' });
      expect(called).toBe(1);
    });

    test('Does not emit event, if listener is unsubscribed', () => {
      const store = configureStore();
      let called = 0;
      const unsubscribe = store.subscribe(() => called++);

      unsubscribe();
      store.dispatch({ type: 'user-changed', name: 'Bob' });

      expect(store.getState()).toEqual({ user: 'Bob' });
      expect(called).toBe(0);
    });
  });
});

function configureStore() {
  return new createStore(reducer, { user: 'Alice' });
}

const initialState = { user: '' };

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'user-changed':
      return { ...state, user: action.name };
    default:
      return state;
  }
}
