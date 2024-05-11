export class SseEmitter {
  constructor(timeout) {
    console.log(timeout);
  }

  send({ event, data }) {
    console.log(event, data);
  }
}
