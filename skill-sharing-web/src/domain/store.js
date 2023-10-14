export class AbstractStore {
  getState() {
    return {};
  }

  // eslint-disable-next-line no-unused-vars
  dispatch(action) {}

  // eslint-disable-next-line no-unused-vars
  subscribe(listener) {
    return () => {};
  }
}

export class Store extends AbstractStore {
  #reducer;
  #state;
  #listeners = [];

  constructor(reducer, initialState = {}) {
    super();
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
