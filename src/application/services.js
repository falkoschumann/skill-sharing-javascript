export async function submitTalk(talk, repository) {
  await repository.add(talk);
}

export async function queryTalks(repository) {
  return await repository.findAll();
}
