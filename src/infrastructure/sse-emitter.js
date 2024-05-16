export class SseEmitter {
  #outputMessage;

  constructor(timeout) {
    console.log(timeout);
  }

  extendReponse(outputMessage) {
    this.#outputMessage = outputMessage;
  }

  send(data, event) {
    if (event) {
      this.#outputMessage.write(`event: ${event}\n`);
    }
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.#outputMessage.write(`data: ${message}\n\n`);
  }
}
