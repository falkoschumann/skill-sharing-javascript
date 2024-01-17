import { html, render } from 'lit-html';

import { store } from './store.js';

export class Component extends HTMLElement {
  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.unsubscribe = store.subscribe(() => this.updateView());
    this.updateView();
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  updateView() {
    this.state = this.extractState(store.getState());
    if (this.state === this.oldState) {
      return;
    }

    render(this.getView(), this.getRenderTarget());
    this.oldState = this.state;
  }

  extractState(state) {
    return state;
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}
