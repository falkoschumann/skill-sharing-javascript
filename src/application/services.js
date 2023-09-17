import { loadTalks } from "../infrastructure/repository.js";

export function queryTalks(repository = { loadTalks }) {
  return repository.loadTalks();
}
