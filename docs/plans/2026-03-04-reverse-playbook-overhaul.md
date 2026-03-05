# Reverse Playbook Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an evidence-first reverse-engineering workflow for Codex, Claude, and Gemini that supports browser observation, durable task logging, local environment rebuild, and later deobfuscation work.

**Architecture:** Add task-aware reverse artifacts and bridge tools in the MCP layer, then rewrite the reverse skill and supporting docs around a staged workflow: Observe, Capture, Rebuild, Patch, and DeepDive. Keep the implementation incremental, test-driven, and centered on signature-generation tasks.

**Tech Stack:** TypeScript, Node.js built-in test runner, MCP server tooling, markdown-based skills and docs.

---

### Task 1: Add Reverse Task Artifact Model

**Files:**
- Create: `src/reverse/ReverseTaskStore.ts`
- Create: `tests/unit/reverse/ReverseTaskStore.test.ts`
- Modify: `src/McpContext.ts`
- Modify: `src/tools/runtime.ts`
- Modify: `src/types/index.ts`

**Step 1: Write the failing test**

Add tests covering:

- create task directory metadata from task id and slug
- append JSONL entries for timeline and evidence logs
- save structured JSON snapshots such as cookies or task metadata
- reopen the same task and preserve previous records

Include a temporary directory fixture so the test does not write into the real repository artifact path.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/reverse/ReverseTaskStore.test.js`

Expected: FAIL because `ReverseTaskStore` does not exist yet.

**Step 3: Write minimal implementation**

Implement a reverse task store that:

- creates `artifacts/tasks/<taskId>/`
- writes `task.json`
- appends JSON lines to named `*.jsonl` files
- writes JSON snapshots to named files
- exposes helpers for timeline, network, scripts, runtime evidence, and cookies

Wire the store into runtime access so reverse tools can obtain it without ad hoc file logic.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/reverse/ReverseTaskStore.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add src/reverse/ReverseTaskStore.ts tests/unit/reverse/ReverseTaskStore.test.ts src/McpContext.ts src/tools/runtime.ts src/types/index.ts
git commit -m "feat: add reverse task artifact store"
```

### Task 2: Add Task-Aware Evidence Recording Tools

**Files:**
- Create: `tests/unit/tools/reverse-task-tools.test.ts`
- Modify: `src/tools/analyzer.ts`
- Modify: `src/tools/hook.ts`
- Modify: `src/tools/network.ts`
- Modify: `src/tools/script.ts`
- Modify: `src/tools/ToolRegistry.ts`
- Modify: `src/main.ts`

**Step 1: Write the failing test**

Add tests for new and updated behavior:

- `record_reverse_evidence` appends structured evidence into the active task
- reverse-oriented tools can optionally attach `taskId`
- `get_hook_data` summary output includes replay-oriented fields without breaking old behavior
- `analyze_target` or a nearby analysis tool emits `recommendedNextSteps`, `whyTheseSteps`, and `stopIf`

Mock the runtime layer rather than invoking a real browser session.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/tools/reverse-task-tools.test.js`

Expected: FAIL because the new tool and enriched output contract are not implemented.

**Step 3: Write minimal implementation**

Implement:

- `record_reverse_evidence`
- task-aware optional parameters on selected reverse tools
- enriched output structures for target analysis and hook summaries

Keep backward-compatible text blocks while adding structured JSON fields that LLMs can use.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/tools/reverse-task-tools.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/tools/reverse-task-tools.test.ts src/tools/analyzer.ts src/tools/hook.ts src/tools/network.ts src/tools/script.ts src/tools/ToolRegistry.ts src/main.ts
git commit -m "feat: add task-aware reverse evidence tools"
```

### Task 3: Add Local Rebuild Bridge Tools

**Files:**
- Create: `src/tools/rebuild.ts`
- Create: `tests/unit/tools/rebuild.test.ts`
- Modify: `src/main.ts`
- Modify: `src/tools/categories.ts`
- Modify: `src/tools/ToolRegistry.ts`
- Modify: `docs/tool-reference.md`

**Step 1: Write the failing test**

Add tests for:

- `export_rebuild_bundle` writing `env/entry.js`, `env/env.js`, `env/polyfills.js`, `env/capture.json`, and `report.md` scaffolding into the active task
- `diff_env_requirements` converting local runtime failures plus captured evidence into a prioritized patch list

Use a fixture task directory and deterministic input payloads.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/tools/rebuild.test.js`

Expected: FAIL because rebuild bridge tools do not exist.

**Step 3: Write minimal implementation**

Implement `src/tools/rebuild.ts` with:

- `export_rebuild_bundle`
- `diff_env_requirements`

Register the tools and update generated docs after implementation.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/tools/rebuild.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add src/tools/rebuild.ts tests/unit/tools/rebuild.test.ts src/main.ts src/tools/categories.ts src/tools/ToolRegistry.ts docs/tool-reference.md
git commit -m "feat: add rebuild bridge tools"
```

