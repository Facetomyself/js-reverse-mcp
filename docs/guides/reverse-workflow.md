# Codex Reverse Workflow

Codex 的推荐工作方式不是“全靠对话记忆”，而是把逆向过程沉淀成 task artifact 和本地复现工程。

核心原则：

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`

推荐流程：

1. 在页面里确认目标请求、脚本、函数
2. 必要时先用 `inject_preload_script` 把早期 hook 或补环境采样代码挂到后续文档加载前
3. 用 `record_reverse_evidence` 写入关键证据和 `targetContext`
4. 明确任务边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`
5. 用 `export_rebuild_bundle` 导出本地工程
6. 在 `env/entry.js` 上运行目标链路，并优先读取代理 env log
7. 先记录 `first divergence`，再回看页面证据，按“最小因果单元”决定补丁
8. 必要时再用 `diff_env_requirements` 做辅助比对，不要替代代理日志
9. 每轮只做一个补丁决策，补完立刻复跑，并持续写回 task artifact

重点不是一次性补全浏览器，而是先让目标参数链路可运行。
代理日志和 `first divergence` 是补环境第一依据；没有这两项记录，不应直接补宿主。
补环境职责边界和代理诊断层约定见：`docs/reference/env-patching.md`

推荐把任务边界持久化成 task artifact 里的 `targetContext`，这样后续续做时不用重新猜当前任务到底盯的是哪个请求、函数或页面动作。

配套文档：

- `docs/reference/reverse-update-prompt-template.md`
- `docs/reference/reverse-report-template.md`
- `docs/reference/algorithm-upgrade-template.md`
