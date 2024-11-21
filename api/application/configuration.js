// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { RepositoryConfiguration } from '../infrastructure/repository.js';

export class Configuration {
  /**
   * @param {Configuration} [configuration]
   */
  static create({
    server = ServerConfiguration.create(),
    repository = RepositoryConfiguration.create(),
  } = {}) {
    return new Configuration(server, repository);
  }

  /**
   * @param {ServerConfiguration} server
   * @param {RepositoryConfiguration} repository
   */
  constructor(server, repository) {
    this.server = server;
    this.repository = repository;
  }
}

export class ServerConfiguration {
  /**
   * @param {ServerConfiguration} [configuration]
   */
  static create({ host = 'localhost', port = 3000 } = {}) {
    return new ServerConfiguration(host, port);
  }

  /**
   * @param {string} host
   * @param {number} port
   */
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }
}
