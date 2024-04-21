import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import actions from './actions.js';

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
          @change=${(e) => this.#handleChange(e)}
      /></label>
    `;
  }

  #handleChange(event) {
    actions.changeUser({ username: event.target.value });
  }
}

window.customElements.define('s-user-field', UserField);
