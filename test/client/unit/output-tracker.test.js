import { describe, expect, test } from '@jest/globals';

import { OutputTracker } from '../../../public/js/util/output-tracker.js';

describe('Output tracker', () => {
  test('Uses custom event to track output', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');

    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    expect(outputTracker.data).toEqual(['bar']);
  });

  test('Clears stored output', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');
    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    expect(outputTracker.clear()).toEqual(['bar']);

    expect(outputTracker.data).toEqual([]);
  });

  test('Stops tracking', () => {
    const eventTarget = new EventTarget();
    const outputTracker = OutputTracker.create(eventTarget, 'foo');
    const event = new CustomEvent('foo', { detail: 'bar' });
    eventTarget.dispatchEvent(event);

    outputTracker.stop();
    eventTarget.dispatchEvent(event);

    expect(outputTracker.data).toEqual(['bar']);
  });
});
