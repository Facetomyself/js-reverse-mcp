# 参数站点映射模板（站点补充层）

更新时间：2026-03-05

## 目标
- 在“站点无关方法论模板”基础上，补充某站点特有映射。
- 只记录映射关系与判定标准，不记录可执行细节。

## 1. 站点信息
- 站点：`<site_name>`
- 参数名：`<param_name>`
- 常见入口：`<entry_function_or_class>`
- 相关脚本：`<script_url_pattern>`

## 2. 请求映射
- 目标接口模式：
  - `method`: `<GET/POST/...>`
  - `urlPattern`: `<domain/path pattern>`
  - `functionId/operation`: `<optional>`
- 参数所在位置：
  - `query` / `body` / `header`

## 3. 字段映射
- 参数相关字段：
  - 必填：`<field_a>`, `<field_b>`, ...
  - 可选：`<field_x>`, `<field_y>`, ...
- 依赖种子类型：
  - cookie 键：`<k1,k2,...>`
  - storage 键：`<k1,k2,...>`
  - 指纹能力：`<canvas/webgl/...>`

## 4. 站点特有风险点
- 初始化时机（首屏/异步脚本/懒加载）：
  - `<note>`
- 高变更点（版本字段、动态算法、下发 token）：
  - `<note>`
- 常见误判：
  - `<note>`

## 5. 验证口径（站点版）
- 结构口径：
  - `<segment_count / charset / length>`
- 行为口径：
  - `<status + business code>`
- 差异容忍：
  - `<which part can differ but still pass>`

## 6. 回归清单
- 脚本版本变化后是否仍满足输出契约？
- `requiredInputs` 是否新增/删除？
- first divergence 是否变化？

## 7. 关联文档
- 方法论模板：`docs/parameter-methodology-template.md`
- 安全规范：`docs/case-safety-policy.md`
- 工具读写契约：`docs/tool-io-contract.md`
