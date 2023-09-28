import { html, render } from '../vendor.js';

import {
  addComment,
  deleteTalk,
  submitTalk,
} from '../application/client-services.js';
import { api } from '../app.config.js';
import { store } from '../store.js';

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
              ${talk.comments.map(
                (comment) => html` <p class="comment">${comment.message}</p> `,
              )}
              <form @submit=${(e) => this.#onSubmit(e)}>
                <input
                  type="text"
                  hidden
                  name="talkTitle"
                  value="${talk.title}"
                />
                <input type="text" required name="comment" />
                <button type="submit">Add comment</button>
              </form>
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

  /** @param {Event} event  */
  #onSubmit(event) {
    event.preventDefault();
    const form = /** @type {HTMLFormElement} */ (event.target);
    form.reportValidity();
    if (form.checkValidity()) {
      const formData = new FormData(form);
      const title = formData.get('talkTitle');
      const comment = {
        message: formData.get('comment'),
      };
      addComment(title, comment, api);
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
      submitTalk(talk, api);
      form.reset();
    }
  }
}

window.customElements.define('s-talkform', TalkForm);
