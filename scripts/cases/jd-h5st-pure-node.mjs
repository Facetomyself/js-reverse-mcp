function printGuide() {
  console.log(`JD h5st Node Case Skeleton

This file is intentionally non-runnable as a full solution.
It only defines the execution checklist to avoid leaking reusable logic.

Checklist:
1) Prepare sanitized capture input (no real cookie/token/storage values).
2) Build minimal VM browser-like context from schema only.
3) Load target security script URL in vm.
4) Call site-specific sign entry with current request payload shape.
5) Send exactly one verification request and record status/body preview.
6) Record first divergence and stop.

References:
- skills/mcp-js-reverse-playbook/references/cases/case-signature-node-template.md
- skills/mcp-js-reverse-playbook/references/cases/case-h5st-node-env.md
`);
}

printGuide();
