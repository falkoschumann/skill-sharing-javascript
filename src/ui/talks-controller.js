export class TalksController {
  #services;
  #version = 0;
  #waiting = [];

  constructor(services, app) {
    this.#services = services;
    this.#createRouteGetTalks(app);
    this.#createRouteGetTalk(app);
    this.#createRoutePutTalk(app);
    this.#createRouteDeleteTalk(app);
    this.#createRoutePostComment(app);
  }

  #createRouteGetTalks(app) {
    app.get('/api/talks', async (req, res) => {
      if (this.#isCurrentVersion(req)) {
        const response = await this.#tryLongPolling(req);
        this.#reply(res, response);
      } else {
        const response = await this.#talkResponse();
        this.#reply(res, response);
      }
    });
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

  async #talkResponse() {
    const talks = await this.#services.getTalks();
    const body = JSON.stringify(talks);
    return {
      headers: {
        'Content-Type': 'application/json',
        ETag: `"${this.#version}"`,
        'Cache-Control': 'no-store',
      },
      body,
    };
  }

  #reply(
    res,
    {
      status = 200,
      headers = { 'Content-Type': 'text/plain' },
      body = '',
    } = {},
  ) {
    res.status(status).header(headers).send(body);
  }

  #createRouteGetTalk(app) {
    app.get('/api/talks/:title', async (req, res) => {
      const title = decodeURIComponent(req.params.title);
      const talk = await this.#services.getTalk({ title });
      if (talk == null) {
        this.#reply(res, { status: 404, body: `No talk '${title}' found` });
      } else {
        this.#reply(res, {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(talk),
        });
      }
    });
  }

  #createRoutePutTalk(app) {
    app.put('/api/talks/:title', async (req, res) => {
      const title = decodeURIComponent(req.params.title);
      const talk = parseTalk(req.body);
      if (talk == null) {
        this.#reply(res, { status: 400, body: 'Bad talk data' });
      } else {
        await this.#services.submitTalk({
          title,
          presenter: talk.presenter,
          summary: talk.summary,
        });
        await this.#talksUpdated();
        this.#reply(res, { status: 204 });
      }
    });
  }

  #createRouteDeleteTalk(app) {
    app.delete('/api/talks/:title', async (req, res) => {
      const title = decodeURIComponent(req.params.title);
      await this.#services.deleteTalk({ title });
      await this.#talksUpdated();
      this.#reply(res, { status: 204 });
    });
  }

  #createRoutePostComment(app) {
    app.post('/api/talks/:title/comments', async (req, res) => {
      const comment = parseComment(req.body);
      if (comment == null) {
        this.#reply(res, { status: 400, body: 'Bad comment data' });
      } else {
        const title = decodeURIComponent(req.params.title);
        const response = await this.#tryAddComment({ title, comment });
        this.#reply(res, response);
      }
    });
  }

  async #tryAddComment({ title, comment }) {
    const { isSuccessful } = await this.#services.addComment({
      title,
      comment,
    });
    if (isSuccessful) {
      await this.#talksUpdated();
      return { status: 204 };
    } else {
      return { status: 404, body: `No talk '${title}' found` };
    }
  }

  async #talksUpdated() {
    this.#version++;
    const response = await this.#talkResponse();
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
  }
}

function parseTalk({ presenter, summary }) {
  if (typeof presenter == 'string' && typeof summary == 'string') {
    return { presenter, summary };
  }

  return null;
}

function parseComment({ author, message }) {
  if (typeof author == 'string' && typeof message == 'string') {
    return { author, message };
  }

  return null;
}
