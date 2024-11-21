// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import fs from 'node:fs/promises';
import EventSource from 'eventsource';
import request from 'supertest';
import { beforeEach, describe, expect, test } from 'vitest';

import { Talk } from '../../../shared/talks.js';
import { Application } from '../../../api/ui/application.js';

// TODO Review tests

describe('Application', () => {
  beforeEach(async () => {
    const testFile = new URL(
      '../../../testdata/e2e.application.json',
      import.meta.url,
    ).pathname;
    await fs.rm(testFile, { force: true });
  });

  test('Starts and stops the app', async () => {
    await startAndStop();
  });

  describe('Put talk', () => {
    test('Creates a new talk', async () => {
      await startAndStop({
        run: async ({ url }) => {
          let response = await request(url)
            .put('/api/talks/Foobar')
            .set('Content-Type', 'application/json')
            .send({ presenter: 'Anon', summary: 'Lorem ipsum' });

          expect(response.status).toEqual(204);

          response = await request(url).get('/api/talks/Foobar').send();
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            title: 'Foobar',
            presenter: 'Anon',
            summary: 'Lorem ipsum',
            comments: [],
          });
        },
      });
    });

    test('Reports an error if presenter is missing', async () => {
      await startAndStop({
        run: async ({ url }) => {
          let response = await request(url)
            .put('/api/talks/Foobar')
            .set('Accept', 'application/json')
            .send({ summary: 'Lorem ipsum' });

          expect(response.status).toEqual(400);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual('Bad talk data');
          response = await request(url).get('/api/talks').send();
          expect(response.body).toEqual([]);
        },
      });
    });

    test('Reports an error if summary is missing', async () => {
      await startAndStop({
        run: async ({ url }) => {
          let response = await request(url)
            .put('/api/talks/Foobar')
            .set('Accept', 'application/json')
            .send({ presenter: 'Anon' });

          expect(response.status).toEqual(400);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual('Bad talk data');
          response = await request(url).get('/api/talks').send();
          expect(response.body).toEqual([]);
        },
      });
    });
  });

  describe('Get talks', () => {
    test('Response with a single talk, when client asks for a specific talk', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url, Talk.createTestInstance({ title: 'Foobar' }));

          const response = await request(url)
            .get('/api/talks/Foobar')
            .set('Accept', 'application/json');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/application\/json/);
          expect(response.body).toEqual(
            Talk.createTestInstance({ title: 'Foobar', comments: [] }),
          );
        },
      });
    });

    test('Response an error, when client asks for a specific talk that does not exist', async () => {
      await startAndStop({
        run: async ({ url }) => {
          const response = await request(url)
            .get('/api/talks/Foobar')
            .set('Accept', 'application/json');

          expect(response.status).toEqual(404);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual('Talk not found: "Foobar".');
        },
      });
    });

    test('Replies with talks, if client asks for the first time', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url)
            .get('/api/talks')
            .set('Accept', 'application/json');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/application\/json/);
          expect(response.get('Cache-Control')).toEqual('no-store');
          expect(response.get('ETag')).toEqual('"1"');
          expect(response.body).toEqual([
            Talk.createTestInstance({ comments: [] }),
          ]);
        },
      });
    });

    test('Replies with talks, if client is not up to date', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url)
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
        },
      });
    });

    test('Reports not modified, if client is up to date', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url)
            .get('/api/talks')
            .set('Accept', 'application/json')
            .set('If-None-Match', '"1"');

          expect(response.status).toEqual(304);
        },
      });
    });

    test('Reports not modified, if long polling results in a timeout', async () => {
      await startAndStop({
        run: async ({ url }) => {
          const responsePromise = request(url)
            .get('/api/talks')
            .set('Accept', 'application/json')
            .set('Prefer', 'wait=1')
            .set('If-None-Match', '"0"');
          const submitHandler = setTimeout(
            () =>
              request(url)
                .put('/api/talks/Foobar')
                .set('Content-Type', 'application/json')
                .send({ presenter: 'Anon', summary: 'Lorem ipsum' }),
            2000,
          );
          const response = await responsePromise;

          expect(response.status).toEqual(304);
          clearTimeout(submitHandler);
        },
      });
    });

    test('Replies talks, if a talk was submitted while long polling', async () => {
      await startAndStop({
        run: async ({ url }) => {
          const timeoutId = setTimeout(() => submitTalk(url), 500);
          const response = await request(url)
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
        },
      });
    });
  });

  describe('Receive talk updates', () => {
    test.skip('Receives talk updates', async () => {
      await startAndStop({
        run: async ({ url, source }) => {
          await submitTalk(url);

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

  describe('Delete talk', () => {
    test('Deletes an existing talk', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url, Talk.createTestInstance({ title: 'Foobar' }));

          let response = await request(url).delete('/api/talks/Foobar').send();

          expect(response.status).toEqual(204);
          response = await request(url).get('/api/talks').send();
          expect(response.get('ETag')).toEqual('"2"');
          expect(response.body).toEqual([]);
        },
      });
    });
  });

  describe('Post comment', () => {
    test('Adds comment', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url, Talk.createTestInstance({ title: 'Foobar' }));

          let response = await request(url)
            .post('/api/talks/Foobar/comments')
            .set('Content-Type', 'application/json')
            .send({ author: 'Bob', message: 'New comment' });

          expect(response.status).toEqual(204);
          response = await request(url).get('/api/talks').send();
          expect(response.body).toEqual([
            Talk.createTestInstance({
              title: 'Foobar',
              comments: [{ author: 'Bob', message: 'New comment' }],
            }),
          ]);
        },
      });
    });

    test('Reports an error if talk does not exists', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await request(url)
            .put('/api/talks/foo')
            .set('Content-Type', 'application/json')
            .send({ presenter: 'Anon', summary: 'Lorem ipsum' });

          const response = await request(url)
            .post('/api/talks/bar/comments')
            .set('Content-Type', 'application/json')
            .send({ author: 'Bob', message: 'New comment' });

          expect(response.status).toEqual(404);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual(
            'The comment cannot be added because the talk "bar" does not exist.',
          );
        },
      });
    });

    test('Reports an error if author is missing', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url)
            .post('/api/talks/Foobar/comments')
            .set('Content-Type', 'application/json')
            .send({ message: 'New comment' });

          expect(response.status).toEqual(400);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual('Bad comment data');
        },
      });
    });

    test('Reports an error if message is missing', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url)
            .post('/api/talks/Foobar/comments')
            .set('Content-Type', 'application/json')
            .send({ author: 'Bob' });

          expect(response.status).toEqual(400);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toEqual('Bad comment data');
        },
      });
    });
  });

  describe.skip('Metrics', () => {
    test('Gets talks count', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url).get('/actuator/prometheus');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toMatch(
            /# TYPE talks_count gauge\ntalks_count 1 \d+\n\n/,
          );
        },
      });
    });

    test('Gets presenters count', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url).get('/actuator/prometheus');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toMatch(
            /# TYPE presenters_count gauge\npresenters_count 1 \d+\n\n/,
          );
        },
      });
    });

    test('Gets comments count', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url).get('/actuator/prometheus');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/text\/plain/);
          expect(response.text).toMatch(
            /# TYPE comments_count gauge\ncomments_count 0 \d+\n\n/,
          );
        },
      });
    });

    test('Gets info', async () => {
      await startAndStop({
        run: async ({ url }) => {
          await submitTalk(url);

          const response = await request(url).get('/actuator/info');

          expect(response.status).toEqual(200);
          expect(response.get('Content-Type')).toMatch(/application\/json/);
          expect(response.body).toEqual({
            'skill-sharing': { version: expect.any(String) },
          });
        },
      });
    });

    describe('Health', () => {
      test('Gets up', async () => {
        await startAndStop({
          run: async ({ url }) => {
            const response = await request(url).get('/actuator/health');

            expect(response.status).toEqual(200);
            expect(response.get('Content-Type')).toMatch(/application\/json/);
            expect(response.body).toMatchObject({ status: 'UP' });
          },
        });
      });

      test('Gets down', async () => {
        await startAndStop({
          configName: 'application.corrupt.json',
          run: async ({ url }) => {
            await submitTalk(url);

            const response = await request(url).get('/actuator/health');

            expect(response.status).toEqual(503);
            expect(response.get('Content-Type')).toMatch(/application\/json/);
            expect(response.body).toMatchObject({ status: 'DOWN' });
          },
        });
      });

      test('Gets metrics', async () => {
        await startAndStop({
          run: async ({ url }) => {
            await submitTalk(url);

            const response = await request(url).get('/actuator/metrics');

            expect(response.status).toEqual(200);
            expect(response.get('Content-Type')).toMatch(/application\/json/);
            expect(response.body).toEqual({
              cpu: expect.any(Object),
              mem: expect.any(Object),
              uptime: expect.any(Number),
            });
          },
        });
      });
    });
  });
});

async function startAndStop({ configName, run = async () => {} } = {}) {
  const application = new Application();
  application.configLocation = [new URL('.', import.meta.url).pathname];
  application.configName = configName;
  await application.start();
  // TODO Use port from configuration
  const url = 'http://localhost:3333';
  const source = new EventSource(`${url}/api/talks`);
  try {
    await run({ url, source });
  } finally {
    source.close();
    await application.stop();
  }
}

async function submitTalk(url, talk = Talk.createTestInstance()) {
  return await request(url)
    .put(`/api/talks/${encodeURIComponent(talk.title)}`)
    .set('Content-Type', 'application/json')
    .send({ presenter: talk.presenter, summary: talk.summary });
}
