# Upstream Watchlist

记录 `JSReverser-MCP` 参考项目里值得持续跟进的能力和修复，避免每次都重新人工回忆。

## 跟踪对象

- `zhizhuodemao/js-reverse-mcp`
- `ChromeDevTools/chrome-devtools-mcp`

## 当前已吸收

- `ChromeDevTools/chrome-devtools-mcp` 的 `--autoConnect` 思路
- 页面加载前注入脚本能力，对应本仓库 `inject_preload_script`
- response body 读取超时降级，避免大包或卡死请求拖死逆向链路

## 下一批优先关注

### `zhizhuodemao/js-reverse-mcp`

- network body 读取和互斥锁相关的超时/死锁修复
- 断点调试兜底链路：`trace_function`、`break_on_xhr`、`monitor_events`
- 更完整的 frame / execution context 选择

### `ChromeDevTools/chrome-devtools-mcp`

- source-mapped stack traces
- console `Error.cause` 链和错误可读性
- network request detail / body 读取稳定性
- 页面加载前脚本注入和浏览器连接稳定性

## 评估原则

- 优先吸收和逆向主链路直接相关的能力：页面观察、运行时采样、本地补环境、请求链路定位
- 不优先搬运和当前主场景弱相关的功能：CrUX、LCP、a11y、memory snapshot、screencast
- 引入上游能力时，优先做最小实现并补测试，不做整包迁移
