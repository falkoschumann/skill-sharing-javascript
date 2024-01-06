export async function changeUser({ userName }, store, repository) {
  store.dispatch({ type: 'change-user', userName });
  await repository.store({ userName });
}

export async function getUser(store, repository) {
  let { userName = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', userName });
}

export async function submitTalk({ title, summary }, store, api) {
  let talk = { title, presenter: store.getState().user, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, api) {
  await api.deleteTalk(title);
}

export async function pollTalks(store, api, runs = -1) {
  // TODO move polling to API
  let tag;
  let timeout = 0.5;
  for (let i = 0; runs === -1 || i < runs; runs === -1 ? 0 : i++) {
    let response = await tryGetTalks(tag, api);
    if (response.error) {
      timeout *= 2;
      if (timeout > 30) {
        timeout = 30;
      }
      await new Promise((resolve) => setTimeout(resolve, timeout * 1000));
    } else {
      timeout = 0.5;
    }
    tag = handleGetTalksResponse(response, tag, store);
  }
}

async function tryGetTalks(tag, api) {
  try {
    return await api.getTalks(tag);
  } catch {
    return { isNotModified: true, error: true };
  }
}

function handleGetTalksResponse({ isNotModified, tag, talks }, oldTag, store) {
  if (isNotModified) {
    return oldTag;
  }

  store.dispatch({ type: 'talks-updated', talks });
  return tag;
}

export async function addComment({ title, comment }, store, api) {
  await api.postComment(title, {
    author: store.getState().user,
    message: comment,
  });
}
