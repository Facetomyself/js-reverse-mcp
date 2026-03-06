function printAbstractCaseGuide() {
  console.log(`Case: 某音 a-bogus 参数
Category: 参数签名
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

Douyin a_bogus Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It maps the generic MCP workflow to the Douyin \`a_bogus\` reconstruction path.

Target:
- entry_url_b64: \`aHR0cHM6Ly93d3cuZG91eWluLmNvbS9zZWFyY2gvMQ==\`
- api: \`GET /aweme/v1/web/solution/resource/list/\`
- field: \`a_bogus\`
- note: decode Base64 before use

Tool workflow mapping:
1) Find the target request:
   - First use: \`list_network_requests\`
   - Then use: \`get_network_request\`
   - Collect:
     one successful request carrying
     \`spot_keys/app_id/version_code/webid/msToken/.../a_bogus\`
   - Output:
     one baseline browser sample with \`status_code=0\`.

2) Confirm initiator chain:
   - First use: \`get_request_initiator\`
   - Then use: \`list_scripts\`, \`get_script_source\`
   - Collect:
     business entry, runtime wrapper, security script URLs.
   - Expected chain example:
     business entry -> runtime.js -> sdk-glue.js -> secsdk-lastest.umd.js -> bdms.js.
   - Output:
     one stable caller stack for the resource-list request.

3) Capture the write point of \`a_bogus\`:
   - First use: \`hook_function\` / \`create_hook\`
   - Recommended hooks:
     \`URLSearchParams.prototype.append\`,
     \`URLSearchParams.prototype.set\`,
     \`XMLHttpRequest.prototype.open\`,
     \`XMLHttpRequest.prototype.send\`
   - Then use: \`get_hook_data\`
   - Collect:
     stack frame when \`a_bogus\` is written,
     whether it is appended before send or during send.
   - Expected write point:
     \`URLSearchParams.append('a_bogus', value)\`.

4) Confirm source correlation:
   - First use: \`search_in_sources\`
   - Then use: \`get_script_source\`, \`collect_code\`
   - Collect:
     exact source file or bundle segment containing the write chain.
   - Expected result:
     \`bdms.js: d -> X -> XMLHttpRequest.n\`.
   - Output:
     one local rebuild chain description:
     business request -> security loader -> bdms send-time patch.

5) Record evidence:
   - First use: \`record_reverse_evidence\`
   - Record:
     target request sample, initiator, write point, script URLs, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/location/history/screen/storage/crypto/fetch/XMLHttpRequest\`
   - Do not guess the whole browser.
   - Output:
     one local harness that can start \`sdk-glue\` and \`bdms\`.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     first missing env path, host getter crash, or missing function shell.
   - Patch rule:
     one gap per loop.
   - This project’s key lesson:
     do not proxy-wrap brand-sensitive native objects like \`URL\` directly.
     If \`location\` is implemented as \`Proxy(URL)\`, reads like
     \`location.href\` / \`location.toJSON()\` may crash with native brand checks.
   - Output:
     one first divergence note per patch iteration.

8) Extract local API:
   - Goal surface:
     \`genABogus(pathQuery)\`
   - Optional debug surface:
     final URL, XHR log, env log.
   - Output:
     one callable local signer API.

9) Export a single-file runtime:
   - Goal file:
     \`run/exported-runtime.js\`
   - Goal constraints:
     inline capture + security scripts,
     no external file reads,
     one entry: \`await globalThis.genABogus(pathQuery)\`.
   - Output:
     one self-contained Node single-file runtime and one minimal \`test.js\`.

10) Verify server-side acceptance:
    - Compare:
      no-sign / captured-valid-sign / generated-sign.
    - Verify:
      \`HTTP 200\`, \`status_code=0\`, expected response keys.
    - Output:
      one pass/fail conclusion for generated \`a_bogus\`.

11) Drift recovery:
    - When scripts drift, rerun:
      request discovery -> initiator -> write-point hook -> source correlation -> local patch.
    - Watch files:
      \`sdk-glue.js\`, \`secsdk-lastest.umd.js\`, \`bdms.js\`.

Acceptance criteria:
- Browser-side evidence includes at least one \`a_bogus\` append event with stack.
- One initiator chain is confirmed from request back to security scripts.
- Local Node harness can make the send-time patch path run.
- Exported local API can generate non-empty \`a_bogus\`.
- One generated request returns \`HTTP 200\` and \`status_code=0\`.

Repository boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie bundles or reusable production signer code here.

References:
- scripts/cases/mcp-reverse-pure-node-workflow.mjs
- docs/reference/env-patching.md
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseGuide();
