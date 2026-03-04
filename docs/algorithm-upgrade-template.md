# Algorithm Upgrade And First Divergence Template

这份模板用于“算法升级、混淆升级、版本切换”场景，目标是快速找到 first divergence，而不是重新从零逆。

## 适用范围

- 签名算法换版本
- 本地纯算法结果和浏览器结果开始不一致
- `env rebuild` 还能跑，但最终参数失配
- VMP / AST / helper 名称发生迁移

## 输入建议

- 旧版本结论或旧版本产物
- 新版本 JS 文件或新页面证据
- `targetKeywords`
- `targetUrlPatterns`
- `targetFunctionNames`
- `targetActionDescription`
- 旧版与新版的关键样本输入

## 推荐顺序

1. 先做结构归一化
2. 再做目标驱动采样
3. 再看 first divergence
4. 最后才改实现

## first divergence 检查表

优先看哪一层先分叉：

1. 目标请求
2. hook 命中的关键函数输出
3. token / nonce / sign 中间值
4. crypto helper
5. env collect / storage / fingerprint
6. 最终拼接

如果参数名很怪，不要卡在字段名本身，优先看：

- 哪个请求先变化
- 哪个函数先输出不同值
- 哪个页面动作触发了这段链路
- 哪个时间窗内出现关键证据

## 产物要求

- 一份更新后的 task artifact
- 一份差异摘要
- 一份本地 `env rebuild` 现状
- 一份纯算法候选实现或明确说明为何暂时不能纯化

## 输出模板

1. 本次升级的 first divergence
2. 已确认未变化的部分
3. 已确认发生变化的部分
4. 当前是继续补 `env rebuild` 更合适，还是转纯算法 / 去混淆更合适
5. 下一步最小行动
