export async function getTalks(repository) {
  return await repository.findAll();
}

export async function getTalk({ title }, repository) {
  return await repository.findByTitle(title);
}

export async function submitTalk({ title, presenter, summary }, repository) {
  const talk = { title, presenter, summary, comments: [] };
  await repository.add(talk);
}

export async function deleteTalk({ title }, repository) {
  await repository.remove(title);
}

export async function addComment(
  { title, comment: { author, message } },
  repository,
) {
  const talk = await repository.findByTitle(title);
  if (talk == null) {
    return { isSuccessful: false };
  }

  talk.comments.push({ author, message });
  await repository.add(talk);
  return { isSuccessful: true };
}
