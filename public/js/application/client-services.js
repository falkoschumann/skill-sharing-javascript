export async function submitTalk(store, api) {
  await api.putTalk(store.getState().talk);
}

export async function deleteTalk(title, api) {
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

export async function newTalkUpdated(name, value, store) {
  store.dispatch({ type: 'new-talk-updated', name, value });
}
