import { html, render } from '../vendor/lit-html/lit-html.js';

import {
  addComment,
  changeUser,
  deleteTalk,
  submitTalk,
} from '../application/services.js';
import { api, repository, store } from './app.config.js';

class UserField extends HTMLElement {
  connectedCallback() {
    const name = 'Anon';
    const template = html`
      <label
        >Your name:
        <input type="text" value="${name}" @change=${(e) => this.#onChange(e)}
      /></label>
    `;
    render(template, this);
  }

  /** @param {Event} event  */
  #onChange(event) {
    const input = /** @type {HTMLInputElement} */ (event.target);
    changeUser({ name: input.value }, store, repository);
  }
}

window.customElements.define('s-userfield', UserField);

class Talks extends HTMLElement {
  #talks;
  #unsubscribe;

  constructor() {
    super();
    this.#talks = [];
  }

  connectedCallback() {
    this.#unsubscribe = store.subscribe((_) => this.#updateView());
    this.#updateView();
  }

  disconnectedCallback() {
    this.#unsubscribe();
  }

  #updateView() {
    const talks = store.getState().talks;
    if (this.#talks === talks) {
      return;
    }

    this.#talks = talks;
    const template = html`
      <div class="talks">${talks.map((t) => this.#renderTalk(t))}</div>
    `;
    render(template, this);
  }

  #renderTalk(talk) {
    return html`
      <section class="talk">
        <h2>
          ${talk.title}
          <button @click=${(_) => this.#onClickDelete(talk)}>Delete</button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${talk.comments.map((c) => this.#renderComment(c))}
        <form @submit=${(e) => this.#onSubmit(e)}>
          <input type="text" hidden name="talkTitle" value="${talk.title}" />
          <input type="text" required name="comment" />
          <button type="submit">Add comment</button>
        </form>
      </section>
    `;
  }

  #renderComment(comment) {
    return html`
      <p class="comment">
        <strong>${comment.author}</strong>: ${comment.message}
      </p>
    `;
  }

  #onClickDelete(talk) {
    deleteTalk({ title: talk.title }, api);
  }

  /** @param {Event} event  */
  #onSubmit(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    form.reportValidity();
    if (form.checkValidity()) {
      const formData = new FormData(form);
      const talkTitle = formData.get('talkTitle');
      const comment = formData.get('comment');
      addComment({ talkTitle, comment }, store, api);
      form.reset();
    }
  }
}

window.customElements.define('s-talks', Talks);

class TalkForm extends HTMLElement {
  connectedCallback() {
    const template = html`
      <form @submit=${(e) => this.#onSubmit(e)}>
        <h3>Submit a Talk</h3>
        <label
          >Title:
          <input type="text" required name="title" />
        </label>
        <label
          >Summary:
          <input type="text" required name="summary" />
        </label>
        <button type="submit">Submit</button>
      </form>
    `;
    render(template, this);
  }

  /** @param {Event} event  */
  #onSubmit(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    form.reportValidity();
    if (form.checkValidity()) {
      const formData = new FormData(form);
      const talk = {
        title: formData.get('title'),
        summary: formData.get('summary'),
      };
      submitTalk(talk, store, api);
      form.reset();
    }
  }
}

window.customElements.define('s-talkform', TalkForm);
