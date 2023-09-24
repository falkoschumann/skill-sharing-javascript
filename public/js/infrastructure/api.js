export class Api {
  #baseUrl;

  constructor(baseUrl = '/api') {
    this.#baseUrl = baseUrl;
  }

  async getTalks() {
    const response = await fetch(`${this.#baseUrl}/talks`);
    return response.json();
  }

  async putTalk({ title, summary }) {
    await fetch(this.#talkUrl(title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    });
  }

  #talkUrl(title) {
    return `${this.#baseUrl}/talks/` + encodeURIComponent(title);
  }
}
