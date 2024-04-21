import { html, render } from '../../vendor/lit-html.js';

import { store } from './store.js';

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
  #unsubscribeStore;

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.#unsubscribeStore = store.subscribe(() => this.updateView());
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
  }

  updateView() {
    this.state = this.extractState(store.getState());
    if (this.state === this.oldState) {
      return;
    }

    super.updateView();
    this.oldState = this.state;
  }

  extractState(state) {
    return state;
  }
}
