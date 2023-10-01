export async function getTalks(repository) {
  return await repository.findAll();
}

export async function getTalk({ title }, repository) {
  return await repository.findByTitle(title);
}

export async function submitTalk(talk, repository) {
  talk = { ...talk, comments: [] };
  await repository.add(talk);
}

export async function deleteTalk({ title }, repository) {
  await repository.remove(title);
}

export async function addComment({ title, comment }, repository) {
  const talk = await repository.findByTitle(title);
  if (talk == null) {
    return false;
  }

  talk.comments.push(comment);
  await repository.add(talk);
  return true;
}
