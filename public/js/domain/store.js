export function createStore(reducer) {
  return new Store(reducer);
}

export class Store {
  #reducer;
  #state;
  #listeners = [];

  constructor(reducer, initialState = reducer(undefined, { type: '' })) {
    this.#reducer = reducer;
    this.#state = initialState;
  }

  getState() {
    return this.#state;
  }

  dispatch(action) {
    let oldState = this.#state;
    this.#state = this.#reducer(this.#state, action);
    if (oldState !== this.#state) {
      this.#emitChange();
    }
  }

  subscribe(listener) {
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
