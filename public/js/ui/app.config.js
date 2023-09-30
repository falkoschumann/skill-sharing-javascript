import { initialState, reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';
import { Store } from '../domain/store.js';

export const appName = 'Skill Sharing';
export const appVersion = '0.1.0';

export const store = new Store(reducer, initialState);
export const repository = new Repository();
export const api = new Api();
