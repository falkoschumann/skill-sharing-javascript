import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';
import { Api } from '../infrastructure/api.js';

const repository = globalThis.skillSharing?.repository ?? new Repository();
const api = globalThis.skillSharing?.api ?? new Api();

export async function changeUserAction({ userName }, store) {
  return changeUser({ userName }, store, repository);
}

export async function getUserAction(store) {
  return getUser(store, repository);
}

export async function submitTalkAction({ title, summary }, store) {
  return submitTalk({ title, summary }, store, api);
}

export async function deleteTalkAction({ title }) {
  return deleteTalk({ title }, api);
}

export async function pollTalksAction(store) {
  return pollTalks(store, api);
}

export async function addCommentAction({ title, comment }, store) {
  return addComment({ title, comment }, store, api);
}
