import {getTalks} from './api.js';
import {store} from './store.js';
import {html, render} from './vendor/lit-html.js';

/** Views a list of talks. */
class Talks extends HTMLElement {
  #talks;
  #stateChangedListener;

  /** Initialize element. */
  constructor() {
    super();
    this.#talks = [];
    this.#stateChangedListener = () => this.#updateView();
  }

  /** Listen to store and update view. */
  connectedCallback() {
    store.addEventListener('stateChanged', this.#stateChangedListener);
    this.#updateView();
  }

  /** Remove store listener. */
  disconnectedCallback() {
    store.removeEventListener('stateChanged', this.#stateChangedListener);
  }

  /** Sync view from store state. */
  #updateView() {
    const talks = store.state.talks;
    if (this.#talks === talks) {
      return;
    }

    this.#talks = talks;

    const template = html`
      <div class="talks">
        ${talks.map((talk) => html`
          <section class="talk">
            <h2>${talk.title}</h2>
            <p>${talk.summary}</p>
          </section>
        `)}
      </div>
    `;
    render(template, this);
  }
}

window.customElements.define('s-talks', Talks);

/** Runs the app. */
async function runApp() {
  const talks = await getTalks();
  store.dispatch({type: 'setTalks', talks});
}

runApp();
