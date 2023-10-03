export type State = Record<string, unknown>;

export type Action = { type: string } & Record<string, unknown>;

export type Reducer<S extends State, A extends Action> = (
  state: S,
  action: A,
) => S;

export type Listener = () => void;

export type Unsubscriber = () => void;

export class Store<S extends State, A extends Action> {
  #reducer: Reducer<S, A>;
  #state: S;
  #listeners: Array<Listener>;

  constructor(reducer: Reducer<S, A>, initialState: S) {
    this.#reducer = reducer;
    this.#state = initialState;
    this.#listeners = [];
  }

  getState(): S {
    return this.#state;
  }

  dispatch(action: A) {
    const oldState = this.#state;
    this.#state = this.#reducer(this.#state, action);
    if (oldState !== this.#state) {
      this.#emitChange();
    }
  }

  subscribe(listener: Listener): Unsubscriber {
    this.#listeners.push(listener);
    return () => this.#unsubscribe(listener);
  }

  #emitChange() {
    this.#listeners.forEach((l) => l());
  }

  #unsubscribe(listener: Listener) {
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }
}
