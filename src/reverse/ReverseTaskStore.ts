import {appendFile, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

import type {
  ReverseTaskDescriptor,
  ReverseTaskEvent,
  ReverseTaskHandle,
  ReverseTaskOpenInput,
  ReverseTaskStoreOptions,
} from '../types/index.js';

function nowTimestamp(): number {
  return Date.now();
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readExistingDescriptor(taskFilePath: string): Promise<ReverseTaskDescriptor | undefined> {
  if (!(await pathExists(taskFilePath))) {
    return undefined;
  }
  const raw = await readFile(taskFilePath, 'utf8');
  return JSON.parse(raw) as ReverseTaskDescriptor;
}

async function writeJsonFile(targetPath: string, value: unknown): Promise<void> {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export class ReverseTaskStore {
  readonly rootDir: string;

  constructor(options: ReverseTaskStoreOptions = {}) {
    this.rootDir = options.rootDir ?? path.join(process.cwd(), 'artifacts', 'tasks');
  }

  async openTask(input: ReverseTaskOpenInput): Promise<ReverseTaskHandle> {
    const taskDir = path.join(this.rootDir, input.taskId);
    await mkdir(taskDir, {recursive: true});

    const taskFilePath = path.join(taskDir, 'task.json');
    const existing = await readExistingDescriptor(taskFilePath);
    const descriptor: ReverseTaskDescriptor = existing ?? {
      taskId: input.taskId,
      slug: input.slug,
      targetUrl: input.targetUrl,
      goal: input.goal,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    };

    if (existing) {
      descriptor.updatedAt = nowTimestamp();
    }

    await writeJsonFile(taskFilePath, descriptor);

    return {
      taskId: descriptor.taskId,
      taskDir,
      descriptor,
      appendTimeline: async (event: ReverseTaskEvent) => {
        await this.appendJsonLine(path.join(taskDir, 'timeline.jsonl'), {
          timestamp: nowTimestamp(),
          ...event,
        });
        descriptor.updatedAt = nowTimestamp();
        await writeJsonFile(taskFilePath, descriptor);
      },
      appendLog: async (name: string, value: Record<string, unknown>) => {
        await this.appendJsonLine(path.join(taskDir, `${name}.jsonl`), {
          timestamp: nowTimestamp(),
          ...value,
        });
        descriptor.updatedAt = nowTimestamp();
        await writeJsonFile(taskFilePath, descriptor);
      },
      writeSnapshot: async (name: string, value: unknown) => {
        await writeJsonFile(path.join(taskDir, name), value);
        descriptor.updatedAt = nowTimestamp();
        await writeJsonFile(taskFilePath, descriptor);
      },
    };
  }

  private async appendJsonLine(targetPath: string, value: Record<string, unknown>): Promise<void> {
    await appendFile(targetPath, `${JSON.stringify(value)}\n`, 'utf8');
  }
}
