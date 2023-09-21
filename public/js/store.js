/**
 * Stores and updates the application state.
 *
 * @event stateChanged
 */
class Store extends EventTarget {
  #state;
  #reducer;

  /**
   * @param {Function} reducer
   * @param {any} initialState
   */
  constructor(reducer, initialState) {
    super();
    this.#reducer = reducer;
    this.#state = initialState;
  }

  /** @return {any} */
  get state() {
    return this.#state;
  }

  /** @param {any} action */
  dispatch(action) {
    this.#state = this.#reducer(this.#state, action);
    this.dispatchEvent(new CustomEvent('stateChanged'));
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

export const store = new Store(reduce, {talks: []});
