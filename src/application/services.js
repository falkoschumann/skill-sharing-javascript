export async function submitTalk(talk, repository) {
  repository.add(talk);
}

export async function queryTalks(repository) {
  return await repository.findAll();
}
