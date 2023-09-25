import { Api } from './infrastructure/api.js';
import { Store } from './domain/store.js';

export const store = new Store();
export const api = new Api();
