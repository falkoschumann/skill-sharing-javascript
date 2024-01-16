import { reducer } from '../domain/reducer.js';
import { createStore } from '../domain/store.js';

export const store = createStore(reducer);
