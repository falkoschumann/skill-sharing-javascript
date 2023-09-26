import { initialState, reducer } from './domain/reducer.js';
import { Api } from './infrastructure/api.js';
import { Store } from './domain/store.js';

export const store = new Store(reducer, initialState);
export const api = new Api();
