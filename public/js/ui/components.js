import { html, render } from '../vendor.js';

import { api, store } from '../app.config.js';
import {
  deleteTalk,
  newTalkUpdated,
  submitTalk,
} from '../application/client-services.js';

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
      <div class="talks">
        ${talks.map(
          (talk) => html`
            <section class="talk">
              <h2>
                ${talk.title}
                <button @click=${(_) => this.#onClickDelete(talk)}>
                  Delete
                </button>
              </h2>
              <p>${talk.summary}</p>
            </section>
          `,
        )}
      </div>
    `;
    render(template, this);
  }

  #onClickDelete(talk) {
    deleteTalk(talk.title, api);
  }
}

window.customElements.define('s-talks', Talks);

class TalkForm extends HTMLElement {
  connectedCallback() {
    const template = html`
      <form @submit=${(e) => this.onSubmit(e)}>
        <h3>Submit a Talk</h3>
        <label
          >Title:
          <input
            type="text"
            required
            name="title"
            @keyup=${(e) => this.#onUserInput(e)}
          />
        </label>
        <label
          >Summary:
          <input
            type="text"
            required
            name="summary"
            @keyup=${(e) => this.#onUserInput(e)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    `;
    render(template, this);
  }

  /** @param {Event} event  */
  onSubmit(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    form.reportValidity();
    if (form.checkValidity()) {
      submitTalk(store, api);
      form.reset();
    }
  }

  /** @param {Event} event  */
  #onUserInput(event) {
    const { name, value } = /** @type {HTMLInputElement} */ (event.target);
    newTalkUpdated(name, value, store);
  }
}

window.customElements.define('s-talkform', TalkForm);
