import { html } from 'lit-html';

import { Container } from '@muspellheim/shared';

import { Services } from '../application/services.js';

class TalksComponent extends Container {
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
          <button
            @click=${() => Services.get().deleteTalk({ title: talk.title })}
          >
            Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${this.#commentsTemplate(talk.comments)}
        <form @submit=${(e) => this.#formSubmitted(e)} class="form">
          <ul>
            <li>
              <input
                type="text"
                hidden
                name="talkTitle"
                value="${talk.title}"
              />
              <input type="text" required name="comment" />
            </li>
            <li>
              <button type="submit">Add comment</button>
            </li>
          </ul>
        </form>
      </section>
    `;
  }

  #commentsTemplate(comments) {
    return html`
      <ul class="comments">
        ${comments.map(
          (comment) => html`
            <li class="comment">
              <strong>${comment.author}</strong>: ${comment.message}
            </li>
          `,
        )}
      </ul>
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
    const formData = new FormData(form);
    Services.get().addComment({
      title: formData.get('talkTitle'),
      comment: formData.get('comment'),
    });
    form.reset();
  }
}

window.customElements.define('s-talks', TalksComponent);
