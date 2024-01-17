/**
 * @typedef {import('../domain/reducer.js').Talk} Talk
 * @typedef {import('../domain/store.js').Store} Store
 * @typedef {import('../infrastructure/repository.js').Repository} Repository
 * @typedef {import('../infrastructure/api.js').Api} Api
 */

export async function changeUser(
  { userName },
  /** @type Store */ store,
  /** @type Repository */ repository,
) {
  store.dispatch({ type: 'change-user', userName });
  await repository.store({ userName });
}

export async function getUser(
  /** @type Store */ store,
  /** @type Repository */ repository,
) {
  let { userName = 'Anon' } = await repository.load();
  store.dispatch({ type: 'change-user', userName });
}

export async function pollTalks(
  /** @type Store */ store,
  /** @type Api */ api,
  /** @type number? */ runs,
) {
  api.addEventListener('talks-updated', (event) =>
    talksUpdated(event.talks, store),
  );
  await api.pollTalks(runs);
}

export async function talksUpdated(
  /** @type Talk[] */ talks,
  /** @type Store */ store,
) {
  store.dispatch({ type: 'talks-updated', talks });
}

export async function submitTalk(
  { title, summary },
  /** @type Store */ store,
  /** @type Api */ api,
) {
  let presenter = store.getState().user;
  let talk = { title, presenter, summary };
  await api.putTalk(talk);
}

export async function deleteTalk({ title }, /** @type Api */ api) {
  await api.deleteTalk(title);
}

export async function addComment(
  { title, comment },
  /** @type Store */ store,
  /** @type Api */ api,
) {
  await api.postComment(title, {
    author: store.getState().user,
    message: comment,
  });
}
