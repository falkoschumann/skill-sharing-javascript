export const initialState = {
  talks: [],
  user: 'Anon',
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'change-user':
      return { ...state, user: action.userName };
    case 'talks-updated':
      return { ...state, talks: action.talks };
    default:
      return state;
  }
}
