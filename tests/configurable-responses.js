export class ConfigurableResponses {
  #responses;

  constructor(responses) {
    this.#responses = Array.isArray(responses) ? [...responses] : responses;
  }

  next() {
    const response = Array.isArray(this.#responses)
      ? this.#responses.shift()
      : this.#responses;
    if (response === undefined) {
      throw new Error('No more responses configured');
    }

    if (response instanceof Error) {
      throw response;
    }

    return response;
  }
}
