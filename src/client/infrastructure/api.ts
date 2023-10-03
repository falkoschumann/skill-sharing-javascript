import { Comment } from '../domain/types';
import { TalksResponse } from '../application/services';

type NewTalk = {
  title: string;
  presenter: string;
  summary: string;
};

export class Api {
  #baseUrl: string;

  constructor({ baseUrl = '/api' } = {}) {
    this.#baseUrl = baseUrl;
  }

  async getTalks(tag?: string): Promise<TalksResponse> {
    const response = await fetch(`${this.#baseUrl}/talks`, {
      headers:
        (tag && {
          'If-None-Match': tag,
          Prefer: 'wait=90',
        }) ||
        undefined,
    });
    const talks = await response.json();
    return {
      notModified: response.status === 304,
      tag: response.headers.get('ETag') || '0',
      talks,
    };
  }

  async putTalk(talk: NewTalk) {
    await fetch(this.#talkUrl(talk.title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presenter: talk.presenter,
        summary: talk.summary,
      }),
    });
  }

  async deleteTalk(title: string) {
    await fetch(this.#talkUrl(title), { method: 'DELETE' });
  }

  async postComment(title: string, comment: Comment) {
    await fetch(this.#talkUrl(title) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
  }

  #talkUrl(title: string) {
    return `${this.#baseUrl}/talks/` + encodeURIComponent(title);
  }
}
