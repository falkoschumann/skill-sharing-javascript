/**
 * @import { Response } from 'express'
 */

export function runSafe(/** @type {Function} */ handler) {
  // TODO handle exception is obsolete with with Express 5
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (error) {
      next(error);
    }
  };
}

export function reply(
  /** @type {Response} */ response,
  { status = 200, headers = { 'Content-Type': 'text/plain' }, body = '' } = {},
) {
  response.status(status).header(headers).send(body);
}
