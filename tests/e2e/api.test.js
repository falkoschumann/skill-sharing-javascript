import { rmSync } from 'fs';
import { beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { ExpressApp } from '../../src/ui/express-app.js';
import { Repository } from '../../src/infrastructure/repository.js';

const fileName = './data/talks.test.json';

describe('API', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
  });

  describe('GET talks', () => {
    test('replies with talks, if client asks for the first time', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('1');
      expect(response.body).toEqual([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);
    });

    test('replies with talks, if client is not up to date', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '0');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.get('Cache-Control')).toEqual('no-store');
      expect(response.get('ETag')).toEqual('1');
      expect(response.body).toEqual([
        { title: 'foobar', summary: 'lorem ipsum' },
      ]);
    });

    test('reports not modified, if client is up to date', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;
      await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ summary: 'lorem ipsum' });

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json')
        .set('If-None-Match', '1');

      expect(response.status).toEqual(304);
    });
  });

  describe('PUT talk', () => {
    test('creates a new talk', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;

      const response = await request(app)
        .put('/api/talks/foobar')
        .set('Content-Type', 'application/json')
        .send({ summary: 'lorem ipsum' });

      expect(response.status).toEqual(204);
      const talks = await repository.findAll();
      expect(talks).toEqual([{ title: 'foobar', summary: 'lorem ipsum' }]);
    });

    test('reports an error, if summary is missing', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;

      const response = await request(app)
        .put('/api/talks/foobar')
        .set('Accept', 'application/json')
        .send({});

      expect(response.status).toEqual(400);
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });
});
