# PO 2026-11-01 · 五条新 Epic 正文（建库用）

## #28 co-practice

```
## 线概述
人机共修（Co-Practice）：人与 Yin 一起练的产品定位与交付——口径、契约面、邀请与场次账、纪念画礼物轨；叠加在 Sit/专注之上，不是第二条练习机。

## 状态
进行中（2026-10～11：T56/T63/T64/T67 已合或已文档；T68 发放 Brief 已点头；运行时发放待闸）。

## 关系
- 串行依赖（必须等它完成）：无
- 被谁依赖（它完成前，谁不能收尾）：无
- 耦合（共享代码/状态，改动前互相检查）：#627 专注开表/完成钩；#632 纪念画不出货架；T55 陪伴契约开口通道；#630 请茶/会员（礼物轨 ≠ 货架轨）
- 兼容约束（结果需保持一致，不阻塞）：C-11 禁止未证明「懂你/有效」；#641 文案
- 排期建议（逻辑先后，非 GitHub blocks）：口径 → 契约面 → 接合账 → 发画 Brief 点头 → 发放 runtime

## 已知子任务/PR
见 `task-lines-issue-map.md` §「人机共修 · 切片」；SSOT `CO_PRACTICE_POSITIONING.md` · `CO_PRACTICE_GIFT_ART.md`

## 备注
表外新线 · slug `co-practice` · 2026-11-01 PO 拍板独立 Epic（不再仅挂 #627）
```

## #29 yin-digital-assets

```
## 线概述
Yin 数字艺术珍藏（Art Collections）与 Focus Coin / 虚拟货币及交易策略——附带、独特的发展轴；原则、行为稀缺展示、珍藏 UI、Stripe 商品与「非货架礼物轨」边界。

## 状态
进行中（#632 · #888 已建 Epic 作实现分区；本线为策略伞 + 跨 PR 索引）。

## 关系
- 串行依赖：无
- 被谁依赖：无
- 耦合：#630 支付层级；#628/#629 社交分享（非本线主责）；#646 品味/远程参数；#28 共修纪念画（礼物轨）
- 兼容约束：数字资产原则 SSOT；C-11；#641
- 排期建议：原则/稀缺文档 → 运行时抽屉与卡片 → 新 SKU 对齐 #630 矩阵

## 已知子任务/PR
#632 #888 及 `FOCUS_COINS.md` · `task-collections-behavioral-scarcity.md`；子切片见 issue-map §「数字资产策略 · 切片」

## 备注
slug `yin-digital-assets` · 2026-11-01 PO 拍板 · **不**合并关闭 #632/#888 Issue
```

## #30 product-research-evidence

```
## 线概述
产品使用证据与长期研究：T54 研究分享开关、影子流水、90 天实验预注册、人机共修与其它课题的对照与跟踪；服务产品长期改进，不是工作室 CI 流程。

## 状态
进行中（Privacy 开关与影子流水已合 develop；90 天日历仍搁置 · 未排期）。

## 关系
- 串行依赖：无
- 被谁依赖：无
- 耦合：#28 共修研究子课题；#31 读层/适应（上送白名单不含原文）；Privacy 删除所有数据
- 兼容约束：Never-Cloud；未同意不上送；对外不宣称疗效
- 排期建议：同意开关 → 流水稳定 → 预注册文档 → 日历开跑（PO 另口令）

## 已知子任务/PR
`task-t54-*` · `t54ResearchLedger` · GLOSSARY T54 两行；子切片见 issue-map

## 备注
slug `product-research-evidence` · 2026-11-01 PO 拍板（原「非产品 Epic」口径废止）
```

## #31 responsive-personalization

```
## 线概述
越来越懂你（Responsive personalization）：统一读层、偏好稳定、适应层、事实句与可纠正——在 C-11 内提升「状态响应与个性化选择」，禁止未证明的「懂你」宣传。

## 状态
进行中（T58 适应层 v1 已合；读层 resolver Brief/盘点旁支；#634 YPE 算法仍并行）。

## 关系
- 串行依赖：无
- 被谁依赖：无
- 耦合：#627 时长/模式偏好；#634 YPE 信号；#28 共修邀请暂停；T55 契约；#30 研究上送字段白名单
- 兼容约束：C-11；Privacy；#641
- 排期建议：读层 Brief 点头 → resolver → 常用分钟/稳定偏好 → 可选提议—确认

## 已知子任务/PR
`task-yin-adaptation-v1.md` · `pref-state-read-inventory.md` · `YIN_PERSONALIZATION_ENGINE.md`

## 备注
slug `responsive-personalization` · 2026-11-01 PO 重点课题
```

## #32 progress-visualization

```
## 线概述
各方面进展可视化：成长旅程、莲花/可见生长、练习纸与观察节律、指标与 Charter——让用户看见练习与意义层进展，不替代 #28 礼物叙事。

## 状态
进行中（#640 #643 已建；T52/T65 观察纸已合；持续增量）。

## 关系
- 串行依赖：无
- 被谁依赖：无
- 耦合：#627 练习账本写侧；#632 珍藏展示；#28 共修契约面（T63）；#646 生长 KV
- 兼容约束：YIN_EVOLUTION 意义层；GROWTH_METRICS_CHARTER；#641
- 排期建议：写侧正确 → Journey/莲花表面 → 指标与可视化一致

## 已知子任务/PR
#640 #643 · `YIN_EVOLUTION.md` · `practice-aggregate-registry.md`

## 备注
slug `progress-visualization` · 2026-11-01 PO 重点课题
```
