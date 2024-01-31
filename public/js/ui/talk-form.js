import { html, render } from '../../vendor/lit-html.js';

import actions from './actions.js';

class TalkForm extends HTMLElement {
  connectedCallback() {
    let template = html`
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

window.customElements.define('s-talk-form', TalkForm);
