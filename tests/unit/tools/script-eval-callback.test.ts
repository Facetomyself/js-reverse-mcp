
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import { getJSHookRuntime } from '../../../src/tools/runtime.js';
import { evaluateScript, injectBeforeLoad, injectPreloadScript } from '../../../src/tools/script.js';

interface HandleLike {
  dispose(): Promise<void>;
}

interface PageLike {
  evaluateHandle(): Promise<HandleLike>;
  evaluate(callback: unknown, passedArg?: unknown): Promise<string>;
}

interface FrameLike extends PageLike {}

interface ContextLike {
  getSelectedPage(): PageLike;
  getSelectedFrame(): FrameLike;
  waitForEventsAfterAction(action: () => Promise<void>): Promise<void>;
  trackInjectedScript(identifier: string, script: string): void;
  untrackInjectedScript(identifier: string): void;
  debuggerContext: {
    isEnabled(): boolean;
    isPaused(): boolean;
    getPausedState(): {callFrames: Array<{callFrameId: string}>};
    getClient(): {
      send(method: string, params?: unknown): Promise<unknown>;
    } | null;
    evaluateOnCallFrame(
      callFrameId: string,
      expression: string,
      options?: unknown,
    ): Promise<{
      result: {value?: unknown};
      exceptionDetails?: {text: string; exception?: {description?: string}};
    }>;
  };
}

interface ResponseLike {
  appendResponseLine(value: string): void;
  setIncludePages(): void;
  setIncludeNetworkRequests(): void;
  setIncludeConsoleData(): void;
  attachImage(): void;
  attachNetworkRequest(): void;
  attachConsoleMessage(): void;
  setIncludeWebSocketConnections(): void;
  attachWebSocket(): void;
}

