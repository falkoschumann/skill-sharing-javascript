import { html } from 'lit-html';

import './talk-form.js';
import './talks.js';
import './user-field.js';
import * as actions from './actions.js';
import { Component } from './components.js';

class SkillSharingApp extends Component {
  connectedCallback() {
    super.connectedCallback();
    actions.pollTalks();
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

window.customElements.define('s-skill-sharing-app', SkillSharingApp);
