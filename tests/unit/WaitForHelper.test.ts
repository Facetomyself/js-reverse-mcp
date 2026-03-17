/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {EventEmitter} from 'node:events';
import {describe, it} from 'node:test';

import {WaitForHelper} from '../../src/WaitForHelper.js';

interface HandleLike {
  evaluate(callback: unknown): Promise<unknown>;
  dispose(): Promise<void>;
}

function createPageHarness() {
  const client = new EventEmitter() as EventEmitter & {
    on(event: string, listener: (...args: unknown[]) => void): typeof client;
    off(event: string, listener: (...args: unknown[]) => void): typeof client;
    send(method: string, params?: unknown): Promise<unknown>;
  };
  client.send = async () => undefined;

  let waitForNavigationCalls = 0;
  let waitForNavigationOptions: unknown[] = [];

  const handle: HandleLike = {
    evaluate: async () => undefined,
    dispose: async () => undefined,
  };

  const page = {
    evaluateHandle: async () => handle,
    waitForNavigation: async (options?: unknown) => {
      waitForNavigationCalls += 1;
      waitForNavigationOptions.push(options);
      return undefined;
    },
  };
  Object.defineProperty(page, '_client', {
    value: () => client,
    configurable: true,
    enumerable: true,
  });

  return {
    client,
    page,
    get waitForNavigationCalls() {
      return waitForNavigationCalls;
    },
    get waitForNavigationOptions() {
      return waitForNavigationOptions;
    },
  };
}

describe('WaitForHelper', () => {
  it('detects a navigation start via the page CDP session', async () => {
    const {client, page} = createPageHarness();
    const helper = new WaitForHelper(page as never, 1, 1);

    const navigationPromise = helper.waitForNavigationStarted();
    client.emit('Page.frameStartedNavigating', {navigationType: 'reload'});

    await assert.doesNotReject(async () => {
      assert.strictEqual(await navigationPromise, true);
    });
  });

  it('ignores same-document navigation events', async () => {
    const {client, page} = createPageHarness();
    const helper = new WaitForHelper(page as never, 1, 1);

    const navigationPromise = helper.waitForNavigationStarted();
    client.emit('Page.frameStartedNavigating', {
      navigationType: 'sameDocument',
    });

    assert.strictEqual(await navigationPromise, false);
  });

  it('waits for navigation completion after the action emits a navigation event', async () => {
    const harness = createPageHarness();
    const helper = new WaitForHelper(harness.page as never, 1, 1);
    let actionCalls = 0;

    await helper.waitForEventsAfterAction(async () => {
      actionCalls += 1;
      harness.client.emit('Page.frameStartedNavigating', {
        navigationType: 'reload',
      });
    });

    assert.strictEqual(actionCalls, 1);
    assert.strictEqual(harness.waitForNavigationCalls, 1);
    const options = harness.waitForNavigationOptions[0] as {
      timeout: number;
      waitUntil: string;
      signal?: AbortSignal;
    };
    assert.strictEqual(options.timeout, 3000);
    assert.strictEqual(options.waitUntil, 'domcontentloaded');
    assert.ok(options.signal instanceof AbortSignal);
  });
});
