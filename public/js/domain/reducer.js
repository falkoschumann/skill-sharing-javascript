export const initialState = {
  talks: [],
  talk: { title: '', summary: '' },
};

export function reducer(state, action) {
  switch (action.type) {
    case 'set-talks':
      return { ...state, talks: action.talks };
    case 'talk-updated':
      return {
        ...state,
        talk: { ...state.talk, [action.name]: action.value },
      };
    default:
      return state;
  }
}
