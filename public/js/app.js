import './ui/components.js';
import { api, store } from './app.config.js';
import { pollTalks } from './application/client-services.js';

function runApp() {
  pollTalks(store, api);
}

runApp();
