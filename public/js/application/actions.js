export async function pollTalks(store, api, runs = -1) {
  let tag;
  for (let i = 0; runs == -1 || i < runs; runs == -1 ? 0 : i++) {
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
    store.dispatch({ type: 'set-talks', talks: response.talks });
  }
}

export async function talkUpdated(name, value, store) {
  store.dispatch({ type: 'talk-updated', name, value });
}

export async function newTalk(store, api) {
  await api.putTalk(store.getState().talk);
}
