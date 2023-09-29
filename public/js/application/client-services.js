export async function changeUser({ name }, store, repository) {
  store.dispatch({ type: 'change-user', userName: name });
  await repository.store(name);
}

export async function getUser(store, repository) {
  const userName = (await repository.load()) || 'Anon';
  store.dispatch({ type: 'change-user', userName });
}

export async function submitTalk({ title, summary }, store, api) {
  const talk = { title, presenter: store.getState().user, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, api) {
  await api.deleteTalk(title);
}

export async function pollTalks(store, api, runs = -1) {
  let tag;
  for (let i = 0; runs === -1 || i < runs; runs === -1 ? 0 : i++) {
    let response;
    try {
      response = await api.getTalks(tag);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    if (response.notModified) {
      continue;
    }

    tag = response.tag;
    store.dispatch({ type: 'talks-updated', talks: response.talks });
  }
}

export async function addComment({ talkTitle, comment }, store, api) {
  await api.postComment(talkTitle, {
    author: store.getState().user,
    message: comment,
  });
}
