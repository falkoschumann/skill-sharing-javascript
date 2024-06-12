import { describe, expect, test } from '@jest/globals';

import { Health, HealthRegistry, Status } from '../../../src/util/health.js';

describe('Health', () => {
  describe('Health endpoint', () => {
    test('Returns default health', () => {
      const endpoint = HealthRegistry.create();

      const health = endpoint.health();

      expect(health).toEqual({ status: 'UP' });
    });

    test('Registers health indicators', () => {
      const endpoint = HealthRegistry.create();
      endpoint.register('test', {
        health() {
          return new Health();
        },
      });

      const health = endpoint.health();

      expect(health).toEqual({
        status: 'UP',
        components: { test: { status: 'UP' } },
      });
    });

    test('Determines the worst status', () => {
      const endpoint = HealthRegistry.create();
      endpoint.register('test1', {
        health() {
          return new Health(Status.OUT_OF_SERVICE);
        },
      });
      endpoint.register('test2', {
        health() {
          return new Health(Status.DOWN);
        },
      });

      const health = endpoint.health();

      expect(health).toEqual({
        status: 'DOWN',
        components: {
          test1: { status: 'OUT_OF_SERVICE' },
          test2: { status: 'DOWN' },
        },
      });
    });
  });
});
