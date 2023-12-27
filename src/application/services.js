export async function getTalks(repository) {
  return await repository.findAll();
}

export async function getTalk({ title }, repository) {
  return await repository.findByTitle(title);
}

export async function submitTalk({ title, presenter, summary }, repository) {
  let talk = { title, presenter, summary, comments: [] };
  await repository.add(talk);
}

export async function deleteTalk({ title }, repository) {
  await repository.remove(title);
}

export async function addComment(
  { title, comment: { author, message } },
  repository,
) {
  let talk = await repository.findByTitle(title);
  return tryAddComment(talk, { author, message }, repository);
}

async function tryAddComment(talk, comment, repository) {
  if (talk == null) {
    return false;
  }

  talk.comments.push(comment);
  await repository.add(talk);
  return true;
}
