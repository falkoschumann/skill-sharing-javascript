import './ui/components.js';
import { api } from './app.config.js';
import { pollTalks } from './application/client-services.js';
import { store } from './store.js';

function runApp() {
  pollTalks(store, api);
}

runApp();
