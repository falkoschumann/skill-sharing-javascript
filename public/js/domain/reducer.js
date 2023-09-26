export const initialState = {
  talks: [],
  talk: { title: '', summary: '' },
};

export function reducer(state, action) {
  switch (action.type) {
    case 'talks-updated':
      return { ...state, talks: action.talks };
    case 'new-talk-updated':
      return {
        ...state,
        talk: { ...state.talk, [action.name]: action.value },
      };
    default:
      return state;
  }
}
