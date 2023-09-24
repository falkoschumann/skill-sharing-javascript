import { Store } from './domain/store.js';
import { Api } from './infrastructure/api.js';

export const store = new Store();
export const api = new Api();
