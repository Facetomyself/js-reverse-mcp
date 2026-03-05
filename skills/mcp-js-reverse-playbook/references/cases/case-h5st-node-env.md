# 站点能力：JD `h5st` Node 补环境

## 角色
- 本文是站点能力层，依赖通用模板：
  - `references/cases/case-signature-node-template.md`
- 只保留 JD 场景特有映射与判定口径，不提供完整可执行代码。

## JD 场景映射
- 目标签名字段：`h5st`
- 常见入口：`ParamsSignMain.sign(...)`
- 常见版本字段：`appId=73806`, `_ste=1`, `5.3`
- 验签接口示例：`/sso/rac`（以当次抓包为准）

## 关键输入（脱敏后保存）
- 请求参数结构：
  - `functionId`
  - `body`（结构，不含真实敏感值）
  - `appid/client/clientVersion/t`
- 运行种子类型：
  - `cookie` 键名集合
  - `localStorage/sessionStorage` 键名集合
  - 必要时保留值长度与格式，不保留原值

## 验证口径
1. 结构验证
- `h5st` 分段数正确（通常 10 段）。
2. 行为验证
- 生成后立即请求一次目标接口（单次），响应满足预期（如 `200` 且业务码正常）。
3. 差异验证
- 记录关键段长度（如 `cltLen`）与浏览器差异。
- 允许长度不等，但需闭环通过。

## 优化优先级
1. 先提升稳定性
- 首先保证闭环通过率，再追求段值接近。
2. 再提升相似性
- 聚焦指纹相关能力（`canvas/webgl/navigator/plugins`）做单变量调整。
3. 最后做可维护性
- 固定输入契约、固定输出契约、保留 first divergence 记录。

## 安全要求
- 严禁提交真实会话数据（cookie/token/storage 值）。
- 仅提交字段模板、流程文档、判定标准。

## 维护边界
- 本文件仅保留抽象映射与判定口径。
- 站点级可复用工作流统一维护在 `scripts/cases/`：
  - `scripts/cases/jd-h5st-pure-node.mjs`
