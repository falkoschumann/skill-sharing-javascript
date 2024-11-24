// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';

import { Container } from '@muspellheim/shared/browser';

import { Service } from '../application/service.js';

class UserFieldComponent extends Container {
  constructor() {
    super();
    this.state = '';
  }

  connectedCallback() {
    super.connectedCallback();
    Service.get().loadUser();
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
              Service.get().changeUser({ username: e.target.value })}
          />
        </li>
      </ul>
    `;
  }
}

window.customElements.define('s-user-field', UserFieldComponent);
