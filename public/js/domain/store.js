export function createStore(reducer, preloadedState) {
  let initialState = preloadedState || reducer(undefined, { type: '@@INIT' });
  return new Store(reducer, initialState);
}

/**
 * @typedef {Function} Reducer
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */

/**
 * @typedef {Object} State
 */

/**
 * @typedef {Object} Action
 * @property {string} type
 */

export class Store {
  #reducer;
  #state;
  #listeners = [];

  constructor(/** @type Reducer */ reducer, /** @type State */ initialState) {
    this.#reducer = reducer;
    this.#state = initialState;
  }

  getState() {
    return this.#state;
  }

  dispatch(/** @type Action */ action) {
    let oldState = this.#state;
    this.#state = this.#reducer(this.#state, action);
    if (oldState !== this.#state) {
      this.#emitChange();
    }
  }

  subscribe(/** @type Function */ listener) {
    this.#listeners.push(listener);
    return () => this.#unsubscribe(listener);
  }

  #emitChange() {
    this.#listeners.forEach((l) => l());
  }

  #unsubscribe(listener) {
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }
}
