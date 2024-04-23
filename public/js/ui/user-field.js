import { html } from 'lit-html';

import { Container } from './components.js';

class UserField extends Container {
  connectedCallback() {
    super.connectedCallback();
    this.services.loadUser();
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
          @change=${(e) =>
            this.services.changeUser({ username: e.target.value })}
      /></label>
    `;
  }
}

window.customElements.define('s-user-field', UserField);
