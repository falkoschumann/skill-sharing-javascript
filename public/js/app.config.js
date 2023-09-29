import { Api } from './infrastructure/api.js';
import { Repository } from './infrastructure/repository.js';

export const repository = new Repository();
export const api = new Api();
