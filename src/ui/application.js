import path from 'node:path';
import express from 'express';

import { ActuatorController, HealthRegistry } from '@muspellheim/shared';

import { Services } from '../application/services.js';
import { TalksController } from './talks-controller.js';

/**
 * @import { Server } from 'node:http'
 */

export class Application {
  static create() {
    // TODO make repository file configurable for testing
    const healthRegistry = HealthRegistry.create();
    return new Application(
      Services.create({ healthRegistry }),
      healthRegistry,
      express(),
    );
  }

  #app;
  /** @type {Server} */ #server;

  constructor(
    /** @type {Services} */ services,
    /** @type {HealthRegistry} */ healthRegistry,
    /** @type {express.Express} */ app,
  ) {
    this.#app = app;
    app.set('x-powered-by', false);
    app.use(express.json());
    app.use('/', express.static(path.join('./public')));
    new TalksController(services, app);
    new ActuatorController(services, healthRegistry, app);
  }

  start({ port = 3000 } = {}) {
    console.log('Starting server...');
    return new Promise((resolve) => {
      this.#server = this.#app.listen(port, () => {
        console.log(`Server is listening on port ${port}.`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.#server.on('close', () => {
        console.log('Server stopped.');
        resolve();
      });
      this.#server.close();
      console.log('Stopping server...');
    });
  }
}
