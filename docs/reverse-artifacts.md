# Reverse Artifacts

推荐每个逆向任务都写入：

`artifacts/tasks/<taskId>/`

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
