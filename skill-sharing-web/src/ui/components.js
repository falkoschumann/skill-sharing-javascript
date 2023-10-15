import { html, render } from 'lit-html';

import './components.css';
import {
  addCommentAction,
  changeUserAction,
  Component,
  deleteTalkAction,
  getUserAction,
  pollTalksAction,
  submitTalkAction,
} from './actions.js';

class SkillSharingApp extends Component {
  connectedCallback() {
    super.connectedCallback();
    pollTalksAction();
  }

  getView() {
    return html`
      <div class="container p-12 mx-auto">
        <h1 class="text-5xl font-extrabold">Skill Sharing</h1>
        <div>
          <s-userfield class="block my-6"></s-userfield>
          <s-talks class="block my-6"></s-talks>
          <s-talkform class="block my-6"></s-talkform>
        </div>
      </div>
    `;
  }
}

window.customElements.define('s-skillsharingapp', SkillSharingApp);

class UserField extends Component {
  connectedCallback() {
    super.connectedCallback();
    getUserAction();
  }

  extractState(state) {
    return state.user;
  }

  getView() {
    return html`
      <label class="block mb-2 text-sm font-medium text-gray-900"
        >Your name:
        <input
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value="${this.state}"
          @change="${(e) => this.#onChange(e)}"
      /></label>
    `;
  }

  #onChange(event) {
    changeUserAction({ userName: event.target.value });
  }
}

window.customElements.define('s-userfield', UserField);

class Talks extends Component {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`
      <div class="talks">${this.state.map((t) => this.#renderTalk(t))}</div>
    `;
  }

  #renderTalk(talk) {
    return html`
      <section class="talk my-10">
        <h2 class="text-4xl font-bold">
          ${talk.title}
          <button
            class="align-middle text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
            @click="${() => this.#onClickDelete(talk)}"
          >
            Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p class="my-3">${talk.summary}</p>
        ${talk.comments.map((c) => this.#renderComment(c))}
        <form class="my-6" @submit="${(e) => this.#onSubmit(e)}">
          <input type="text" hidden name="talkTitle" value="${talk.title}" />
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
            name="comment"
          />
          <button
            type="submit"
            class="my-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
          >
            Add comment
          </button>
        </form>
      </section>
    `;
  }

  #renderComment(comment) {
    return html`
      <p class="comment italic">
        <strong class="not-italic">${comment.author}</strong>:
        ${comment.message}
      </p>
    `;
  }

  #onClickDelete(talk) {
    deleteTalkAction({ title: talk.title });
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
    addCommentAction(command);
    form.reset();
  }
}

window.customElements.define('s-talks', Talks);

class TalkForm extends HTMLElement {
  connectedCallback() {
    let template = html`
      <form @submit="${(e) => this.#onSubmit(e)}">
        <h3 class="text-3xl font-bold">Submit a Talk</h3>
        <label class="block mb-2 text-sm font-medium text-gray-900"
          >Title:
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
            name="title"
          />
        </label>
        <label class="block mb-2 text-sm font-medium text-gray-900"
          >Summary:
          <input
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
            name="summary"
          />
        </label>
        <button
          type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
        >
          Submit
        </button>
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
    submitTalkAction(command);
    form.reset();
  }
}

window.customElements.define('s-talkform', TalkForm);
