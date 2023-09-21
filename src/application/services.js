import {loadTalks} from '../infrastructure/repository.js';

/**
 * @param {any} repository
 * @return {Array<any>}
 */
export function queryTalks(repository = {loadTalks}) {
  return repository.loadTalks();
}
