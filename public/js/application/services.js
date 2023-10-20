import { AbstractStore } from '../domain/store.js';
import { AbstractApi } from '../infrastructure/api.js';
import { AbstractRepository } from '../infrastructure/repository.js';

export async function changeUser(
  { userName },
  store = new AbstractStore(),
  repository = new AbstractRepository(),
) {
  store.dispatch({ type: 'change-user', userName });
  await repository.store({ userName });
}

export async function getUser(
  store = new AbstractStore(),
  repository = new AbstractRepository(),
) {
  let { userName = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', userName });
}

export async function submitTalk(
  { title, summary },
  store = new AbstractStore(),
  api = new AbstractApi(),
) {
  let talk = { title, presenter: store.getState().user, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, api = new AbstractApi()) {
  await api.deleteTalk(title);
}

export async function pollTalks(
  store = new AbstractStore(),
  api = new AbstractApi(),
  runs = -1,
) {
  let tag;
  for (let i = 0; runs === -1 || i < runs; runs === -1 ? 0 : i++) {
    let response = await tryGetTalks(tag, api);
    tag = handleGetTalksResponse(response, tag, store);
  }
}

async function tryGetTalks(tag, api = new AbstractApi()) {
  try {
    return await api.getTalks(tag);
  } catch (e) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { isNotModified: true };
  }
}

function handleGetTalksResponse({ isNotModified, tag, talks }, oldTag, store) {
  if (isNotModified) {
    return oldTag;
  }

  store.dispatch({ type: 'talks-updated', talks });
  return tag;
}

export async function addComment(
  { title, comment },
  store = new AbstractStore(),
  api = new AbstractApi(),
) {
  await api.postComment(title, {
    author: store.getState().user,
    message: comment,
  });
}
