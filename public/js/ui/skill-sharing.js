import { html } from 'lit-html';

import { Component, Container } from '@muspellheim/shared';

import { Services } from '../application/services.js';
import './talk-form.js';
import './talks.js';
import './user-field.js';

class SkillSharingComponent extends Component {
  constructor() {
    super();
    Container.initStore(Services.get().store);
  }

  connectedCallback() {
    super.connectedCallback();
    Services.get().connectTalks();
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
