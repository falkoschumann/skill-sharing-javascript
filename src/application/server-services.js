export async function submitTalk(talk, repository) {
  await repository.add(talk);
}

export async function getTalks(repository) {
  return await repository.findAll();
}

export async function deleteTalk(title, repository) {
  await repository.remove(title);
}
