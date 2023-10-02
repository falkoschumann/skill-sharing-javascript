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
 * @typedef {object} Repository
 * @property {() => Promise<Array<Talk>>} findAll
 * @property {(title: string) => Promise<Talk>} findByTitle
 * @property {(talk: any) => Promise<void>} add
 * @property {(title: string) => Promise<void>} remove
 */

/**
 * @param {Repository} repository
 */
export async function getTalks(repository) {
  return await repository.findAll();
}

/**
 * @param {object} query
 * @param {Repository} repository
 */
export async function getTalk({ title }, repository) {
  return await repository.findByTitle(title);
}

/**
 * @param {object} command
 * @param {Repository} repository
 */
export async function submitTalk({ title, presenter, summary }, repository) {
  const talk = { title, presenter, summary, comments: [] };
  await repository.add(talk);
}

/**
 * @param {object} command
 * @param {Repository} repository
 */
export async function deleteTalk({ title }, repository) {
  await repository.remove(title);
}

/**
 * @param {object} command
 * @param {Repository} repository
 */
export async function addComment({ title, comment }, repository) {
  const talk = await repository.findByTitle(title);
  if (talk == null) {
    return false;
  }

  talk.comments.push(comment);
  await repository.add(talk);
  return true;
}
