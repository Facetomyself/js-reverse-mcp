/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {getFrameCdpSession, getPageCdpSession} from '../../src/CdpSession.js';

describe('CdpSession helpers', () => {
  it('returns the page CDP session from the internal page client', () => {
    const client = {
      send: async () => undefined,
    };

    const page = {
      _client: () => client,
    };

    assert.strictEqual(
      getPageCdpSession(page as never),
      client as never,
    );
  });

  it('returns the frame CDP session from the frame client when available', () => {
    const client = {
      send: async () => undefined,
    };

    const page = {
      mainFrame: () => ({id: 'main'}),
      _client: () => {
        throw new Error('page client should not be used');
      },
    };

    const frame = {
      client,
      page: () => page,
    };

    assert.strictEqual(
      getFrameCdpSession(frame as never),
      client as never,
    );
  });

  it('falls back to the page CDP session for the main frame', () => {
    const client = {
      send: async () => undefined,
    };

    const mainFrame = {
      page: () => page,
    };

    const page = {
      mainFrame: () => mainFrame,
      _client: () => client,
    };

    assert.strictEqual(
      getFrameCdpSession(mainFrame as never),
      client as never,
    );
  });

  it('throws a clear error when the page CDP session is unavailable', () => {
    const page = {};

    assert.throws(
      () => getPageCdpSession(page as never),
      /Page CDP session is not available/,
    );
  });

  it('throws a clear error when the frame CDP session is unavailable', () => {
    const page = {
      mainFrame: () => ({id: 'main'}),
      _client: () => ({
        notSend: true,
      }),
    };

    const frame = {
      page: () => page,
    };

    assert.throws(
      () => getFrameCdpSession(frame as never),
      /Frame CDP session is not available/,
    );
  });
});
