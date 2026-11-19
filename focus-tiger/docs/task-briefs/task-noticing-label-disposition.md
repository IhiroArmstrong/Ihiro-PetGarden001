# Task Brief · 觉察一句标签处置锁（取消「说不清」）

> **状态**：**PO 2026-11-19 点头开工**（书面同意：取消「说不清」；高危不另造分类器；接住/邀坐不当成模型能分开的两类）  
> **代号**：`noticing-label-disposition`（方向锁未登记 T 号；实现旁支不得自编 T 号）  
> **类**：**A 类**（不改变用户看见的固定句内容或危机路径；只锁「挑选方式不得走向量 / 不得复活独立灰区类」。）  
> **依赖**：方向锁 [`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md) · 分离失败 [`task-noticing-one-line-isolation.md`](./task-noticing-one-line-isolation.md) §1.4 · 句库接线 #1789  
> **旁支**：`feature/noticing-label-disposition`  
> **不是**：换 embedding 模型、改 0.78、删句库、把邀坐从句库拿掉、改 Help Center、修 R2L-02、打开自由聊天、另造危险分类器。

## 0. 大白话

实验室里的四类分不开。产品已经决定：不要「说不清」这一格；高危仍走原来的安全层；接住和邀你坐可以都在句库里，但不要让模型去猜该回哪一种。

本刀把这条决定写进代码门闩，避免以后有人把分离试验的四类接上发送链。

## 1. 目标

1. 运行时句库 **kind** 只许 `hold` / `invite_sit`。禁止 `unclear` / `crisis` 出现在 `noticingFixedLines.json`。  
2. `pickNoticingFixedLine` 从混合池按日期+盐取句；**忽略** embedding、classHint、isolation 类 id。不得按 kind 先过滤再挑。  
3. 高危继续 `CONFIDE_ROUTE.SAFETY_REDIRECT`（现网安全层）。本模块不新增危机分类器。  
4. 实验室四类夹具保留；`isolationPassed` 保持 false；禁止为刷过线改夹具或阈值。  
5. 单测：传入伪造 embedding / `unclear` hint 不得改变挑句；库内无 `unclear` kind。

## 2. 非目标

- 改 v0.3 金句正文。  
- 把邀坐句全部改成接住。  
- 重跑真 embedding。  
- Confide 发送链其它路由、Help、Support 结账文案。

## 3. 冲突扫描

对照 **AE** 觉察一句、**T51 / T79** 邀你坐、现网安全层、T100 输出闸。

| 轴 | 判断 |
|---|---|
| **强度** | 不加重；取消一类，不新开入口 |
| **语气** | 无新用户文案 |
| **职责** | 不替代安全层；不替代 Help |

无未决冲突。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态跳过。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 后台网络

不涉及后台网络。

## 验收

- `node --test src/core/noticingOneLine/noticingLabelDisposition.test.js src/core/noticingOneLine/noticingFixedLineLibrary.test.js src/core/noticingOneLine/noticingOneLineIsolationGate.test.js`  
- `cd focus-tiger && npm run test:smoke`  
- TRACKER：仅单元测试覆盖。用户回复句子集合与 #1789 相同。
