// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import path from 'node:path';
import express from 'express';
import { ConfigurationProperties } from '@muspellheim/shared/node';

import { Service } from '../application/service.js';
import { TalksController } from './talks-controller.js';

/**
 * @import { Server } from 'node:http'
 */

export class Application {
  static create() {
    return new Application(Service.create());
  }

  /** @type {string=} */ configName;
  /** @type {string[]=} */ configLocation;

  #app;
  /** @type {Server} */ #server;

  constructor(/** @type {Service} */ services) {
    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use(express.json());
    this.#app.use('/', express.static(path.join('./dist')));
    new TalksController(services, this.#app);
  }

  async start() {
    // TODO make repository file configurable for testing
    console.log('Starting server...');
    const configuration = ConfigurationProperties.create({
      name: this.configName,
      location: this.configLocation,
      defaults: { port: 3000 },
    });
    const { port } = await configuration.get();
    return new Promise((resolve) => {
      this.#server = this.#app.listen(port, () => {
        console.log(`Server is listening on port ${port}.`);
        resolve();
      });
    });
  }

  async stop() {
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
