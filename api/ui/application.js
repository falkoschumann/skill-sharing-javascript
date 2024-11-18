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
    // TODO Configure directory for static files
    this.#app.use('/', express.static(path.join('./dist')));
    new TalksController(services, this.#app);
  }

  async start() {
    // TODO Use logger instead of console
    console.info('Starting server...');
    const { port } = await this.#loadConfiguration();
    return new Promise((resolve) => {
      this.#server = this.#app.listen(port, () => {
        console.info(`Server is listening on port ${port}.`);
        resolve();
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.#server.on('close', () => {
        console.info('Server stopped.');
        resolve();
      });
      this.#server.close();
      console.info('Stopping server...');
    });
  }

  async #loadConfiguration() {
    const configuration = ConfigurationProperties.create({
      name: this.configName,
      location: this.configLocation,
      defaults: { port: 3000 },
    });
    return await configuration.get();
  }
}
