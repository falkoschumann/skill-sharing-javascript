import * as handler from '../ui/handler.js';

export class LongPolling {
  #version = 0;
  #waiting = [];
  #getData;

  constructor(getData) {
    this.#getData = getData;
  }

  async poll(req, res) {
    if (this.#isCurrentVersion(req)) {
      const response = await this.#tryLongPolling(req);
      handler.reply(res, response);
    } else {
      const response = await this.#getResponse();
      handler.reply(res, response);
    }
  }

  async send() {
    this.#version++;
    const response = await this.#getResponse();
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
  }

  #isCurrentVersion(req) {
    const tag = /"(.*)"/.exec(req.get('If-None-Match'));
    return tag && tag[1] === String(this.#version);
  }

  async #tryLongPolling(req) {
    const time = this.#getPollingTime(req);
    if (time == null) {
      return { status: 304 };
    }

    return this.#waitForChange(time);
  }

  #getPollingTime(req) {
    const wait = /\bwait=(\d+)/.exec(req.get('Prefer'));
    return wait != null ? Number(wait[1]) : null;
  }

  async #waitForChange(time) {
    return new Promise((resolve) => {
      this.#waiting.push(resolve);
      setTimeout(async () => {
        if (this.#waiting.includes(resolve)) {
          this.#waiting = this.#waiting.filter((r) => r !== resolve);
          resolve({ status: 304 });
        }
      }, time * 1000);
    });
  }

  async #getResponse() {
    const data = await this.#getData();
    const body = JSON.stringify(data);
    return {
      headers: {
        'Content-Type': 'application/json',
        ETag: `"${this.#version}"`,
        'Cache-Control': 'no-store',
      },
      body,
    };
  }
}
