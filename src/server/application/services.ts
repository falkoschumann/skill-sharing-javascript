import { Comment, Talk } from '../domain/types';

interface Repository {
  findAll: () => Promise<Array<Talk>>;
  findByTitle: (title: string) => Promise<Talk | undefined>;
  add: (talk: Talk) => Promise<void>;
  remove: (title: string) => Promise<void>;
}

export async function getTalks(repository: Repository) {
  return await repository.findAll();
}

type TalkQuery = { title: string };

export async function getTalk(query: TalkQuery, repository: Repository) {
  return await repository.findByTitle(query.title);
}

type SubmitTalkCommand = {
  title: string;
  presenter: string;
  summary: string;
};

export async function submitTalk(
  command: SubmitTalkCommand,
  repository: Repository,
) {
  const talk = {
    title: command.title,
    presenter: command.presenter,
    summary: command.summary,
    comments: [],
  };
  await repository.add(talk);
}

type DeleteTalkCommand = {
  title: string;
};

export async function deleteTalk(
  command: DeleteTalkCommand,
  repository: Repository,
) {
  await repository.remove(command.title);
}

type AddCommentCommand = {
  title: string;
  comment: Comment;
};

export async function addComment(
  command: AddCommentCommand,
  repository: Repository,
) {
  const talk = await repository.findByTitle(command.title);
  if (talk == null) {
    return false;
  }

  talk.comments.push(command.comment);
  await repository.add(talk);
  return true;
}
