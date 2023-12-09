import { html, render } from '../../vendor/lit-html.js';

import './talk-form.js';
import './talks.js';
import './user-field.js';
import * as actions from './actions.js';

class SkillSharingApp extends HTMLElement {
  connectedCallback() {
    let view = html`
      <h1>Skill Sharing</h1>
      <s-userfield></s-userfield>
      <s-talks></s-talks>
      <s-talkform></s-talkform>
    `;
    render(view, this);
    actions.pollTalks();
  }
}

window.customElements.define('s-skillsharingapp', SkillSharingApp);
