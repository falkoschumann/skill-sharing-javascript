import { html, render } from '../../vendor/lit-html.js';

import * as services from '../application/services.js';
import { initialState, reducer } from '../domain/reducer.js';
import { Store } from '../domain/store.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

export const store = new Store(reducer, initialState);
const repository = globalThis.skillSharing?.repository ?? new Repository();
const api = globalThis.skillSharing?.api ?? new Api();

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

export async function changeUser({ userName }) {
  return services.changeUser({ userName }, store, repository);
}

export async function getUser() {
  return services.getUser(store, repository);
}

export async function submitTalk({ title, summary }) {
  return services.submitTalk({ title, summary }, store, api);
}

export async function deleteTalk({ title }) {
  return services.deleteTalk({ title }, api);
}

export async function pollTalks() {
  return services.pollTalks(store, api);
}

export async function addComment({ title, comment }) {
  return services.addComment({ title, comment }, store, api);
}
