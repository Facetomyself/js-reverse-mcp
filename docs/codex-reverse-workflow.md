# Codex Reverse Workflow

Codex 的推荐工作方式不是“全靠对话记忆”，而是把逆向过程沉淀成 task artifact 和本地复现工程。

核心原则：

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`

推荐流程：

1. 在页面里确认目标请求、脚本、函数
2. 用 `record_reverse_evidence` 写入关键证据
3. 明确任务边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`
4. 用 `export_rebuild_bundle` 导出本地工程
4. 在 `env/entry.js` 上运行目标链路
5. 报错后用 `diff_env_requirements` 决定下一步补什么
6. 补丁持续写回 task artifact

重点不是一次性补全浏览器，而是先让目标参数链路可运行。

配套文档：

- `docs/reverse-update-prompt-template.md`
- `docs/reverse-report-template.md`
- `docs/algorithm-upgrade-template.md`
