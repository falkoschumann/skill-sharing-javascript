import express from 'express';
import request from 'supertest';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, test } from '@jest/globals';

import { Application } from '../../../src/ui/application.js';
import { Repository } from '../../../src/infrastructure/repository.js';

const testFile = fileURLToPath(
  new URL('../../../data/talks.test.json', import.meta.url),
);

describe('Skill Sharing app', () => {
  let app;

  beforeEach(() => {
    rmSync(testFile, { force: true });
    app = express();
    const repository = Repository.create({ fileName: testFile });
    Application.create({ app, repository });
  });

  describe('GET talks', () => {
    test('Replies with talks, if client asks for the first time', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });

    test('Replies with talks, if client is not up to date', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '"0"');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });

    test('Reports not modified, if client is up to date', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '"1"');

      expect(response.status).toEqual(304);
    });

    test('Reports not modified, if long polling results in a timeout', async () => {
      const responsePromise = request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('Prefer', 'wait=1')
        .set('If-None-Match', '"0"');
      const submitHandler = setTimeout(
        () =>
          request(app)
            .put('/api/talks/foobar')
            .set('Content-Type', 'application/json')
            .send({ presenter: 'Anon', summary: 'lorem ipsum' }),
        2000,
      );
      const response = await responsePromise;
      clearTimeout(submitHandler);

      expect(response.status).toEqual(304);
    });

    test('Replies talks, if a talk was submitted while long polling', async () => {
      const responsePromise = request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('Prefer', 'wait=1')
        .set('If-None-Match', '"0"');
      setTimeout(async () => {
        await request(app)
          .put('/api/talks/foobar')
          .set('Content-Type', 'application/json')
          .send({ presenter: 'Anon', summary: 'lorem ipsum' });
      }, 500);
      const response = await responsePromise;

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('"1"');
      expect(response.body).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });
  });

  describe('GET talk', () => {
    test('Replies with talk', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks/foobar')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        title: 'foobar',
        presenter: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });
    });

    test('Reports an error if talk does not exists', async () => {
      await request(app)
        .put('/api/talks/foo')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks/bar')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(404);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual("No talk 'bar' found");
    });
  });

  describe('PUT talk', () => {
    test('Creates a new talk', async () => {
      let response = await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });

    test('Reports an error if presenter is missing', async () => {
      let response = await request(app)
        .put('/api/talks/foobar')
        .set('Accept', 'application/json')
        .send({ summary: 'lorem ipsum' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad talk data');
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([]);
    });

    test('Reports an error if summary is missing', async () => {
      let response = await request(app)
        .put('/api/talks/foobar')
        .set('Accept', 'application/json')
        .send({ presenter: 'Anon' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad talk data');
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE talk', () => {
    test('Deletes an existing talk', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      let response = await request(app).delete('/api/talks/foobar').send();

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.get('ETag')).toEqual('"2"');
      expect(response.body).toEqual([]);
    });
  });

  describe('POST comment', () => {
    test('Adds comment', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      let response = await request(app)
        .post('/api/talks/foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob', message: 'new comment' });

      expect(response.status).toEqual(204);
      response = await request(app).get('/api/talks').send();
      expect(response.body).toEqual([
        {
          title: 'foobar',
          presenter: 'Anon',
          summary: 'lorem ipsum',
          comments: [{ author: 'Bob', message: 'new comment' }],
        },
      ]);
    });

    test('Reports an error if talk does not exists', async () => {
      await request(app)
        .put('/api/talks/foo')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .post('/api/talks/bar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob', message: 'new comment' });

      expect(response.status).toEqual(404);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual("No talk 'bar' found");
    });

    test('Reports an error if author is missing', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .post('/api/talks/foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ message: 'new comment' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad comment data');
    });

    test('Reports an error if message is missing', async () => {
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ presenter: 'Anon', summary: 'lorem ipsum' });

      const response = await request(app)
        .post('/api/talks/foobar/comments')
        .set('Content-Type', 'application/json')
        .send({ author: 'Bob' });

      expect(response.status).toEqual(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual('Bad comment data');
    });
  });
});
