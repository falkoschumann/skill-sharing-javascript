import {describe, expect, test} from '@jest/globals';
import request from 'supertest';

import {queryTalks} from '../../src/application/services.js';
import {loadTalks} from '../../src/infrastructure/repository.js';
import {ExpressApp} from '../../src/ui/express-app.js';

const repository = {
  loadTalks: () => loadTalks({fileName: './tests/data/example.json'}),
};

const services = {
  queryTalks: () => queryTalks(repository),
};

describe('API', () => {
  describe('GET talks', () => {
    test('responds with talks array', async () => {
      const app = new ExpressApp(services).app;

      const response = await request(app)
          .get('/talks')
          .set('Accept', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual([
        {
          title: 'Foobar',
          summary: 'Lorem ipsum',
        },
      ]);
    });
  });
});
