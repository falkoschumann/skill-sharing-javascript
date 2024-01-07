export async function changeUser({ userName }, store, repository) {
  store.dispatch({ type: 'change-user', userName });
  await repository.store({ userName });
}

export async function getUser(store, repository) {
  let { userName = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', userName });
}

export async function pollTalks(store, api, runs) {
  api.addEventListener('talks-updated', (event) =>
    talksUpdated(event.detail.talks, store),
  );
  await api.pollTalks(runs);
}

export async function talksUpdated(talks, store) {
  store.dispatch({ type: 'talks-updated', talks });
}

export async function submitTalk({ title, summary }, store, api) {
  let talk = { title, presenter: store.getState().user, summary };
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
