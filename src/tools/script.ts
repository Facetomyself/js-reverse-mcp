/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {getPageCdpSession} from '../CdpSession.js';
import {zod} from '../third_party/index.js';
import type {JSHandle} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool} from './ToolDefinition.js';

// Default script evaluation timeout in milliseconds (30 seconds)
const DEFAULT_SCRIPT_TIMEOUT = 30000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export const evaluateScript = defineTool({
  name: 'evaluate_script',
  description: `Evaluate a JavaScript function inside the currently selected page. Returns the response as JSON
so returned values have to JSON-serializable. When execution is paused at a breakpoint, automatically evaluates in the paused call frame context.`,
  annotations: {
    category: ToolCategory.DEBUGGING,
    readOnlyHint: false,
  },
  schema: {
    function: zod.string().describe(
      `A JavaScript function declaration to be executed by the tool in the currently selected page.
Example without arguments: \`() => {
  return document.title
}\` or \`async () => {
  return await fetch("example.com")
}\`.
Example with arguments: \`(el) => {
  return el.innerText;
}\`
`,
    ),
    mainWorld: zod
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Execute the function in the page main world instead of the default isolated context. Use this when you need page-defined globals such as window.app or window.bdms. The function should be synchronous and return a JSON-serializable value.',
      ),
  },
  handler: async (request, response, context) => {
    const debugger_ = context.debuggerContext;
    if (debugger_.isEnabled() && debugger_.isPaused()) {
      const pausedState = debugger_.getPausedState();
      const callFrameId = pausedState.callFrames[0]?.callFrameId;
      if (callFrameId) {
        const expression = `JSON.stringify((${request.params.function})())`;
        const result = await debugger_.evaluateOnCallFrame(callFrameId, expression, {
          returnByValue: true,
        });

        if (result.exceptionDetails) {
          const errMsg =
            result.exceptionDetails.exception?.description ||
            result.exceptionDetails.text;
          throw new Error(`Script evaluation error: ${errMsg}`);
        }

        const value = result.result.value as string | undefined;
        response.appendResponseLine(
          'Script ran on page (paused context) and returned:',
        );
        response.appendResponseLine('```json');
        response.appendResponseLine(`${value ?? 'undefined'}`);
        response.appendResponseLine('```');
        return;
      }
    }

    if (request.params.mainWorld) {
      const frame = context.getSelectedFrame();
      const bridgeId = `__mcp_bridge_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const result = await withTimeout(
        frame.evaluate(
          async ({fn, id}) => {
            const bridge = document.createElement('div');
            bridge.id = id;
            bridge.style.display = 'none';
            document.documentElement.appendChild(bridge);

            const script = document.createElement('script');
            script.textContent = `
              (function() {
                var el = document.getElementById(${JSON.stringify(id)});
                try {
                  var result = (${fn})();
                  el.setAttribute('data-result', JSON.stringify(result));
                } catch (error) {
                  el.setAttribute('data-error', error && error.message ? error.message : String(error));
                }
              })();
            `;
            document.documentElement.appendChild(script);
            script.remove();

            const data = bridge.getAttribute('data-result');
            const error = bridge.getAttribute('data-error');
            bridge.remove();

            if (error) {
              throw new Error(error);
            }
            return data ?? 'undefined';
          },
          {fn: request.params.function, id: bridgeId},
        ),
        DEFAULT_SCRIPT_TIMEOUT,
        'Script evaluation timed out',
      );

      response.appendResponseLine(
        'Script ran on page (main world) and returned:',
      );
      response.appendResponseLine('```json');
      response.appendResponseLine(`${result}`);
      response.appendResponseLine('```');
      return;
    }

    let fn: JSHandle<unknown> | undefined;
    try {
      const frame = context.getSelectedFrame();
      fn = await withTimeout(
        frame.evaluateHandle(`(${request.params.function})`),
        DEFAULT_SCRIPT_TIMEOUT,
        'Script evaluation timed out',
      );
      await context.waitForEventsAfterAction(async () => {
        const result = await withTimeout(
          frame.evaluate(async fn => {
            // @ts-expect-error no types.
            return JSON.stringify(await fn());
          }, fn),
          DEFAULT_SCRIPT_TIMEOUT,
          'Script execution timed out',
        );
        response.appendResponseLine('Script ran on page and returned:');
        response.appendResponseLine('```json');
        response.appendResponseLine(`${result}`);
        response.appendResponseLine('```');
      });
    } finally {
      if (fn) {
        void fn.dispose();
      }
    }
  },
});

export const injectPreloadScript = defineTool({
  name: 'inject_preload_script',
  description:
    'Register a JavaScript snippet that will run on future document loads before page scripts execute. Use this for preload hooks, environment patches, and early instrumentation.',
  annotations: {
    category: ToolCategory.DEBUGGING,
    readOnlyHint: false,
  },
  schema: {
    script: zod.string().describe('JavaScript source to register for future document loads.'),
  },
  handler: async (request, response) => {
    const runtime = getJSHookRuntime();
    await runtime.pageController.injectScriptOnNewDocument(request.params.script);
    response.appendResponseLine('Preload script registered for future documents.');
  },
});

export const injectBeforeLoad = defineTool({
  name: 'inject_before_load',
  description:
    'Injects a JavaScript script that runs before any page script on every page load. Pass script to inject, or pass identifier to remove a previously injected script.',
  annotations: {
    category: ToolCategory.DEBUGGING,
    readOnlyHint: false,
  },
  schema: {
    script: zod
      .string()
      .optional()
      .describe(
        'JavaScript code to inject before any page script executes.',
      ),
    identifier: zod
      .string()
      .optional()
      .describe(
        'The identifier of a previously injected script to remove.',
      ),
  },
  handler: async (request, response, context) => {
    const debugger_ = context.debuggerContext;

    if (!debugger_.isEnabled()) {
      response.appendResponseLine(
        'Debugger is not enabled. Please select a page first.',
      );
      return;
    }

    const page = context.getSelectedPage();
    // Prefer the page-level CDP session so early-injection stays scoped to the
    // selected page even after switching execution to a child frame.
    const client = (() => {
      try {
        return getPageCdpSession(page);
      } catch {
        return debugger_.getClient();
      }
    })();
    if (!client) {
      response.appendResponseLine('Debugger client not available.');
      return;
    }

    const {script, identifier} = request.params;
    if (!script && !identifier) {
      response.appendResponseLine(
        'Either script (to inject) or identifier (to remove) must be provided.',
      );
      return;
    }

    try {
      await client.send('Page.enable');

      if (identifier) {
        await client.send('Page.removeScriptToEvaluateOnNewDocument', {
          identifier,
        });
        context.untrackInjectedScript(identifier);
        response.appendResponseLine(`Injected script ${identifier} removed.`);
        return;
      }

      const result = await client.send(
        'Page.addScriptToEvaluateOnNewDocument',
        {source: script!},
      ) as {identifier: string};
      context.trackInjectedScript(result.identifier, script!);
      response.appendResponseLine(
        `Script injected. Identifier: ${result.identifier}`,
      );
      response.appendResponseLine(
        'It will run before any page script on every load.',
      );
      response.appendResponseLine(
        `To remove: inject_before_load(identifier: "${result.identifier}")`,
      );
    } catch (error) {
      response.appendResponseLine(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});
