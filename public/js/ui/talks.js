import { html } from '../../vendor/lit-html.js';

import * as actions from './actions.js';
import { Container } from './components.js';

class Talks extends Container {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`${this.state.map((talk) => this.#talkTemplate(talk))}`;
  }

  #talkTemplate(talk) {
    return html`
      <section class="talk">
        <h2>
          ${talk.title}
          <button @click=${() => actions.deleteTalk({ title: talk.title })}>
            Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${talk.comments.map(
          (comment) => html`
            <p class="comment">
              <strong>${comment.author}</strong>: ${comment.message}
            </p>
          `,
        )}
        <form @submit=${(e) => this.#formSubmitted(e)}>
          <input type="text" hidden name="talkTitle" value="${talk.title}" />
          <input type="text" required name="comment" />
          <button type="submit">Add comment</button>
        </form>
      </section>
    `;
  }

  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#addComment(event.target);
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #addComment(form) {
    let formData = new FormData(form);
    actions.addComment({
      title: formData.get('talkTitle'),
      comment: formData.get('comment'),
    });
    form.reset();
  }
}

window.customElements.define('s-talks', Talks);
