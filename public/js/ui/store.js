import { reducer } from '../domain/reducer.js';
import { createStore } from '../util/store.js';

export const store = createStore(reducer);
