import './ui/components.js';
import { api, store } from './app.config.js';
import { pollTalks } from './application/actions.js';

function runApp() {
  pollTalks(store, api);
}

runApp();
