function printAbstractCaseGuide() {
  console.log(`Case: 某手 falcon 风控参数
Category: 风控参数
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

Kuaishou __NS_hxfalcon Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It maps the generic MCP workflow to the Kuaishou \`__NS_hxfalcon\` reconstruction path.

Target:
- entry_url_b64: \`aHR0cHM6Ly9rdGFnNm5yOTMubS5jaGVuemhvbmd0ZWNoLmNvbS9mdy90YWcvdGV4dD9jYz1zaGFyZV9jb3B5bGluayZrcGY9QU5EUk9JRF9QSE9ORSZmaWQ9MTk2NjQwNTA1MSZzaGFyZU1ldGhvZD10b2tlbiZrcG49S1VBSVNIT1Umc3ViQml6PVRFWFRfVEFHJnJpY2g9dHJ1ZSZzaGFyZUlkPTE4NjM3ODA4NDgzOTcxJnNoYXJlVG9rZW49WDVCOE12SXJKYjNNMXQwJnRhZ05hbWU9amsmc2hhcmVUeXBlPTcmc2hhcmVNb2RlPWFwcCZhcHBUeXBlPTIxJnNoYXJlT2JqZWN0SWQ9amsmdGltZXN0YW1wPTE3NjExMTA3ODI5MDk=\`
- note: decode Base64 before use
- weak-check sample: \`/rest/wd/kconf/get\`
- strict-check sample: \`/rest/wd/ugH5App/tag/text/feed/recent\`
- field: \`__NS_hxfalcon\`
- note: do NOT judge success by HTTP 200 only.

Tool workflow mapping:
1) Find weak-check and strict-check requests:
   - First use: \`list_network_requests\`
   - Then use: \`get_network_request\`
   - Collect:
     one weak-check sample and one strict-check sample, both with response body preview.
   - Output:
     one baseline pair for later A/B verification.

2) Confirm initiator chain:
   - First use: \`get_request_initiator\`
   - Then use: \`list_scripts\`, \`get_script_source\`
   - Collect:
     runtime VM entry, encoder call site, cat-version retrieval path.
   - Expected chain example:
     business payload -> VM bridge -> \`Ee.call("$encode", ...)\`.
   - Output:
     one stable caller stack for the falcon sign path.

3) Capture write point and VM interaction:
   - First use: \`hook_function\` / \`create_hook\`
   - Recommended hooks:
     VM bridge call site,
     \`fetch\`,
     \`XMLHttpRequest.prototype.open\`,
     \`XMLHttpRequest.prototype.send\`
   - Then use: \`get_hook_data\`
   - Collect:
     payload before encode, callback wiring, cat-version reads, final request send timing.
   - Output:
     one confirmed sign call shape and one confirmed request patch timing.

4) Confirm source correlation:
   - First use: \`search_in_sources\`
   - Then use: \`get_script_source\`, \`collect_code\`
   - Collect:
     VM object capability, loader order, encoder adapter, strict-check and weak-check path differences.
   - Expected capability example:
     VM object contains methods like \`eval/run/call/createFiber\`.
   - Output:
     one local rebuild chain description:
     business payload -> VM bridge -> encode runtime -> \`__NS_hxfalcon\`.

5) Record evidence:
   - First use: \`record_reverse_evidence\`
   - Record:
     weak/strict request pair, VM call shape, cat-version source, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/storage/performance\`
   - Load local runtime module and verify signer object availability.
   - Output:
     one local harness that can call the falcon encoder.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     missing VM host methods, storage/performance reads, callback or bridge mismatches.
   - Patch rule:
     one gap per loop.
   - Output:
     one first divergence note per patch iteration.

8) Extract local API:
   - Goal surface:
     \`genFalcon(payload)\` or equivalent encoder function.
   - Required output:
     one sign for weak-check payload and one sign for strict-check payload.
   - Output:
     one callable local signer API.

9) Export a single-file runtime:
   - Goal file:
     \`run/exported-runtime.js\`
   - Goal constraints:
     inline required capture and runtime scripts,
     no external file reads,
     one entry such as \`genFalcon(payload)\`.
   - Output:
     one self-contained Node single-file runtime and one minimal \`test.js\`.

10) Verify server-side acceptance:
    - Compare:
      no-sign / fake-sign / captured-valid-sign / generated-sign.
    - Verify weak-check:
      \`result=1\` may not be strict enough alone.
    - Verify strict-check:
      real sign should return \`result=1\` and \`hasData=true\`.
    - Output:
      one pass/fail conclusion based on strict-check API.

11) Equality check and drift recovery:
    - Compare Node response body shape with MCP-captured browser response.
    - Allow gateway host-name drift, focus on business keys under \`data\`.
    - When scripts drift, rerun:
      request discovery -> initiator -> VM hook -> source correlation -> local patch.

Acceptance criteria:
- One weak-check sample and one strict-check sample are preserved.
- One VM call shape for \`$encode\` is confirmed.
- One local signer API can generate candidate \`__NS_hxfalcon\` values.
- Strict-check API with generated sign returns \`result=1\` and \`hasData=true\`.
- One first divergence note exists for each failed rebuild iteration.

Failure classification:
- \`UND_ERR_CONNECT_TIMEOUT\`: network path issue, not signing logic issue.
- \`result=50\` or sign-fail message on strict API: signing chain not fully reconstructed.

Repository boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie/token bundles or reusable signer code here.

References:
- scripts/cases/mcp-reverse-pure-node-workflow.mjs
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseGuide();
