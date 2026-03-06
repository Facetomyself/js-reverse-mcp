# MCP Case Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `scripts/cases/` 增加一个通用 MCP 工具工作流 abstract-case，并把某音 `a_bogus` case 重写成“工具顺序 + 目标产物”版，方便后续快速复用。

**Architecture:** 保持 `scripts/cases/` 的 abstract-case 边界，不提交可执行实现。新增一个通用 workflow case 负责描述 MCP 工具顺序、每步输入输出和下一步判定；再将 `douyin-a-bogus-pure-node.mjs` 改写成把这套通用工作流映射到本次实战目标。最后更新 `scripts/cases/README.md` 索引。

**Tech Stack:** Node.js `.mjs` 文本脚本、仓库现有 `scripts/cases/` abstract-case 风格、MCP 工具命名约定。

---

### Task 1: 新增通用 MCP 工作流 case

**Files:**
- Create: `scripts/cases/mcp-reverse-pure-node-workflow.mjs`

**Step 1: 编写 abstract-case 文本骨架**
- 写明 `Status: abstract-case`、`Scope: non-runnable`
- 说明这是“工具顺序 + 产物要求”模板

**Step 2: 写入工具顺序与产物**
- 请求识别：`list_network_requests` / `get_network_request`
- 调用栈：`get_request_initiator`
- 参数写入：`hook_function` / `create_hook` / `get_hook_data`
- 源码定位：`collect_code` / `search_in_sources`
- 页面证据沉淀：`record_reverse_evidence`
- 本地重建：`artifacts/tasks/<task-id>/run/`
- 验证：服务端验证 / first divergence / drift 复查

**Step 3: 本地运行脚本做文案 smoke**
- Run: `node scripts/cases/mcp-reverse-pure-node-workflow.mjs`
- Expected: 正常打印 case 文本

### Task 2: 重写 douyin case 为工具顺序版

**Files:**
- Modify: `scripts/cases/douyin-a-bogus-pure-node.mjs`

**Step 1: 保留 abstract-case 边界**
- 保留 `non-runnable` 与安全边界说明

**Step 2: 写入本次实战映射**
- 明确目标请求：`/aweme/v1/web/solution/resource/list/`
- 明确工具顺序：请求 -> initiator -> hook 写点 -> 源码定位 -> 本地补环境 -> 单文件导出 -> 服务端验证
- 明确每步产物：请求样本、栈、写入点、脚本 URL、capture、first divergence、`genABogus`、单文件导出

**Step 3: 本地运行脚本做文案 smoke**
- Run: `node scripts/cases/douyin-a-bogus-pure-node.mjs`
- Expected: 正常打印 case 文本

### Task 3: 更新 cases 索引

**Files:**
- Modify: `scripts/cases/README.md`

**Step 1: 新增通用 workflow case 索引**
- 在索引中加入通用 case
- 一句话说明用途：先看工具顺序，再看站点映射

**Step 2: 做最终验证**
- Run: `node scripts/cases/mcp-reverse-pure-node-workflow.mjs && node scripts/cases/douyin-a-bogus-pure-node.mjs`
- Expected: 两个脚本都正常输出
