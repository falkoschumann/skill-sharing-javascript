import { Talk } from './types';

export type State = {
  talks: Array<Talk>;
  user: string;
};

export const initialState: State = {
  talks: [],
  user: 'Anon',
};

export type Action = ChangeUserAction | TalksUpdatedAction;
export type ChangeUserAction = { type: 'change-user'; userName: string };
export type TalksUpdatedAction = { type: 'talks-updated'; talks: Array<Talk> };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'change-user':
      return { ...state, user: action.userName };
    case 'talks-updated':
      return { ...state, talks: action.talks };
    default:
      return state;
  }
}
