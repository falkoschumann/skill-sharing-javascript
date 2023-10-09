import { Store } from '../domain/store.js';
import { initialState, reducer } from '../domain/reducer.js';

export const store = new Store(reducer, initialState);
