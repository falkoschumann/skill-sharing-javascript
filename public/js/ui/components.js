import { html, render } from 'lit-html';

export class Component extends HTMLElement {
  connectedCallback() {
    this.updateView();
  }

  updateView() {
    render(this.getView(), this.getRenderTarget());
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}

export class Container extends Component {
  static initStore(store) {
    Container.#store = store;
  }

  static #store;

  #unsubscribeStore;

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.#unsubscribeStore = Container.#store.subscribe(() =>
      this.updateView(),
    );
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
  }

  extractState(state) {
    return state;
  }

  updateView() {
    this.state = this.extractState(Container.#store.getState());
    if (this.state === this.oldState) {
      return;
    }

    super.updateView();
    this.oldState = this.state;
  }
}
