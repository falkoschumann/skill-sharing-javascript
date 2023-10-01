import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

export const appName = 'Skill Sharing';
export const appVersion = '0.1.0';

// TODO externalize adapter configuration
export const repository = new Repository();
export const api = new Api();
