export class Api {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
    this.#baseUrl = baseUrl;
  }

  async getTalks(tag) {
    let response = await fetch(`${this.#baseUrl}/talks`, {
      headers: tag && {
        'If-None-Match': tag,
        Prefer: 'wait=90',
      },
    });
    let isNotModified = response.status === 304;
    tag = response.headers.get('ETag');
    let talks = !isNotModified ? await response.json() : [];
    return {
      isNotModified,
      tag: response.headers.get('ETag'),
      talks,
    };
  }

  async putTalk({ title, presenter, summary }) {
    let body = JSON.stringify({ presenter, summary });
    await fetch(this.#talkUrl(title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  async deleteTalk(title) {
    await fetch(this.#talkUrl(title), { method: 'DELETE' });
  }

  async postComment(title, { author, message }) {
    let body = JSON.stringify({ author, message });
    await fetch(this.#talkUrl(title) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  #talkUrl(title) {
    return `${this.#baseUrl}/talks/` + encodeURIComponent(title);
  }
}
