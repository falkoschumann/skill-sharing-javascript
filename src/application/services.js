import { AbstractRepository } from '../infrastructure/repository.js';

export async function getTalks(repository = new AbstractRepository()) {
  return await repository.findAll();
}

export async function getTalk(
  { title },
  repository = new AbstractRepository(),
) {
  return await repository.findByTitle(title);
}

export async function submitTalk(
  { title, presenter, summary },
  repository = new AbstractRepository(),
) {
  let talk = { title, presenter, summary, comments: [] };
  await repository.add(talk);
}

export async function deleteTalk(
  { title },
  repository = new AbstractRepository(),
) {
  await repository.remove(title);
}

export async function addComment(
  { title, comment: { author, message } },
  repository = new AbstractRepository(),
) {
  let talk = await repository.findByTitle(title);
  return tryAddComment(talk, { author, message }, repository);
}

async function tryAddComment(
  talk,
  comment,
  repository = new AbstractRepository(),
) {
  if (talk == null) {
    return false;
  }

  talk.comments.push(comment);
  await repository.add(talk);
  return true;
}
