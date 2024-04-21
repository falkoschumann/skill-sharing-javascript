export async function changeUser({ username }, store, repository) {
  store.dispatch({ type: 'change-user', username });
  await repository.store({ username });
}

export async function getUser(store, repository) {
  const { username = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', username });
}

export async function pollTalks(store, api, runs) {
  api.addEventListener('talks-updated', (event) =>
    talksUpdated({ talks: event.talks }, store),
  );
  await api.pollTalks(runs);
}

export async function talksUpdated({ talks }, store) {
  store.dispatch({ type: 'talks-updated', talks });
}

export async function submitTalk({ title, summary }, store, api) {
  const presenter = store.getState().user;
  const talk = { title, presenter, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, api) {
  await api.deleteTalk(title);
}

export async function addComment({ title, comment }, store, api) {
  await api.postComment(title, {
    author: store.getState().user,
    message: comment,
  });
}
