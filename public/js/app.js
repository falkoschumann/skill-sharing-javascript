import { pollTalks } from './application/actions.js';
import { store, api } from './app.config.js';
import './ui/components.js';

function runApp() {
  pollTalks(store, api);
}

runApp();
