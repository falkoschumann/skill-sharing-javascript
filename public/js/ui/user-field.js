import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

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
          @change=${(e) => this.#onChange(e)}
      /></label>
    `;
  }

  #onChange(event) {
    actions.changeUser({ userName: event.target.value });
  }
}

window.customElements.define('s-user-field', UserField);
