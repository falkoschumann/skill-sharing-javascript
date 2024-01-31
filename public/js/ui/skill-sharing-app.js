import { html, render } from '../../vendor/lit-html.js';

import './talk-form.js';
import './talks.js';
import './user-field.js';
import actions from './actions.js';

class SkillSharingApp extends HTMLElement {
  connectedCallback() {
    let view = html`
      <h1>Skill Sharing</h1>
      <s-user-field></s-user-field>
      <s-talks></s-talks>
      <s-talk-form></s-talk-form>
    `;
    render(view, this);
    actions.pollTalks();
  }
}

window.customElements.define('s-skill-sharing-app', SkillSharingApp);
