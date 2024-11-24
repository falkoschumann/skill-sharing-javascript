// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import http from 'node:http'
 * @import { ServerConfiguration } from '../application/configuration.js'
 * @import { RepositoryConfiguration } from '../infrastructure/repository.js'
 */

import express from 'express';
import { ConfigurationProperties } from '@muspellheim/shared/node';

import { Configuration } from '../application/configuration.js';
import { Service } from '../application/service.js';
import { StaticFilesController } from './static-files-controller.js';
import { TalksController } from './talks-controller.js';
import { Repository } from '../infrastructure/repository.js';

export class Application {
  /** @type {string=} */ configName;
  /** @type {string[]=} */ configLocation;

  /** @type {http.Server} */ #server;

  async start() {
    // TODO Use logger instead of console
    console.info('Starting server...');
    const { server, repository } = await this.#loadConfiguration();
    const app = this.#createApp(repository);
    await this.#startServer(app, server);
    console.info(`Server is listening on ${server.host}:${server.port}.`);
  }

  async stop() {
    console.info('Stopping server...');
    await this.#stopServer();
    console.info('Server stopped.');
  }

  /**
   * @returns {Promise<Configuration>}
   */
  async #loadConfiguration() {
    // TODO read configName and configLocation inside ConfigurationProperties
    // TODO Use template for defaults and return with get()
    // TODO Cache loaded configuration
    const configuration = ConfigurationProperties.create({
      name: this.configName,
      location: this.configLocation,
      defaults: Configuration.create(),
    });
    return await configuration.get();
  }

  /**
   * @param {RepositoryConfiguration} configuration
   */
  #createApp(configuration) {
    const app = express();
    app.set('x-powered-by', false);
    app.use(express.json());
    new StaticFilesController(app, './dist');
    const service = new Service(Repository.create(configuration));
    new TalksController(service, app);
    return app;
  }

  /**
   * @param {express.Express} app
   * @param {ServerConfiguration} configuration
   */
  async #startServer(app, { host, port }) {
    await new Promise((resolve) => {
      this.#server = app.listen(port, host, () => resolve());
    });
  }

  async #stopServer() {
    await new Promise((resolve) => {
      this.#server.on('close', () => resolve());
      this.#server.close();
    });
  }
}
