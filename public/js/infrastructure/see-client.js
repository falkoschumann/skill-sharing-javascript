export class SseClient {
  static create() {
    return new SseClient(EventSource);
  }

  static createNull() {
    return new SseClient(EventSourceStub);
  }

  #eventSourceConstructor;
  #eventSource;

  constructor(eventSourceConstructor) {
    this.#eventSourceConstructor = eventSourceConstructor;
  }

  get isConnected() {
    return this.#eventSource?.readyState === this.#eventSourceConstructor.OPEN;
  }

  async connect(eventListenerOrEventType, eventListener) {
    if (this.isConnected) {
      throw new Error('Already connected.');
    }

    const eventType =
      typeof eventListenerOrEventType === 'string'
        ? eventListenerOrEventType
        : 'message';
    if (typeof eventListenerOrEventType === 'function') {
      eventListener = eventListenerOrEventType;
    }
    await new Promise((resolve) => {
      this.#eventSource = new this.#eventSourceConstructor('/api/talks');
      this.#eventSource.addEventListener(eventType, eventListener);
      this.#eventSource.addEventListener('open', () => resolve());
    });
  }

  async close() {
    this.#eventSource.close();
  }

  simulateMessage(data, eventType = 'message') {
    this.#eventSource.dispatchEvent(new MessageEvent(eventType, { data }));
  }
}

class EventSourceStub extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor() {
    super();

    this.readyState = EventSourceStub.CONNECTING;
    setTimeout(() => {
      this.readyState = EventSourceStub.OPEN;
      this.dispatchEvent(new Event('open'));
    });
  }

  close() {
    this.readyState = EventSourceStub.CLOSED;
  }
}
