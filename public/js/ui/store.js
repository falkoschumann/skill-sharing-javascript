import { initialState, reducer } from '../domain/reducer.js';
import { Store } from '../domain/store.js';

export const store = new Store(reducer, initialState);
