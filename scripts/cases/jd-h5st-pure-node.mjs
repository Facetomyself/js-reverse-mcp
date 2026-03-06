function printAbstractCaseGuide() {
  console.log(`Case: 某东 h5st 参数
Category: 参数签名
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

JD h5st Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It maps the generic MCP workflow to the JD \`h5st\` reconstruction path.

Target:
- api_host_b64: \`aHR0cHM6Ly9hcGkubS5qZC5jb20vYXBp\`
- field: \`h5st\`
- companion fields: \`appid/functionId/body/_stk/_ste/x-api-eid-token\`
- note: decode Base64 before use

Tool workflow mapping:
1) Find the target request:
   - First use: \`list_network_requests\`
   - Then use: \`get_network_request\`
   - Collect:
     one successful request carrying \`h5st\` and its companion fields.
   - Output:
     one baseline browser sample and one stable request contract.

2) Confirm initiator chain:
   - First use: \`get_request_initiator\`
   - Then use: \`list_scripts\`, \`get_script_source\`
   - Collect:
     business caller, runtime wrapper, signer module URL, function names.
   - Expected chain example:
     request builder -> signer wrapper -> \`ParamsSignMain.sign(...)\`.
   - Output:
     one stable caller stack for the signed request.

3) Capture the write point of \`h5st\`:
   - First use: \`hook_function\` / \`create_hook\`
   - Recommended hooks:
     signer entry,
     \`fetch\`,
     \`XMLHttpRequest.prototype.open\`,
     \`XMLHttpRequest.prototype.send\`
   - Then use: \`get_hook_data\`
   - Collect:
     signer arguments, payload ordering, encoded field shape, final request position of \`h5st\`.
   - Output:
     one confirmed sign entry and one confirmed field placement.

4) Confirm source correlation:
   - First use: \`search_in_sources\`
   - Then use: \`get_script_source\`, \`collect_code\`
   - Collect:
     signer body, \`_stk\` field ordering logic, date/time source, token dependency.
   - Output:
     one local rebuild chain description:
     business payload -> signer entry -> canonical field ordering -> \`h5st\` output.

5) Record evidence:
   - First use: \`record_reverse_evidence\`
   - Record:
     request sample, initiator, signer entry, required fields, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/location/storage/canvas/crypto/Date\`
   - Do not guess the whole browser.
   - Output:
     one local harness that can start the signer module.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     missing browser primitives, crypto/date helpers, canvas or storage reads.
   - Patch rule:
     one gap per loop.
   - Output:
     one first divergence note per patch iteration.

8) Extract local API:
   - Goal surface:
     \`genH5st(input)\` or equivalent signer function.
   - Required output contract:
     segment count, field order dependency, required input list.
   - Output:
     one callable local signer API.

9) Export a single-file runtime:
   - Goal file:
     \`run/exported-runtime.js\`
   - Goal constraints:
     inline required capture and signer scripts,
     no external file reads,
     one entry such as \`genH5st(input)\`.
   - Output:
     one self-contained Node single-file runtime and one minimal \`test.js\`.

10) Verify server-side acceptance:
    - Compare:
      no-sign / fake-sign / captured-valid-sign / generated-sign.
    - Verify:
      HTTP status, business status code, response body preview, expected schema keys.
    - Output:
      one pass/fail conclusion for generated \`h5st\`.

11) Drift recovery:
    - When scripts drift, rerun:
      request discovery -> initiator -> signer hook -> source correlation -> local patch.
    - Watch:
      signer module URL, function names, field order contract, token dependency.

Acceptance criteria:
- Browser-side evidence includes at least one signed request carrying \`h5st\`.
- One initiator chain is confirmed from request back to signer entry.
- One local signer API can generate non-empty \`h5st\`.
- One generated request matches expected field contract and passes server verification.
- One first divergence note exists for each failed rebuild iteration.

Repository boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie/token/storage bundles or reusable signer code here.

References:
- scripts/cases/mcp-reverse-pure-node-workflow.mjs
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseGuide();
