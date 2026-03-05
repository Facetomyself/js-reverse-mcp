# JS Reverse Playbook Overhaul Design

**Date:** 2026-03-04

**Goal:** Rework the reverse-engineering workflow so Codex, Claude, and Gemini can use the MCP server predictably for browser observation, evidence capture, local environment rebuilding, and deeper deobfuscation. Prioritize Codex without making the workflow Codex-only.

## Problem Statement

The repository already exposes many reverse-engineering tools, but the current skill and documentation do not provide enough execution discipline for LLMs:

- The reverse skill is mostly an index of references instead of an executable operating procedure.
- Tool outputs do not consistently preserve task state, evidence lineage, or next-step cues.
- There is no durable local task artifact model, so important findings stay in transient model context.
- The preferred workflow for real work is not encoded: observe in the browser first, then rebuild locally, then deepen into deobfuscation or VMP analysis.

The result is that models know the tools exist but do not use them consistently or in the right order.

## Target Workflow

The default reverse workflow becomes:

1. Browser observation first
2. Minimal runtime capture second
3. Local Node rebuild third
4. Incremental environment patching fourth
5. Deep deobfuscation or VMP analysis last

This replaces a generic "Hook first" mindset with:

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`
- `Evidence-first`

## Design Principles

- Do not guess missing browser environment when it can be observed from MCP evidence.
- Every important step must write durable local artifacts.
- Tool usage must be explainable: if the model cannot justify the next tool, it should not call it.
- Runtime capture should stay minimal until the target path is proven relevant.
- The local rebuild path is the main deliverable for signature-generation scenarios.

## Section 1: Evidence-First Task Artifacts

Each reverse task should create a durable task directory such as:

`artifacts/tasks/<timestamp>-<slug>/`

Each task directory contains:

- `task.json`: task metadata, URL, target API, stage, status
- `timeline.jsonl`: ordered action log across browser, MCP, and local rebuild steps
- `network.jsonl`: matched requests, URL, method, status, payload summary, initiator
- `cookies.json`: observed cookies and changes
- `scripts.jsonl`: script URLs, script IDs, search hits, request relationships
- `runtime-evidence.jsonl`: hook hits, function samples, object snapshots
- `env/entry.js`: local Node reproduction entry
- `env/env.js`: staged environment shim
- `env/polyfills.js`: helper shims and polyfills
- `env/capture.json`: exported runtime observations for replay
- `report.md`: final human-readable report

Three relationships must be recorded explicitly:

- `request -> initiator -> script/function`
- `cookie/storage change -> request`
- `hook hit -> local env patch item`

This makes the workflow inspectable, resumable, and suitable for follow-up work by different models.

## Section 2: Skill Redesign

`skills/mcp-js-reverse-playbook` should be rewritten from a lightweight reference map into a staged operating procedure with hard execution rules.

The skill should define five phases:

### 1. Observe

Purpose:

- Determine the target request, candidate scripts, and suspicious function paths using browser-side evidence.

Default tools:

- `check_browser_health`
- `new_page` or `select_page`
- `analyze_target`
- `search_in_scripts`
- `list_network_requests`
- `get_request_initiator`

Exit condition:

- The task can identify which request matters and which script/function is most likely responsible.

### 2. Capture

Purpose:

- Collect the minimum runtime evidence needed to explain parameter generation.

Default tools:

- `create_hook`
- `inject_hook`
- `get_hook_data`
- function-level hook tools when needed

Rules:

- Prefer fetch/XHR hooks first.
- Expand scope only after proving the initial hook did not capture the target.
- Do not escalate to breakpoints unless hook data cannot expose the required context.

### 3. Rebuild

Purpose:

- Export a local Node reproduction bundle from observed page evidence.

Outputs:

- target JS
- dependency snippets
- runtime object snapshots
- cookie, storage, location, navigator, user-agent evidence
- request samples

Rules:

- The rebuild should be evidence-driven, not guess-driven.

### 4. Patch

Purpose:

- Incrementally patch missing environment pieces locally until the target function runs.

Method:

- Patch one missing capability at a time.
- Re-run after every change.
- Record every patch in the task artifact log.

Typical missing pieces:

- `window`
- `document`
- `navigator`
- `location`
- `crypto`
- `atob` and `btoa`
- storage
- timers
- `fetch` or `XMLHttpRequest`

### 5. DeepDive

Purpose:

- Use the now-runnable local code for AST deobfuscation, VMP tracing, and business-logic reduction.

Rules:

- This phase is optional when the task only needs a working signature path.
- This phase is primary when the user wants reusable offline understanding.

## Section 3: MCP Tooling and Output Changes

The server should evolve from a flat tool collection into a task-aware reverse workbench.

### A. Add task awareness

Introduce a task context model so reverse tools can optionally write into a shared task directory.

Examples:

- initialize or select a reverse task
- attach `taskId` to reverse outputs
- allow tools to append evidence directly

### B. Enrich existing outputs

Enhance current reverse and network tools to emit structured fields that are useful for orchestration:

- stable request IDs
- normalized URL patterns
- initiator script/function information
- related cookies and storage keys when known
- candidate environment requirements
- direct pointers from hook evidence to replay data

### C. Add bridge tools for local rebuild

Add focused bridge tools instead of many large new tools.

Recommended additions:

- `record_reverse_evidence`
  - append structured evidence to the active task directory
- `export_rebuild_bundle`
  - export scripts, request examples, object snapshots, and runtime observations into local rebuild artifacts
- `diff_env_requirements`
  - compare local runtime errors against captured browser evidence and suggest the next environment patch

### D. Add next-step guidance without over-automation

Analysis-style tools should provide:

- `recommendedNextSteps`
- `whyTheseSteps`
- `stopIf`

This helps Codex, Claude, and Gemini stay on-rail while preserving model judgment.

## Section 4: Client Strategy

The workflow should serve three clients:

- Codex: highest priority; optimize for local artifact generation and iterative environment patching
- Claude: maintain readable evidence and stage-driven instructions
- Gemini: preserve explicit task structure and local logs to reduce context drift

This means the main operational contract should live in repo-managed skill and documentation files, not only in client-local system prompts.

## Section 5: Repository and Delivery Strategy

Work should be performed in a real git clone on a feature branch, not in an exported directory without `.git`.

Recommended branch:

- `feat/reverse-playbook-overhaul`

Delivery strategy:

1. Commit the design doc
2. Implement the skill overhaul and supporting docs
3. Add MCP task-artifact support and bridge tools
4. Add tests for task logging and local bundle export
5. Verify build and targeted tests
6. Push the feature branch to GitHub

## Risks

- Over-automating the workflow can make the tools rigid on unusual targets.
- Large raw evidence dumps can become noisy unless summaries and caps are enforced.
- Local rebuild support can drift if browser evidence export is incomplete.
- Different client prompting styles may still require minor provider-specific wording.

## Validation Strategy

Success should be checked against a realistic signature-generation task:

1. Open a target page
2. Identify the target request and relevant script
3. Capture enough runtime evidence to explain the parameter path
4. Export a local rebuild bundle
5. Patch the environment incrementally until Node can execute the target path
6. Produce a report with evidence links, replay artifacts, and residual uncertainty

## Out of Scope for the First Pass

- Full automatic browser-to-Node conversion for arbitrary SPAs
- One-click universal deobfuscation
- Provider-specific client plugins outside repository documentation and skills
