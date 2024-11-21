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
   * @param {string} [directory=./public]
   * @param {string} [route=/]
   */
  constructor(app, directory = './public', route = '/') {
    app.use(route, express.static(path.join(directory)));
  }
}
