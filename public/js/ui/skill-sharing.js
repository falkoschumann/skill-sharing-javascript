import { html } from 'lit-html';

import './talk-form.js';
import './talks.js';
import './user-field.js';
import { Component } from './components.js';

class SkillSharingComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.services.connectTalks();
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
