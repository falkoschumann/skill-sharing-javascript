/**
 * @typedef {object} Talk
 * @property {string} title
 * @property {string} presenter
 * @property {string} summary
 * @property {Array<Comment>} comments
 */

/**
 * @typedef {object} Comment
 * @property {string} author
 * @property {string} message
 */

/**
 * @typedef {object} NewTalk
 * @property {string} title
 * @property {string} summary
 */

/**
 * @typedef {object} Store
 * @property {(action:any) => void} dispatch
 * @property {() => any} getState
 * @property {() => () => void} subscribe returns a function to unsubscribe
 */

/**
 * @typedef {object} Repository
 * @property {() => Promise<string>} load returns stored user name
 * @property {(userName: string) => Promise<void>} store
 */

/**
 * @typedef {object} Api
 * @property {(tag: string) => Promise<{notModified: boolean, tag: string, talks: Talk[]}>} getTalks
 * @property {(talk: NewTalk) => Promise<void>} putTalk
 * @property {(title: string) => Promise<void>} deleteTalk
 * @property {(talkTitle: string, comment: Comment) => Promise<void>} postComment
 */

/**
 * @param {object} command
 * @param {Store} store
 * @param {Repository} repository
 */
export async function changeUser({ name }, store, repository) {
  store.dispatch({ type: 'change-user', userName: name });
  await repository.store(name);
}

/**
 * @param {Store} store
 * @param {Repository} repository
 */
export async function getUser(store, repository) {
  const userName = (await repository.load()) || 'Anon';
  store.dispatch({ type: 'change-user', userName });
}

/**
 * @param {object} command
 * @param {Store} store
 * @param {Api} api
 */
export async function submitTalk({ title, summary }, store, api) {
  const talk = { title, presenter: store.getState().user, summary };
  await api.putTalk(talk);
}

/**
 * @param {object} command
 * @param {Api} api
 */
export async function deleteTalk({ title }, api) {
  await api.deleteTalk(title);
}

/**
 * @param {Store} store
 * @param {Api} api
 */
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

/**
 * @param {object} command
 * @param {Store} store
 * @param {Api} api
 */
export async function addComment({ talkTitle, comment }, store, api) {
  await api.postComment(talkTitle, {
    author: store.getState().user,
    message: comment,
  });
}
