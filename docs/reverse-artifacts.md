# Reverse Artifacts

推荐每个逆向任务都写入本地任务目录（默认不提交）：

`artifacts/tasks-local/<taskId>/`

读取优先级：

1. 先复用已存在的 `artifacts/tasks-local/<taskId>/` 全链路数据。
2. 若不存在，再参考 `scripts/cases/*` 抽象 case。
3. 仍不足时，按参数方法论模板新建任务目录并执行。

最少包含：

- `task.json`
- `timeline.jsonl`
- `network.jsonl`
- `scripts.jsonl`
- `runtime-evidence.jsonl`
- `cookies.json`
- `env/entry.js`
- `env/env.js`
- `env/polyfills.js`
- `env/capture.json`
- `report.md`

这些文件的用途：

- 回看页面观察证据
- 追踪哪个请求、哪个脚本、哪个 cookie 参与参数生成
- 记录 local rebuild 进展
- 给 Codex / Claude / Gemini 续做同一个任务

注意：
- 可提交仓库的仅为抽象方法论文档（`docs/`、`scripts/cases` 非可执行模板）。
- 可执行脚本、完整链路数据、敏感采样一律放 `artifacts/tasks-local/`。
- 可直接复用本地骨架：`artifacts/tasks-local/TEMPLATE/`（本地目录，不提交）。
