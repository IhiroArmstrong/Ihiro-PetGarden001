# Task Brief · Circle 可分享基建

> **状态（2026-09-30）**：草案。只写范围，**不改运行时**。你看过并回复「按这份 Brief 开工」之后，才能改 Circle / Ritual 代码。  
> **任务类**：B 类。分享会改变用户在圈子里看到的东西。  
> **Issue**：[#649](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/649) 挡住 [#650](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/650)。父 Epic [#629](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/629)。自定义 Ritual 仍在 [#628](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/628)，不在本单。

---

## 0. 大白话

圈子里已经能在坐满约 60 秒后「留一句痕迹」，别人在 Idle 上看到匿名短句。  
#649 不要再造第二条社交时间线。它只补一条管子：一次做完的仪式，可以走**同一条**匿名留痕，而不是只能从 Sit 的 Rise 进来。  
#650 再用这根管子，把 Ritual 完成接到留痕。本 Brief 不写 #650 的仪式选择界面。

## 一、建议范围（你点头才算锁）

做：

- 复用现有 Leave a trace / Witness 选句与提交（`FocusCircleWitnessLeaveUI`），不新开聊天、昵称墙或第二条 feed。
- 允许的新入口只有一个：一次 **已完成** 的 Ritual 结束时，若人已经在圈子里，并且这次时长达到留痕现有门槛，出现和 Sit 之后相同的留痕条。
- 失败、取消、未入圈、不够时长：和现在留痕一样，有可见结果或明确不出现，不静默吞掉。

不做：

- 不改自定义 Ritual 编辑器。
- 不加聊天、账号、真名、邀请码朗读。
- 不把未完成的仪式、中途退出、或别人的句子写成新的一条痕迹。
- 不在本 Brief 里改支付、知识库或倾诉路由。

## 二、和现有场景的关系

- 场景里已有的留痕（Rise 后 Leave a trace、Idle 上匿名痕、选句失败要有红字）保持原样。本管子只增加「仪式完成也能走到同一条」。
- 测试清单里 Circle 见证、昵称、轮询那些待测行，不靠本 Brief 关单。

## 三、开工前仍要你拍的一句

若你同意「仪式完成只复用现有留痕，不新建一种帖子」，回复：`按 Circle 可分享基建 Brief 开工`。  
若你要的是另一种东西（例如圈子里单独一张仪式卡片），先说差别，再改本文件，仍然先不写代码。
