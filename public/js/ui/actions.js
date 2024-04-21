import * as services from '../application/services.js';
import { store } from './store.js';

export async function changeUser({ username }) {
  return services.changeUser({ username }, store);
}

export async function getUser() {
  return services.getUser(store);
}

export async function pollTalks() {
  return services.pollTalks(store);
}

export async function submitTalk({ title, summary }) {
  return services.submitTalk({ title, summary }, store);
}

export async function deleteTalk({ title }) {
  return services.deleteTalk({ title });
}

export async function addComment({ title, comment }) {
  return services.addComment({ title, comment }, store);
}
