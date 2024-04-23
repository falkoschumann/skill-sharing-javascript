import { html, render } from 'lit-html';

import { Services } from '../application/services.js';
import { reducer } from '../domain/reducer.js';
import { createStore } from '../util/store.js';

const store = createStore(reducer);
const services = Services.create(store);

export class Component extends HTMLElement {
  get services() {
    return services;
  }

  connectedCallback() {
    this.updateView();
  }

  updateView() {
    if (!this.isConnected) {
      return;
    }

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
