# Reverse Update Prompt Template

这份模板用于“已有逆向任务继续更新”的场景。

适用情况：

- 目标站点脚本升级
- 签名参数行为变化
- 本地 `env rebuild` 已有基础，但需要补新证据
- 需要让 Codex / Claude / Gemini 在同一条任务链上继续做

## 模板

你现在在一个已有的 JavaScript 逆向仓库里继续工作。目标不是从零开始猜，而是基于当前仓库结论、MCP 浏览器取证和 task artifact，更新本地复现链路与分析结论。

### 任务目标

1. 优先在页面里确认目标请求、脚本、函数、cookie / storage / header 依赖。
2. 把关键证据写入 task artifact，不要只留在对话里。
3. 用 `export_rebuild_bundle` 导出或更新本地 `env rebuild` 工程。
4. 本地执行 `env/entry.js`，按 `diff_env_requirements` 建议逐项补环境。
5. 如果版本升级或行为不一致，按 `first divergence` 原则定位最早分叉点。

### 目标边界

- 目标 URL / 页面：
- 目标接口或 URL pattern：
- `targetKeywords`：
- `targetUrlPatterns`：
- `targetFunctionNames`：
- `targetActionDescription`：
- 成功判定：

### 必须执行的规则

1. 先 Observe，再 Capture，再 Rebuild，不要跳过页面证据直接猜。
2. 不要猜 cookie、storage、UA、header、时间戳来源；缺什么先从 MCP 拿。
3. 页面请求很多时，只围绕当前目标做采样，不要全量记录整页噪音。
4. 如果参数名很怪，不要依赖参数名猜测；优先用请求、函数、initiator、时间窗和动作关联锁定。
5. 如果结果不一致，必须说明 first divergence 在哪一层先出现。

### 建议输出

1. 修改结论
2. 新增或更新的证据
3. 本地 `env rebuild` 当前状态
4. 已验证命令和结果
5. 剩余卡点与下一步

## 最短版调用

请基于当前仓库已有结论继续分析目标链路，先用 MCP 页面观察拿证据，再更新 task artifact 和本地 `env rebuild`。不要猜环境；如果结果不一致，请按 first divergence 原则给出最早分叉点、已确认部分、未确认部分和下一步补法。
