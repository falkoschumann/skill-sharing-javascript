import { html, render } from '../../vendor/lit-html.js';

import * as actions from './actions.js';
import { Component } from './actions.js';

class SkillSharingApp extends Component {
  connectedCallback() {
    super.connectedCallback();
    actions.pollTalks();
  }

  getView() {
    return html`
      <h1>Skill Sharing</h1>
      <s-userfield></s-userfield>
      <s-talks></s-talks>
      <s-talkform></s-talkform>
    `;
  }
}

window.customElements.define('s-skillsharingapp', SkillSharingApp);

class UserField extends Component {
  connectedCallback() {
    super.connectedCallback();
    actions.getUser();
  }

  extractState(state) {
    return state.user;
  }

  getView() {
    return html`
      <label
        >Your name:
        <input
          type="text"
          value="${this.state}"
          @change="${(e) => this.#onChange(e)}"
      /></label>
    `;
  }

  #onChange(event) {
    actions.changeUser({ userName: event.target.value });
  }
}

window.customElements.define('s-userfield', UserField);

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
          <button @click="${() => this.#onClickDelete(talk)}">Delete</button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${talk.comments.map((c) => this.#renderComment(c))}
        <form @submit="${(e) => this.#onSubmit(e)}">
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
    actions.deleteTalk({ title: talk.title });
  }

  #onSubmit(event) {
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
    let command = {
      title: formData.get('talkTitle'),
      comment: formData.get('comment'),
    };
    actions.addComment(command);
    form.reset();
  }
}

window.customElements.define('s-talks', Talks);

class TalkForm extends HTMLElement {
  connectedCallback() {
    let template = html`
      <form @submit="${(e) => this.#onSubmit(e)}">
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

  #onSubmit(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#submitTalk(event.target);
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #submitTalk(form) {
    let formData = new FormData(form);
    let command = {
      title: formData.get('title'),
      summary: formData.get('summary'),
    };
    actions.submitTalk(command);
    form.reset();
  }
}

window.customElements.define('s-talkform', TalkForm);
