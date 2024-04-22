import { html } from 'lit-html';

import * as actions from './actions.js';
import { Container } from './components.js';

class UserField extends Container {
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
          @change=${(e) => actions.changeUser({ username: e.target.value })}
      /></label>
    `;
  }
}

window.customElements.define('s-user-field', UserField);
