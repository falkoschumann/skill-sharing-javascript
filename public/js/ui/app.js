import './components.js';
import { api } from './app.config.js';
import { pollTalks } from '../application/services.js';
import { store } from './store.js';

// TODO make app a HTML element
export class SkillSharingApp {
  run() {
    pollTalks(store, api);
  }
}
