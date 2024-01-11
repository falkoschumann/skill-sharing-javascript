/**
 * @typedef {Object} Talk
 * @property {string} title
 * @property {string} presenter
 * @property {string} summary
 * @property {Comment[]} comments
 */

/**
 * @typedef {Object} Comment
 * @property {string} author
 * @property {string} message
 */

/**
 * @typedef {Object} Action
 * @property {string} type
 */

export const initialState = {
  /** @type Talk[] */ talks: [],
  user: 'Anon',
};

export function reducer(state = initialState, /** @type Action */ action) {
  switch (action.type) {
    case 'change-user':
      return { ...state, user: action.userName };
    case 'talks-updated':
      return { ...state, talks: action.talks };
    default:
      return state;
  }
}
