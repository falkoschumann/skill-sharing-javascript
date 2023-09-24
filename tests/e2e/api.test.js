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
    test('retrieve talks', async () => {
      const repository = new Repository({ fileName });
      await repository.add({ title: 'Foobar', summary: 'Lorem ipsum' });
      const app = new ExpressApp({ repository }).app;

      const response = await request(app)
        .get('/api/talks')
        .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual([
        { title: 'Foobar', summary: 'Lorem ipsum' },
      ]);
    });
  });

  describe('PUT talk', () => {
    test('create a new talk', async () => {
      const repository = new Repository({ fileName });
      const app = new ExpressApp({ repository }).app;

      const response = await request(app)
        .put('/api/talks/foobar')
        .set('Accept', 'application/json')
        .send({ summary: 'lorem ipsum' });

      expect(response.status).toEqual(204);
      const talks = await repository.findAll();
      expect(talks).toEqual([{ title: 'foobar', summary: 'lorem ipsum' }]);
    });

    test('report error, if summary is missing', async () => {
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
