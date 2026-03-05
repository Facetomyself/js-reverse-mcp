# Case 安全规范

更新时间：2026-03-05

## 目标
- 约束仓库内 `scripts/cases/*` 仅保留抽象方法，不存放可直接复用的完整逆向/签名实现。
- 降低被直接滥用的法律与合规风险。

## 强制规则
1. 仓库内 case 文件必须是“不可运行抽象模板”。
2. 仓库内 case 只允许包含：
- 输入契约（字段名、类型、格式）
- 复现流程（Observe/Capture/Rebuild/Verify）
- 验证口径（状态码、结构、差异判定）
- 风险边界（脱敏、禁提交项）
3. 仓库内 case 禁止包含：
- 完整可执行签名链路代码
- 真实 cookie/token/storage 原文
- 固定可复用的生产参数组合
- 可直接调用线上接口的一键脚本

## 本地执行约定
- 可执行代码与完整链路产物统一放在本地任务目录（按参数/任务拆分）：
  - `artifacts/tasks-local/<task-id>/`
- 推荐目录结构：
  - `task.json`（目标与边界）
  - `runtime-evidence.jsonl`（关键证据）
  - `env/`（补环境脚本）
  - `run/`（可执行脚本与运行日志）
  - `report.md`（结果与 first divergence）
- `artifacts/tasks-local/` 默认 `.gitignore`，不得提交。

## 复用优先级
1. 优先读取 `artifacts/tasks-local/<task-id>/`（完整本地链路）。
2. 若不存在对应 task，再读取 `scripts/cases/*` 抽象 case。
3. 若仍无参考，按方法论模板新建任务并沉淀到 `artifacts/tasks-local/`。

## 评审清单
- 该 case 是否在仓库内可直接运行？
- 是否出现真实敏感值？
- 是否提供了可直接复用的完整算法实现？
- 是否仅保留抽象流程与验收标准？

任何一项不满足，视为不合规，需要回退为抽象模板后再合入。
