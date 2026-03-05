# 参数复现方法论模板（站点无关）

更新时间：2026-03-05

## 适用范围
- 适用于任意“请求参数可复现”类任务（签名、令牌、时间戳衍生字段、混合指纹参数）。
- 不绑定具体站点与参数名。

## 0. 任务定义
- 目标参数：`<param_name>`
- 目标请求：`<method> <url_pattern>`
- 成功标准：
  - 参数结构校验通过（段数/长度/编码格式）
  - 单次请求闭环满足预期（HTTP 状态 + 业务字段）

## 1. 输入契约（必须先填）
- `requestSpec`
  - `url` / `method` / `headers schema` / `body schema`
- `paramContract`
  - 字段名、类型、编码方式、是否与时间相关
- `runtimeSeedSchema`
  - cookie 键名集合
  - localStorage/sessionStorage 键名集合
  - 仅记录格式与长度，不记录敏感原值
- `clockPolicy`
  - 是否固定时间戳、偏移容忍度

## 2. 标准流程（固定顺序）
1. Observe
- 定位参数所在请求、触发动作、脚本来源、候选入口函数。
2. Capture
- 最小采样（优先 Hook，必要时断点），只保留字段结构证据。
3. Rebuild
- 本地最小补环境（按缺口单变量补丁），禁止一次性脑补。
4. Verify
- 单次验签闭环，记录状态码、业务码、响应摘要。
5. Divergence
- 记录 first divergence（首个差异点）并给出下一步补丁方向。

## 3. 补环境策略（单变量）
- 每次仅补一类能力：
  - `navigator` / `location` / `document` / `storage` / `canvas|webgl` / `crypto` / `Date`
- 每次补丁后立刻复测并记录变化。
- 失败时使用“上一版本可用快照”回退。

## 4. 验证口径
- 结构验证：
  - 参数段数/长度/字符集符合预期。
- 行为验证：
  - 单次目标请求返回可接受结果。
- 差异验证：
  - 允许值不同，但闭环必须通过。

## 5. 输出契约（统一）
- `paramShape`: 段数、长度、编码规则
- `requiredInputs`: 复现所需最小输入字段
- `envDependencies`: 补环境依赖清单
- `verifyResult`: 状态码、业务摘要
- `firstDivergence`: 首差异与后续动作

## 6. 安全边界
- 仓库内只保留抽象方法与验收标准。
- 不提交真实 cookie/token/storage 原文。
- 不提交可直接复用的完整可执行脚本。
- 可执行实现仅放 `artifacts/tasks-local/<task-id>/`（git 忽略）。
