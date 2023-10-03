import { Action, State } from '../domain/reducer';
import { Comment, Talk } from '../domain/types';

interface Store {
  dispatch: (action: Action) => void;
  getState: () => State;
  subscribe: (listener: () => void) => () => void;
}

interface Repository {
  load: () => Promise<string | null>;
  store: (userName: string) => Promise<void>;
}

export type NewTalk = {
  title: string;
  presenter: string;
  summary: string;
};

export type TalksResponse = {
  notModified: boolean;
  tag: string;
  talks: Talk[];
};

interface Api {
  getTalks: (tag?: string) => Promise<TalksResponse>;
  putTalk: (talk: NewTalk) => Promise<void>;
  deleteTalk: (title: string) => Promise<void>;
  postComment: (title: string, comment: Comment) => Promise<void>;
}

type ChangeUserCommand = {
  name: string;
};

export async function changeUser(
  command: ChangeUserCommand,
  store: Store,
  repository: Repository,
) {
  store.dispatch({ type: 'change-user', userName: command.name });
  await repository.store(command.name);
}

export async function getUser(store: Store, repository: Repository) {
  const userName = (await repository.load()) || 'Anon';
  store.dispatch({ type: 'change-user', userName });
}

type SubmitTalkCommand = {
  title: string;
  summary: string;
};

export async function submitTalk(
  command: SubmitTalkCommand,
  store: Store,
  api: Api,
) {
  const talk = {
    title: command.title,
    presenter: store.getState().user,
    summary: command.summary,
  };
  await api.putTalk(talk);
}

type DeleteTalkCommand = {
  title: string;
};

export async function deleteTalk(command: DeleteTalkCommand, api: Api) {
  await api.deleteTalk(command.title);
}

export async function pollTalks(store: Store, api: Api, runs = -1) {
  let tag: string = '0';
  for (let i = 0; runs === -1 || i < runs; runs === -1 ? 0 : i++) {
    let response;
    try {
      response = await api.getTalks(tag);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    if (response.notModified) {
      continue;
    }

    tag = response.tag;
    store.dispatch({ type: 'talks-updated', talks: response.talks });
  }
}

type AddCommentCommand = {
  title: string;
  comment: string;
};

export async function addComment(
  command: AddCommentCommand,
  store: Store,
  api: Api,
) {
  await api.postComment(command.title, {
    author: store.getState().user,
    message: command.comment,
  });
}
