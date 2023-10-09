import {
  addComment,
  changeUser,
  deleteTalk,
  getUser,
  pollTalks,
  submitTalk,
} from '../application/services.js';
import { AbstractStore } from '../domain/store.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

const repository = globalThis.skillSharing?.repository ?? new Repository();
const api = globalThis.skillSharing?.api ?? new Api();

export async function changeUserAction(
  { userName },
  store = new AbstractStore(),
) {
  return changeUser({ userName }, store, repository);
}

export async function getUserAction(store = new AbstractStore()) {
  return getUser(store, repository);
}

export async function submitTalkAction(
  { title, summary },
  store = new AbstractStore(),
) {
  return submitTalk({ title, summary }, store, api);
}

export async function deleteTalkAction({ title }) {
  return deleteTalk({ title }, api);
}

export async function pollTalksAction(store = new AbstractStore()) {
  return pollTalks(store, api);
}

export async function addCommentAction(
  { title, comment },
  store = new AbstractStore(),
) {
  return addComment({ title, comment }, store, api);
}