describe('evaluate_script callback path', () => {
  it('executes page.evaluate callback body and disposes handle', async () => {
    const lines: string[] = [];
    let disposed = 0;

    const fn = async () => ({ ok: true });

    const handle = {
      dispose: async () => {
        disposed += 1;
      },
    } satisfies HandleLike;

    const page: PageLike = {
      evaluateHandle: async () => handle,
      evaluate: async (callback, passedFn) => {
        if (typeof callback !== 'function') {
          throw new Error('expected callback evaluate path');
        }
        return callback(passedFn ?? fn);
      },
    };

    const context: ContextLike = {
      getSelectedPage: () => page,
      getSelectedFrame: () => page,
      waitForEventsAfterAction: async (action: () => Promise<void>) => {
        await action();
      },
      trackInjectedScript: () => undefined,
      untrackInjectedScript: () => undefined,
      debuggerContext: {
        isEnabled: () => false,
        isPaused: () => false,
        getPausedState: () => ({callFrames: []}),
        getClient: () => null,
        evaluateOnCallFrame: async () => ({result: {value: undefined}}),
      },
    };

    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await evaluateScript.handler({ params: { function: '() => ({ ok: true })' } } as Parameters<typeof evaluateScript.handler>[0], response as Parameters<typeof evaluateScript.handler>[1], {
      ...context,
      getSelectedPage: () => ({
        ...page,
        evaluate: async (callback: unknown) => {
          if (typeof callback !== 'function') {
            throw new Error('expected callback evaluate path');
          }
          return callback(fn);
        },
      }),
      getSelectedFrame: () => ({
        ...page,
        evaluate: async (callback: unknown) => {
          if (typeof callback !== 'function') {
            throw new Error('expected callback evaluate path');
          }
          return callback(fn);
        },
      }),
    } as unknown as Parameters<typeof evaluateScript.handler>[2]);

    assert.strictEqual(disposed, 1);
    assert.ok(lines.some((l) => l.includes('Script ran on page and returned')));
    assert.ok(lines.some((l) => l.includes('{"ok":true}')));
  });

  it('registers a preload script on future documents', async () => {
    const lines: string[] = [];
    let injected: string | undefined;

    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    const runtime = getJSHookRuntime();
    const originalInject = runtime.pageController.injectScriptOnNewDocument.bind(runtime.pageController);
    runtime.pageController.injectScriptOnNewDocument = async (scriptContent: string) => {
      injected = scriptContent;
    };

    try {
      await injectPreloadScript.handler(
        { params: { script: 'window.__preload = 1;' } } as Parameters<typeof injectPreloadScript.handler>[0],
        response as Parameters<typeof injectPreloadScript.handler>[1],
        {} as Parameters<typeof injectPreloadScript.handler>[2],
      );
    } finally {
      runtime.pageController.injectScriptOnNewDocument = originalInject;
    }

    assert.strictEqual(injected, 'window.__preload = 1;');
    assert.ok(lines.some((line) => line.includes('Preload script registered')));
  });

  it('runs evaluate_script in the selected frame execution context', async () => {
    const lines: string[] = [];
    let pageUsed = false;
    let frameUsed = false;

    const frameHandle = {
      dispose: async () => undefined,
    } satisfies HandleLike;

    const page: PageLike = {
      evaluateHandle: async () => {
        pageUsed = true;
        throw new Error('page should not be used when a frame is selected');
      },
      evaluate: async () => {
        pageUsed = true;
        throw new Error('page should not be used when a frame is selected');
      },
    };

    const frame: FrameLike = {
      evaluateHandle: async () => {
        frameUsed = true;
        return frameHandle;
      },
      evaluate: async (callback) => {
        frameUsed = true;
        if (typeof callback !== 'function') {
          throw new Error('expected callback evaluate path');
        }
        return callback(async () => ({ok: true}));
      },
    };

    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await evaluateScript.handler(
      { params: { function: '() => ({ ok: true })' } } as Parameters<typeof evaluateScript.handler>[0],
      response as Parameters<typeof evaluateScript.handler>[1],
      {
        getSelectedPage: () => page,
        getSelectedFrame: () => frame,
        waitForEventsAfterAction: async (action: () => Promise<void>) => {
          await action();
        },
        trackInjectedScript: () => undefined,
        untrackInjectedScript: () => undefined,
        debuggerContext: {
          isEnabled: () => false,
          isPaused: () => false,
          getPausedState: () => ({callFrames: []}),
          getClient: () => null,
          evaluateOnCallFrame: async () => ({result: {value: undefined}}),
        },
      } as unknown as Parameters<typeof evaluateScript.handler>[2],
    );

    assert.strictEqual(pageUsed, false);
    assert.strictEqual(frameUsed, true);
    assert.ok(lines.some((line) => line.includes('{"ok":true}')));
  });

  it('runs evaluate_script in paused call frame context when paused', async () => {
    const lines: string[] = [];
    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await evaluateScript.handler(
      { params: { function: '() => ({ ok: true })' } } as Parameters<typeof evaluateScript.handler>[0],
      response as Parameters<typeof evaluateScript.handler>[1],
      {
        getSelectedPage: () => ({
          evaluateHandle: async () => {
            throw new Error('page should not be used when paused');
          },
          evaluate: async () => {
            throw new Error('page should not be used when paused');
          },
        }),
        getSelectedFrame: () => ({
          evaluateHandle: async () => {
            throw new Error('frame should not be used when paused');
          },
          evaluate: async () => {
            throw new Error('frame should not be used when paused');
          },
        }),
        waitForEventsAfterAction: async () => undefined,
        trackInjectedScript: () => undefined,
        untrackInjectedScript: () => undefined,
        debuggerContext: {
          isEnabled: () => true,
          isPaused: () => true,
          getPausedState: () => ({callFrames: [{callFrameId: 'cf-1'}]}),
          getClient: () => null,
          evaluateOnCallFrame: async () => ({result: {value: '{"ok":true}'}}),
        },
      } as unknown as Parameters<typeof evaluateScript.handler>[2],
    );

    assert.ok(lines.some((line) => line.includes('paused context')));
    assert.ok(lines.some((line) => line.includes('{"ok":true}')));
  });

  it('runs evaluate_script in the page main world when requested', async () => {
    const lines: string[] = [];
    let bridgeUsed = false;
    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await evaluateScript.handler(
      { params: { function: '() => window.appState', mainWorld: true } } as Parameters<typeof evaluateScript.handler>[0],
      response as Parameters<typeof evaluateScript.handler>[1],
      {
        getSelectedPage: () => ({
          evaluateHandle: async () => {
            throw new Error('page should not be used in main world mode');
          },
          evaluate: async () => {
            throw new Error('page should not be used in main world mode');
          },
        }),
        getSelectedFrame: () => ({
          evaluateHandle: async () => {
            throw new Error('handle path should not be used in main world mode');
          },
          evaluate: async (_callback: unknown, arg?: unknown) => {
            bridgeUsed = true;
            const payload = arg as {fn: string; id: string};
            assert.ok(payload.fn.includes('window.appState'));
            assert.ok(payload.id.startsWith('__mcp_bridge_'));
            return '{"value":"from-main-world"}';
          },
        }),
        waitForEventsAfterAction: async () => undefined,
        trackInjectedScript: () => undefined,
        untrackInjectedScript: () => undefined,
        debuggerContext: {
          isEnabled: () => false,
          isPaused: () => false,
          getPausedState: () => ({callFrames: []}),
          getClient: () => null,
          evaluateOnCallFrame: async () => ({result: {value: undefined}}),
        },
      } as unknown as Parameters<typeof evaluateScript.handler>[2],
    );

    assert.strictEqual(bridgeUsed, true);
    assert.ok(lines.some((line) => line.includes('main world')));
    assert.ok(lines.some((line) => line.includes('from-main-world')));
  });

  it('injects a script before page load and tracks the identifier', async () => {
    const lines: string[] = [];
    const calls: Array<{method: string; params?: unknown}> = [];
    const tracked: Array<{identifier: string; script: string}> = [];
    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await injectBeforeLoad.handler(
      { params: { script: 'window.__early = true;' } } as Parameters<typeof injectBeforeLoad.handler>[0],
      response as Parameters<typeof injectBeforeLoad.handler>[1],
      {
        getSelectedPage: () => ({
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        }),
        getSelectedFrame: () => ({
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        }),
        waitForEventsAfterAction: async () => undefined,
        trackInjectedScript: (identifier: string, script: string) => {
          tracked.push({identifier, script});
        },
        untrackInjectedScript: () => undefined,
        debuggerContext: {
          isEnabled: () => true,
          isPaused: () => false,
          getPausedState: () => ({callFrames: []}),
          getClient: () => ({
            send: async (method: string, params?: unknown) => {
              calls.push({method, params});
              if (method === 'Page.addScriptToEvaluateOnNewDocument') {
                return {identifier: 'inj-1'};
              }
              return undefined;
            },
          }),
          evaluateOnCallFrame: async () => ({result: {value: undefined}}),
        },
      } as unknown as Parameters<typeof injectBeforeLoad.handler>[2],
    );

    assert.deepStrictEqual(calls.map((call) => call.method), [
      'Page.enable',
      'Page.addScriptToEvaluateOnNewDocument',
    ]);
    assert.deepStrictEqual(tracked, [
      {identifier: 'inj-1', script: 'window.__early = true;'},
    ]);
    assert.ok(lines.some((line) => line.includes('Script injected. Identifier: inj-1')));
  });

  it('removes an injected script identifier before page load', async () => {
    const lines: string[] = [];
    const calls: Array<{method: string; params?: unknown}> = [];
    const removed: string[] = [];
    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    await injectBeforeLoad.handler(
      { params: { identifier: 'inj-1' } } as Parameters<typeof injectBeforeLoad.handler>[0],
      response as Parameters<typeof injectBeforeLoad.handler>[1],
      {
        getSelectedPage: () => ({
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        }),
        getSelectedFrame: () => ({
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        }),
        waitForEventsAfterAction: async () => undefined,
        trackInjectedScript: () => undefined,
        untrackInjectedScript: (identifier: string) => {
          removed.push(identifier);
        },
        debuggerContext: {
          isEnabled: () => true,
          isPaused: () => false,
          getPausedState: () => ({callFrames: []}),
          getClient: () => ({
            send: async (method: string, params?: unknown) => {
              calls.push({method, params});
              return undefined;
            },
          }),
          evaluateOnCallFrame: async () => ({result: {value: undefined}}),
        },
      } as unknown as Parameters<typeof injectBeforeLoad.handler>[2],
    );

    assert.deepStrictEqual(calls.map((call) => call.method), [
      'Page.enable',
      'Page.removeScriptToEvaluateOnNewDocument',
    ]);
    assert.deepStrictEqual(removed, ['inj-1']);
    assert.ok(lines.some((line) => line.includes('Injected script inj-1 removed.')));
  });

  it('prefers the selected page client for inject_before_load after frame switching', async () => {
    const lines: string[] = [];
    const pageCalls: string[] = [];
    const frameCalls: string[] = [];
    const response: ResponseLike = {
      appendResponseLine: (v: string) => lines.push(v),
      setIncludePages: () => undefined,
      setIncludeNetworkRequests: () => undefined,
      setIncludeConsoleData: () => undefined,
      attachImage: () => undefined,
      attachNetworkRequest: () => undefined,
      attachConsoleMessage: () => undefined,
      setIncludeWebSocketConnections: () => undefined,
      attachWebSocket: () => undefined,
    };

    const pageClient = {
      send: async (method: string) => {
        pageCalls.push(method);
        if (method === 'Page.addScriptToEvaluateOnNewDocument') {
          return {identifier: 'inj-page'};
        }
        return undefined;
      },
    };

    const frameClient = {
      send: async (method: string) => {
        frameCalls.push(method);
        throw new Error(`frame client should not be used: ${method}`);
      },
    };

    await injectBeforeLoad.handler(
      { params: { script: 'window.__pageClient = true;' } } as Parameters<typeof injectBeforeLoad.handler>[0],
      response as Parameters<typeof injectBeforeLoad.handler>[1],
      {
        getSelectedPage: () => ({
          _client: () => pageClient,
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        } as unknown as PageLike),
        getSelectedFrame: () => ({
          evaluateHandle: async () => {
            throw new Error('unused');
          },
          evaluate: async () => {
            throw new Error('unused');
          },
        }),
        waitForEventsAfterAction: async () => undefined,
        trackInjectedScript: () => undefined,
        untrackInjectedScript: () => undefined,
        debuggerContext: {
          isEnabled: () => true,
          isPaused: () => false,
          getPausedState: () => ({callFrames: []}),
          getClient: () => frameClient,
          evaluateOnCallFrame: async () => ({result: {value: undefined}}),
        },
      } as unknown as Parameters<typeof injectBeforeLoad.handler>[2],
    );

    assert.deepStrictEqual(pageCalls, [
      'Page.enable',
      'Page.addScriptToEvaluateOnNewDocument',
    ]);
    assert.deepStrictEqual(frameCalls, []);
    assert.ok(lines.some((line) => line.includes('inj-page')));
  });
});
