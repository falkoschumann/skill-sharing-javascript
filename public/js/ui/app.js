import './components.js';
import { api, store } from './app.config.js';
import { pollTalks } from '../application/services.js';

export class SkillSharingApp {
  run() {
    pollTalks(store, api);
  }
}
