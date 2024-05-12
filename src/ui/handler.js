export function runSafe(handler) {
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
  response,
  { status = 200, headers = { 'Content-Type': 'text/plain' }, body = '' } = {},
) {
  response.status(status).header(headers).send(body);
}
