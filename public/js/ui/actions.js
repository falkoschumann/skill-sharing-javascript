import services from '../application/services.js';
import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';
import { createStore } from '../util/store.js';

export const store = createStore(reducer);

const repository = Repository.create();
const api = Api.create();

export async function changeUser({ userName }) {
  return services.changeUser({ userName }, store, repository);
}

export async function getUser() {
  return services.getUser(store, repository);
}

export async function pollTalks() {
  return services.pollTalks(store, api);
}

export async function submitTalk({ title, summary }) {
  return services.submitTalk({ title, summary }, store, api);
}

export async function deleteTalk({ title }) {
  return services.deleteTalk({ title }, api);
}

export async function addComment({ title, comment }) {
  return services.addComment({ title, comment }, store, api);
}

export default {
  changeUser,
  getUser,
  pollTalks,
  submitTalk,
  deleteTalk,
  addComment,
};
