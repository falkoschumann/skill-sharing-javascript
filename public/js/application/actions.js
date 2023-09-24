export async function pollTalks(store, api) {
  // TODO use server-sent event
  const talks = await api.getTalks();
  store.dispatch({ type: 'set-talks', talks });
}

export async function talkUpdated(name, value, store) {
  store.dispatch({ type: 'talk-updated', name, value });
}

export async function newTalk(store, api) {
  await api.putTalk(store.getState().talk);
}
