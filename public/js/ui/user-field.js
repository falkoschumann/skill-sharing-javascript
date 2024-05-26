import { html } from 'lit-html';

import { Container } from './components.js';

class UserFieldComponent extends Container {
  connectedCallback() {
    super.connectedCallback();
    this.services.loadUser();
  }

  extractState(state) {
    return state.user;
  }

  getView() {
    return html`
      <ul class="form">
        <li>
          <label for="username">Your name:</label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            .value="${this.state}"
            @change=${(e) =>
              this.services.changeUser({ username: e.target.value })}
          />
        </li>
      </ul>
    `;
  }
}

window.customElements.define('s-user-field', UserFieldComponent);
