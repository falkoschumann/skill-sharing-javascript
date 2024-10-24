import EventSource from 'eventsource';
import express from 'express';
import request from 'supertest';
import { rmSync } from 'node:fs';
import { describe, expect, test } from '@jest/globals';

import { HealthContributorRegistry } from '@muspellheim/shared';

import { Application } from '../../../src/ui/application.js';
import { Repository } from '../../../src/infrastructure/repository.js';
import { Services } from '../../../src/application/services.js';
import { Talk } from '../../../public/js/domain/talks.js';

const corruptedFile = new URL('../data/corrupt.json', import.meta.url).pathname;

describe('Application', () => {
  test('Starts and stops the app', async () => {
    const { application } = configure();

    await application.start({ port: 3333 });
    await application.stop();
  });

  describe('Get talks', () => {
    test('Replies with talks, if client asks for the first time', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        Talk.createTestInstance({ comments: [] }),
      ]);
    });

    test('Replies with talks, if client is not up to date', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '"0"');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        Talk.createTestInstance({ comments: [] }),
      ]);
    });

    test('Reports not modified, if client is up to date', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '"1"');

      expect(response.status).toEqual(304);
    });

    test('Reports not modified, if long polling results in a timeout', async () => {
      const { app } = configure();

      const responsePromise = request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('Prefer', 'wait=1')
        .set('If-None-Match', '"0"');
      const submitHandler = setTimeout(
        () =>
          request(app)
            .put('/api/talks/Foobar')
            .set('Content-Type', 'application/json')
            .send({ presenter: 'Anon', summary: 'Lorem ipsum' }),
        2000,
      );
      const response = await responsePromise;

      expect(response.status).toEqual(304);
      clearTimeout(submitHandler);
    });

    test('Replies talks, if a talk was submitted while long polling', async () => {
      const { app } = configure();

      const timeoutId = setTimeout(() => submitTalk(app), 500);
      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('Prefer', 'wait=1')
        .set('If-None-Match', '"0"');
      clearTimeout(timeoutId);

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        Talk.createTestInstance({ comments: [] }),
      ]);
    });
  });

  describe('Receive talk updates', () => {
    test.skip('Receives talk updates', async () => {
      await startAndStop({
        run: async ({ app, source }) => {
          await submitTalk(app);

          // FIXME Submitted talk is not written to disk when the event is sent
          const talks = await new Promise((resolve) => {
            source.addEventListener('message', (event) => {
              resolve(JSON.parse(event.data));
            });
          });

          expect(talks).toEqual([
            { title: 'Foobar', presenter: 'Anon', summary: 'Lorem ipsum' },
          ]);
        },
      });
    });
  });

  describe('Put talk', () => {
    test('Creates a new talk', async () => {
      const { app } = configure();

      let response = await request(app)
        .put('/api/talks/Foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'Lorem ipsum' });

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([
        {
          title: 'Foobar',
          presenter: 'Anon',
          summary: 'Lorem ipsum',
          comments: [],
        },
      ]);
    });

    test('Reports an error if presenter is missing', async () => {
      const { app } = configure();

      let response = await request(app)
        .put('/api/talks/Foobar')
        .set('Accept', 'application/json')
        .send({ summary: 'Lorem ipsum' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad talk data');
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([]);
    });

    test('Reports an error if summary is missing', async () => {
      const { app } = configure();

      let response = await request(app)
        .put('/api/talks/Foobar')
        .set('Accept', 'application/json')
        .send({ presenter: 'Anon' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad talk data');
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([]);
    });
  });

  describe('Delete talk', () => {
    test('Deletes an existing talk', async () => {
      const { app } = configure();
      await submitTalk(app, Talk.createTestInstance({ title: 'Foobar' }));

      let response = await request(app).delete('/api/talks/Foobar').send();

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.get('ETag')).toEqual('"2"');
      expect(response.body).toEqual([]);
    });
  });

  describe('Post comment', () => {
    test('Adds comment', async () => {
      const { app } = configure();
      await submitTalk(app, Talk.createTestInstance({ title: 'Foobar' }));

      let response = await request(app)
        .post('/api/talks/Foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob', message: 'New comment' });

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([
        Talk.createTestInstance({
          title: 'Foobar',
          comments: [{ author: 'Bob', message: 'New comment' }],
        }),
      ]);
    });

    test('Reports an error if talk does not exists', async () => {
      const { app } = configure();
      await request(app)
        .put('/api/talks/foo')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'Lorem ipsum' });

      const response = await request(app)
        .post('/api/talks/bar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob', message: 'New comment' });

      expect(response.status).toEqual(404);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual("No talk 'bar' found");
    });

    test('Reports an error if author is missing', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app)
        .post('/api/talks/Foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ message: 'New comment' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad comment data');
    });

    test('Reports an error if message is missing', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app)
        .post('/api/talks/Foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad comment data');
    });
  });

  describe('Metrics', () => {
    test('Gets talks count', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app).get('/actuator/prometheus');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toMatch(
        /# TYPE talks_count gauge\ntalks_count 1 \d+\n\n/,
      );
    });

    test('Gets presenters count', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app).get('/actuator/prometheus');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toMatch(
        /# TYPE presenters_count gauge\npresenters_count 1 \d+\n\n/,
      );
    });

    test('Gets comments count', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app).get('/actuator/prometheus');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toMatch(
        /# TYPE comments_count gauge\ncomments_count 0 \d+\n\n/,
      );
    });

    test('Gets info', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app).get('/actuator/info');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        'skill-sharing': { version: expect.any(String) },
      });
    });

    describe('Health', () => {
      test('Gets up', async () => {
        const { app } = configure();

        const response = await request(app).get('/actuator/health');

        expect(response.status).toEqual(200);
        expect(response.get('Content-Type')).toMatch(/application\/json/);
        expect(response.body).toMatchObject({ status: 'UP' });
      });

      test('Gets down', async () => {
        const { app } = configure({ fileName: corruptedFile });
        await submitTalk(app);

        const response = await request(app).get('/actuator/health');

        expect(response.status).toEqual(503);
        expect(response.get('Content-Type')).toMatch(/application\/json/);
        expect(response.body).toMatchObject({ status: 'DOWN' });
      });
    });

    test('Gets metrics', async () => {
      const { app } = configure();
      await submitTalk(app);

      const response = await request(app).get('/actuator/metrics');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        cpu: expect.any(Object),
        mem: expect.any(Object),
        uptime: expect.any(Number),
      });
    });
  });
});

// TODO Use testdata folder
const testFile = new URL('../../../data/talks.test.json', import.meta.url)
  .pathname;

function configure({ fileName = testFile } = {}) {
  rmSync(testFile, { force: true });
  const app = express();
  const repository = Repository.create({ fileName });
  const healthContributorRegistry = new HealthContributorRegistry();
  const services = new Services(repository, healthContributorRegistry);
  const application = new Application(services, healthContributorRegistry, app);
  return { application, app };
}

async function startAndStop({ run = async () => {} } = {}) {
  const { application, app } = configure();
  await application.start({ port: 3333 });
  const source = new EventSource('http://localhost:3333/api/talks');
  try {
    await run({ app, source });
  } finally {
    source.close();
    await application.stop();
  }
}

async function submitTalk(app, talk = Talk.createTestInstance()) {
  return request(app)
    .put(`/api/talks/${encodeURIComponent(talk.title)}`)
    .set('Content-Type', 'application/json')
    .send({ presenter: talk.presenter, summary: talk.summary });
}
