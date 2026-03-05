/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'node:test';

const repoRoot = process.cwd();

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('reverse workflow docs', () => {
  it('documents task artifacts, local rebuild, and Codex workflow guidance', async () => {
    const readme = await readRepoFile('README.md');
    const reverseIndex = await readRepoFile('docs/reverse-task-index.md');
    const artifactsDoc = await readRepoFile('docs/reverse-artifacts.md');
    const codexDoc = await readRepoFile('docs/codex-reverse-workflow.md');
    const updatePromptTemplate = await readRepoFile('docs/reverse-update-prompt-template.md');
    const reverseReportTemplate = await readRepoFile('docs/reverse-report-template.md');
    const algorithmUpgradeTemplate = await readRepoFile('docs/algorithm-upgrade-template.md');
    const toolReference = await readRepoFile('docs/tool-reference.md');
    const outputContract = await readRepoFile('skills/mcp-js-reverse-playbook/references/output-contract.md');

    assert.ok(readme.includes('task artifact'));
    assert.ok(readme.includes('local rebuild'));
    assert.ok(reverseIndex.includes('export_rebuild_bundle'));
    assert.ok(reverseIndex.includes('record_reverse_evidence'));
    assert.ok(artifactsDoc.includes('timeline.jsonl'));
    assert.ok(codexDoc.includes('Codex'));
    assert.ok(codexDoc.includes('Observe-first'));
    assert.ok(codexDoc.includes('env/entry.js'));
    assert.ok(readme.includes('reverse-update-prompt-template'));
    assert.ok(readme.includes('reverse-report-template'));
    assert.ok(codexDoc.includes('targetActionDescription'));
    assert.ok(codexDoc.includes('targetContext'));
    assert.ok(updatePromptTemplate.includes('first divergence'));
    assert.ok(updatePromptTemplate.includes('不要猜'));
    assert.ok(reverseReportTemplate.includes('目标接口与字段'));
    assert.ok(reverseReportTemplate.includes('task artifact'));
    assert.ok(algorithmUpgradeTemplate.includes('first divergence'));
    assert.ok(algorithmUpgradeTemplate.includes('targetFunctionNames'));
    assert.ok(algorithmUpgradeTemplate.includes('env rebuild'));
    assert.ok(toolReference.includes('targetActionDescription'));
    assert.ok(toolReference.includes('targetFunctionNames'));
    assert.ok(outputContract.includes('targetContext'));
    assert.ok(outputContract.includes('targetActionDescription'));
  });
});
