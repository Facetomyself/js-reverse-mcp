/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {CDPSession, Frame, Page} from './third_party/index.js';

type PageWithInternalClient = Page & {
  _client?: () => CDPSession;
};

type FrameWithPublicClient = Frame & {
  client?: CDPSession;
};

function isCdpSession(value: unknown): value is CDPSession {
  return typeof value === 'object' && value !== null && 'send' in value;
}

export function getPageCdpSession(page: Page): CDPSession {
  const candidate = (page as PageWithInternalClient)._client?.();
  if (isCdpSession(candidate)) {
    return candidate;
  }
  throw new Error('Page CDP session is not available');
}

export function getFrameCdpSession(frame: Frame): CDPSession {
  const candidate = (frame as FrameWithPublicClient).client;
  if (isCdpSession(candidate)) {
    return candidate;
  }

  const page = frame.page();
  if (frame === page.mainFrame()) {
    return getPageCdpSession(page);
  }

  throw new Error('Frame CDP session is not available');
}
