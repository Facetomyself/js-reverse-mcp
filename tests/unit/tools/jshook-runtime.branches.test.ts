/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

async function importFreshRuntime(tag: string) {
  return import(`../../../src/tools/runtime.js?branch=${tag}_${Date.now()}`);
}

describe('jshook runtime branch coverage', () => {
  it('covers default and explicit env branches in runtime bootstrap', async () => {
    const originalPort = process.env.REMOTE_DEBUGGING_PORT;
    const originalHeadless = process.env.BROWSER_HEADLESS;
    const originalStealth = process.env.USE_STEALTH_SCRIPTS;
    const originalAutoLaunch = process.env.AUTO_LAUNCH_EXTERNAL_BROWSER;
    try {
      delete process.env.REMOTE_DEBUGGING_PORT;
      delete process.env.BROWSER_HEADLESS;
      process.env.USE_STEALTH_SCRIPTS = 'true';
      const runtimeDefault = await importFreshRuntime('default');
      const defaultInstance = runtimeDefault.getJSHookRuntime();
      assert.ok(defaultInstance.browserManager);
      assert.strictEqual(
        (defaultInstance.browserManager as unknown as {config?: {autoLaunch: boolean}}).config?.autoLaunch,
        false,
      );

      process.env.REMOTE_DEBUGGING_PORT = '9333';
      process.env.BROWSER_HEADLESS = 'false';
      process.env.USE_STEALTH_SCRIPTS = 'false';
      process.env.AUTO_LAUNCH_EXTERNAL_BROWSER = 'true';
      const runtimeExplicit = await importFreshRuntime('explicit');
      const explicitInstance = runtimeExplicit.getJSHookRuntime();
      assert.ok(explicitInstance.browserManager);
      assert.strictEqual(
        (explicitInstance.browserManager as unknown as {config?: {autoLaunch: boolean}}).config?.autoLaunch,
        true,
      );
    } finally {
      process.env.REMOTE_DEBUGGING_PORT = originalPort;
      process.env.BROWSER_HEADLESS = originalHeadless;
      process.env.USE_STEALTH_SCRIPTS = originalStealth;
      process.env.AUTO_LAUNCH_EXTERNAL_BROWSER = originalAutoLaunch;
    }
  });
});
