export class AbstractApi {
  // eslint-disable-next-line no-unused-vars
  async getTalks(tag) {
    return { isNotModified: true };
  }

  // eslint-disable-next-line no-unused-vars
  async putTalk({ title, presenter, summary }) {
    return;
  }

  // eslint-disable-next-line no-unused-vars
  async deleteTalk(title) {
    return;
  }

  // eslint-disable-next-line no-unused-vars
  async postComment(title, { author, message }) {
    return;
  }
}

export class Api extends AbstractApi {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
    super();
    this.#baseUrl = baseUrl;
  }

  async getTalks(tag) {
    let response = await fetch(`${this.#baseUrl}/talks`, {
      headers: tag && {
        'If-None-Match': tag,
        Prefer: 'wait=90',
      },
    });
    let talks = await response.json();
    return {
      isNotModified: response.status === 304,
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
