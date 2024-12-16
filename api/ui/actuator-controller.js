// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { HealthContributorRegistry } from '../health.js'
 * @import * as express from 'express'
 */

import fs from 'node:fs/promises';
import {
  HealthEndpoint,
  HttpCodeStatusMapper,
  StatusAggregator,
} from '@muspellheim/shared';
import { runSafe, reply } from '@muspellheim/shared/node';

export class ActuatorController {
  static create({
    packageJson = 'package.json',
    services,
    healthContributorRegistry,
    app,
  }) {
    return new ActuatorController(
      packageJson,
      services,
      healthContributorRegistry,
      app,
    );
  }

  #packageJson;
  #services;
  #healthContributorRegistry;

  /**
   * @param {string} packageJson
   * @param {*} services
   * @param {HealthContributorRegistry} healthContributorRegistry
   * @param {express.Express} app
   */
  constructor(
    packageJson,
    services, // FIXME Services is not defined in library
    healthContributorRegistry,
    app,
  ) {
    // FIXME Services is not defined in library
    this.#packageJson = packageJson;
    this.#services = services;
    this.#healthContributorRegistry = healthContributorRegistry;

    app.get('/actuator', this.#getActuator.bind(this));
    app.get('/actuator/info', this.#getActuatorInfo.bind(this));
    app.get('/actuator/metrics', this.#getActuatorMetrics.bind(this));
    app.get('/actuator/health', this.#getActuatorHealth.bind(this));
    app.get('/actuator/prometheus', runSafe(this.#getMetrics.bind(this)));
  }

  /**
   * @param {Request} request
   * @param {Response} response
   */
  async #getActuator(request, response) {
    let requestedUrl =
      request.protocol + '://' + request.get('host') + request.originalUrl;
    if (!requestedUrl.endsWith('/')) {
      requestedUrl += '/';
    }
    response.status(200).json({
      _links: {
        self: { href: requestedUrl },
        info: { href: requestedUrl + 'info' },
        metrics: { href: requestedUrl + 'metrics' },
        health: { href: requestedUrl + 'health' },
        prometheus: { href: requestedUrl + 'prometheus' },
      },
    });
  }

  /**
   * @param {Request} request
   * @param {Response} response
   */
  async #getActuatorInfo(request, response) {
    const json = await fs.readFile(this.#packageJson, 'utf8');
    const { name, version } = JSON.parse(json);
    const info = {};
    info[name] = { version };
    response.status(200).json(info);
  }

  /**
   * @param {Request} request
   * @param {Response} response
   */
  async #getActuatorMetrics(request, response) {
    response.status(200).json({
      cpu: process.cpuUsage(),
      mem: process.memoryUsage(),
      uptime: process.uptime(),
    });
  }

  /**
   * @param {Request} request
   * @param {Response} response
   */
  #getActuatorHealth(request, response) {
    const endpoint = new HealthEndpoint(this.#healthContributorRegistry, {
      primary: {
        statusAggregator: StatusAggregator.getDefault(),
        httpCodeStatusMapper: HttpCodeStatusMapper.getDefault(),
      },
    });
    const { status, body } = endpoint.health();
    response.status(status).json(body);
  }

  /**
   * @param {Request} request
   * @param {Response} response
   */
  async #getMetrics(request, response) {
    // TODO count warnings and errors
    // TODO create class MeterRegistry

    const metrics = await this.#services.getMetrics();
    const timestamp = new Date().getTime();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount} ${timestamp}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount} ${timestamp}\n\n`;
    body += `# TYPE comments_count gauge\ncomments_count ${metrics.commentsCount} ${timestamp}\n\n`;
    reply(response, { body });
  }
}
