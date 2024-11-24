// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';

import { Component, Container } from '@muspellheim/shared/browser';

import { Service } from '../application/service.js';
import './reset.css';
import './style.css';
import './skill-sharing.css';
import './talk-form.js';
import './talks.js';
import './user-field.js';

class SkillSharingComponent extends Component {
  constructor() {
    super();
    Container.initStore(Service.get().store);
  }

  connectedCallback() {
    super.connectedCallback();
    Service.get().connectTalks();
  }

  getView() {
    return html`
      <h1>Skill Sharing</h1>
      <s-user-field></s-user-field>
      <s-talks></s-talks>
      <s-talk-form></s-talk-form>
    `;
  }
}

window.customElements.define('s-skill-sharing', SkillSharingComponent);
