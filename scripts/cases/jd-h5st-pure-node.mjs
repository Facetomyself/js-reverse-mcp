function printAbstractCaseGuide() {
  console.log(`JD h5st Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It only defines the method and acceptance criteria to reduce legal/compliance risk.

Required workflow:
1) Target request identification:
   - Look for `api.m.jd.com/api` requests carrying `h5st` (often in query).
   - Capture companion fields: `appid/functionId/body/_stk/_ste/x-api-eid-token`.
2) Generation chain confirmation:
   - Trace initiator and confirm sign entry (commonly `ParamsSignMain.sign(...)`).
   - Verify which request payload fields are included in `_stk`.
3) Runtime capture plan (no secrets):
   - Hook network (`fetch` / `XMLHttpRequest`) and sign entry call path.
   - Record only schema/shape: field names, ordering, encoding, segment counts.
4) Local rebuild plan:
   - Enumerate env dependencies (`window/document/navigator/storage/canvas/crypto/Date`).
   - Patch one capability at a time and retest.
5) Single verification loop:
   - Send one request with generated `h5st`, record status/body preview.
   - Record first divergence and next patch action.
6) Repository boundary:
   - Keep this file abstract (workflow + acceptance criteria only).
   - Put executable scripts only in `artifacts/tasks-local/<task-id>/run/`.

Output contract:
- signing field shape (e.g. segment count)
- required input fields list
- env dependencies checklist
- verification criteria
- first divergence note

Security constraints:
- No real cookie/token/storage raw values in repository.
- No complete reusable signing script in repository.
- No fixed production parameter bundle in repository.

Local-only implementation path (gitignored):
- artifacts/tasks-local/<task-id>/

References:
- skills/mcp-js-reverse-playbook/references/cases/case-signature-node-template.md
- skills/mcp-js-reverse-playbook/references/cases/case-h5st-node-env.md
- docs/case-safety-policy.md
`);
}

printAbstractCaseGuide();
