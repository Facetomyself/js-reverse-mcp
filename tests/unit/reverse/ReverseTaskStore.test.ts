/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, it} from 'node:test';

import {ReverseTaskStore} from '../../../src/reverse/ReverseTaskStore.js';

describe('ReverseTaskStore', () => {
  it('creates and reopens a reverse task with durable JSON and JSONL artifacts', async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), 'js-reverse-task-store-'));

    try {
      const store = new ReverseTaskStore({rootDir});
      const task = await store.openTask({
        taskId: '20260304-demo-task',
        slug: 'demo-task',
        targetUrl: 'https://example.com/app.js',
        goal: 'rebuild signature flow',
      });

      await task.appendTimeline({
        stage: 'observe',
        action: 'new_page',
        status: 'ok',
      });
      await task.writeSnapshot('cookies.json', {
        cookies: [
          {
            name: 'sessionid',
            value: 'abc123',
          },
        ],
      });

      const reopened = await store.openTask({
        taskId: '20260304-demo-task',
        slug: 'demo-task',
        targetUrl: 'https://example.com/app.js',
        goal: 'rebuild signature flow',
      });
      await reopened.appendTimeline({
        stage: 'capture',
        action: 'create_hook',
        status: 'ok',
      });

      const taskJson = JSON.parse(
        await readFile(path.join(rootDir, '20260304-demo-task', 'task.json'), 'utf8'),
      );
      assert.strictEqual(taskJson.taskId, '20260304-demo-task');
      assert.strictEqual(taskJson.slug, 'demo-task');
      assert.strictEqual(taskJson.targetUrl, 'https://example.com/app.js');
      assert.strictEqual(taskJson.goal, 'rebuild signature flow');

      const cookiesJson = JSON.parse(
        await readFile(path.join(rootDir, '20260304-demo-task', 'cookies.json'), 'utf8'),
      );
      assert.deepStrictEqual(cookiesJson, {
        cookies: [
          {
            name: 'sessionid',
            value: 'abc123',
          },
        ],
      });

      const timelineLines = (
        await readFile(path.join(rootDir, '20260304-demo-task', 'timeline.jsonl'), 'utf8')
      )
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));

      assert.strictEqual(timelineLines.length, 2);
      assert.strictEqual(timelineLines[0].stage, 'observe');
      assert.strictEqual(timelineLines[0].action, 'new_page');
      assert.strictEqual(timelineLines[1].stage, 'capture');
      assert.strictEqual(timelineLines[1].action, 'create_hook');
      assert.ok(typeof timelineLines[0].timestamp === 'number');
      assert.ok(typeof timelineLines[1].timestamp === 'number');
    } finally {
      await rm(rootDir, {recursive: true, force: true});
    }
  });
});