### Task 4: Rewrite the Reverse Skill Around the Approved Workflow

**Files:**
- Modify: `skills/mcp-js-reverse-playbook/SKILL.md`
- Modify: `skills/mcp-js-reverse-playbook/references/automation-entry.md`
- Modify: `skills/mcp-js-reverse-playbook/references/mcp-task-template.md`
- Modify: `skills/mcp-js-reverse-playbook/references/output-contract.md`
- Modify: `skills/mcp-js-reverse-playbook/references/fallbacks.md`
- Modify: `skills/mcp-js-reverse-playbook/references/tool-defaults.md`
- Create: `skills/mcp-js-reverse-playbook/references/task-artifacts.md`
- Create: `skills/mcp-js-reverse-playbook/references/local-rebuild.md`

**Step 1: Write the failing test**

Write a documentation contract test or repository assertion script that checks:

- the skill explicitly defines Observe, Capture, Rebuild, Patch, and DeepDive
- the skill states `Observe-first`, `Hook-preferred`, `Breakpoint-last`, and `Rebuild-oriented`
- the references mention task artifact outputs and local rebuild expectations

If adding a formal test is too heavyweight, add a small repository assertion under `tests/unit` that reads the markdown files and checks required phrases.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/skills/mcp-js-reverse-playbook.test.js`

Expected: FAIL because the current skill content is still the minimal index version.

**Step 3: Write minimal implementation**

Rewrite the skill and references so they:

- guide all three clients consistently
- prioritize signature-generation tasks
- require local logging and rebuild artifacts
- preserve browser observation before local reconstruction

**Step 4: Run test to verify it passes**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/skills/mcp-js-reverse-playbook.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add skills/mcp-js-reverse-playbook/SKILL.md skills/mcp-js-reverse-playbook/references/automation-entry.md skills/mcp-js-reverse-playbook/references/mcp-task-template.md skills/mcp-js-reverse-playbook/references/output-contract.md skills/mcp-js-reverse-playbook/references/fallbacks.md skills/mcp-js-reverse-playbook/references/tool-defaults.md skills/mcp-js-reverse-playbook/references/task-artifacts.md skills/mcp-js-reverse-playbook/references/local-rebuild.md tests/unit/skills/mcp-js-reverse-playbook.test.js
git commit -m "feat: rewrite reverse playbook skill"
```

### Task 5: Update Top-Level Documentation for Client Usage

**Files:**
- Modify: `README.md`
- Modify: `docs/reverse-task-index.md`
- Create: `docs/reverse-artifacts.md`
- Create: `docs/codex-reverse-workflow.md`

**Step 1: Write the failing test**

Add a documentation assertion test for:

- README mentions task artifacts and local rebuild workflow
- reverse task index points users to the new staged flow
- Codex workflow doc exists and mentions the rebuild path

**Step 2: Run test to verify it fails**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/docs/reverse-docs.test.js`

Expected: FAIL because the new docs are not present yet.

**Step 3: Write minimal implementation**

Update docs so users understand:

- how to run staged reverse tasks
- where artifacts are written
- how Codex should move from observation into local rebuild
- how to reuse task directories for later deobfuscation work

**Step 4: Run test to verify it passes**

Run: `npm run build && node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/docs/reverse-docs.test.js`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/reverse-task-index.md docs/reverse-artifacts.md docs/codex-reverse-workflow.md tests/unit/docs/reverse-docs.test.js
git commit -m "docs: document staged reverse workflow"
```

### Task 6: Verify Build, Docs, and Targeted Tests

**Files:**
- Modify: `docs/tool-reference.md` if regenerated changes occur
- Modify: any touched files required to fix failures discovered during verification

**Step 1: Run targeted verification**

Run:

```bash
npm run build
npm run docs
node --require ./build/tests/setup.js --no-warnings=ExperimentalWarning --test build/tests/unit/reverse/ReverseTaskStore.test.js build/tests/unit/tools/reverse-task-tools.test.js build/tests/unit/tools/rebuild.test.js build/tests/unit/skills/mcp-js-reverse-playbook.test.js build/tests/unit/docs/reverse-docs.test.js
```

Expected: all commands succeed

**Step 2: Fix any failures minimally**

If any verification step fails:

- fix the failing implementation or docs
- rerun only the failing command first
- rerun the full verification block after the local fix

**Step 3: Commit final verification fixes**

```bash
git add .
git commit -m "test: verify reverse workflow overhaul"
```

