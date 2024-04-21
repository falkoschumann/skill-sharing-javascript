import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

export async function changeUser(
  { username },
  store,
  repository = Repository.create(),
) {
  store.dispatch({ type: 'change-user', username });
  await repository.store({ username });
}

export async function getUser(store, repository = Repository.create()) {
  const { username = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', username });
}

export async function pollTalks(store, api = Api.create(), runs) {
  api.addEventListener('talks-updated', (event) =>
    talksUpdated({ talks: event.talks }, store),
  );
  await api.pollTalks(runs);
}

export async function talksUpdated({ talks }, store) {
  store.dispatch({ type: 'talks-updated', talks });
}

export async function submitTalk(
  { title, summary },
  store,
  api = Api.create(),
) {
  const presenter = store.getState().user;
  const talk = { title, presenter, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, api = Api.create()) {
  await api.deleteTalk(title);
}

export async function addComment(
  { title, comment },
  store,
  api = Api.create(),
) {
  await api.postComment(title, {
    author: store.getState().user,
    message: comment,
  });
}
