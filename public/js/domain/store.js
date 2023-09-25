export class Store {
  #state;
  #listeners;

  constructor() {
    this.#state = {
      talks: [],
      talk: { title: '', summary: '' },
    };
    this.#listeners = [];
  }

  getState() {
    return this.#state;
  }

  dispatch(action) {
    const oldState = this.#state;
    this.#state = this.#reduce(this.#state, action);
    if (oldState !== this.#state) {
      this.#emitChange();
    }
  }

  subscribe(listener) {
    this.#listeners.push(listener);
    return () => this.#unsubscribe(listener);
  }

  #reduce(state, action) {
    switch (action.type) {
      case 'set-talks':
        return { ...state, talks: action.talks };
      case 'talk-updated':
        return {
          ...state,
          talk: { ...state.talk, [action.name]: action.value },
        };
      default:
        return state;
    }
  }

  #emitChange() {
    this.#listeners.forEach((l) => l());
  }

  #unsubscribe(listener) {
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }
}
