/** Simple event emitter class. */
class EventEmitter {
  #listerns = [];

  /**
   * @param {Function} callback
   * @return {Function}
   */
  addListener(callback) {
    this.#listerns.push(callback);
    return () => {
      this.#listerns = this.#listerns.filter((l) => l != callback);
    };
  }

  /** @param {any} event */
  emit(event) {
    this.#listerns.forEach((callback) => callback(event));
  }
}

/** Stores and updates the application state. */
class Store {
  #state;
  #reducer;
  #onStateChanged = new EventEmitter();

  /**
   * @param {any} initialState
   * @param {Function} reducer
   */
  constructor(initialState, reducer) {
    this.#state = initialState;
    this.#reducer = reducer;
  }

  /** @return {any} */
  get state() {
    return this.#state;
  }

  /**
   * @param {Function} callback
   * @return {Function}
   */
  addListener(callback) {
    return this.#onStateChanged.addListener(callback);
  }

  /** @param {any} action */
  dispatch(action) {
    this.#state = this.#reducer(this.#state, action);
    this.#onStateChanged.emit();
  }
}

/**
 * Determines a new state from the current state and an action.
 *
 * @param {any} state
 * @param {any} action
 * @return {any}
 */
function reduce(state, action) {
  switch (action.type) {
    case 'setTalks':
      return {...state, talks: action.talks};
    default:
      return state;
  }
}

export const store = new Store({talks: []}, reduce);
