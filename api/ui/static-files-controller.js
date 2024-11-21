// Copyright (c) 2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { Express } from 'express'
 */

import path from 'node:path';
import express from 'express';

// TODO Move module to @muspellheim/shared/express

export class StaticFilesController {
  /**
   * @param {Express} app
   * @param {string} [route=/]
   * @param {string} [directory=./public]
   */
  constructor(app, route = '/', directory = './public') {
    app.use(route, express.static(path.join(directory)));
  }
}
