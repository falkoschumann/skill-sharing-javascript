import { html, render } from 'lit-html';

import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../application/services.js';
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

export async function changeUserAction({ userName }) {
  return changeUser({ userName }, store, repository);
}

export async function getUserAction() {
  return getUser(store, repository);
}

export async function submitTalkAction({ title, summary }) {
  return submitTalk({ title, summary }, store, api);
}

export async function deleteTalkAction({ title }) {
  return deleteTalk({ title }, api);
}

export async function pollTalksAction() {
  return pollTalks(store, api);
}

export async function addCommentAction({ title, comment }) {
  return addComment({ title, comment }, store, api);
}
