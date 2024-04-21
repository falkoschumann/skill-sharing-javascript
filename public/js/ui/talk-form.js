import { html } from '../../vendor/lit-html.js';

import * as actions from './actions.js';
import { Component } from './components.js';

class TalkForm extends Component {
  getView() {
    return html`
      <form @submit=${(e) => this.#formSubmitted(e)}>
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
  }

  #formSubmitted(event) {
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
    const formData = new FormData(form);
    actions.submitTalk({
      title: formData.get('title'),
      summary: formData.get('summary'),
    });
    form.reset();
  }
}

window.customElements.define('s-talk-form', TalkForm);
