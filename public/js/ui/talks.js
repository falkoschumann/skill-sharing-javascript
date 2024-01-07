import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

class Talks extends Component {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html` ${this.state.map((t) => this.#renderTalk(t))} `;
  }

  #renderTalk(talk) {
    return html`
      <section class="talk">
        <h2>
          ${talk.title}
          <button @click=${() => this.#handleClickDelete(talk)}>Delete</button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${talk.comments.map((c) => this.#renderComment(c))}
        <form @submit=${(e) => this.#handleSubmit(e)}>
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

  #handleClickDelete(talk) {
    actions.deleteTalk({ title: talk.title });
  }

  #handleSubmit(event) {
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
