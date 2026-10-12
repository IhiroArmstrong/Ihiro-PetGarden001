# Task Brief · 短答未命中时：Help Center + 客服邮箱（不整库灌倾诉）

> **状态（2026-10-13）**：PO 已点头 · **第一刀**（诚实空态文案）`fix/confide-honesty-help-center-copy`。第二刀 Help Center 文章、第三刀 Confide 检索仍待另开。
> **分支建议**：先 `docs/*` 合入计划；实现拆两刀 `fix/confide-honesty-help-center-copy`（文案）→ `feature/help-center-gap-articles`（目录补篇）。Confide 检索 Help Center 正文须**第三刀另 Brief**。

## 背景

2026-10-13 Electron 灰度：功能问没命中短答时，阿寅念「Yin doesn't keep a manual… Try the menu — Practice or Preferences。」用户要求改成诚实空态 + **Help Center** + **公开客服邮箱**；并希望短答没覆盖的产品说明进 Help Center。

现网约束（不得偷偷推翻）：

- `product-knowledge-base.md`：知识库 ≠ 帮助中心；倾诉只出已审核短答。
- `task-user-help-center.md`：Help Center 是用户自助浏览；**当时不做** Confide 检索改闸。

## 拍板（待你点头）

| 项 | 口径 |
|---|---|
| 第一刀 | 只改诚实空态文案（en/ja，zh 草稿槽）：保留 “doesn't keep a manual”；**去掉** Practice/Preferences 乱指路；改为可查 **Help Center**，或发信 **hello@twinsology.com** |
| 第二刀 | 把本场缺口主题写成 Help Center 文章（allowlist）：呼吸练习能坐多久、能否买 Collections、莲花/成长含义、徽章 ≠ 寅币。来源只限**已有用户向文档 / 已审 KB 正文**，禁止 TASKS、ISSUE、内部排障 |
| 第三刀（可选） | Confide 在短答 miss 且产品闸为真时，检索 **help-center 用户向短摘**（不是整篇朗读、不是内部 git 文档）。须另 Brief |
| 明确不做 | 不把仓库项目文档整库塞进倾诉；不让阿寅念长说明书；不改危机/攻击他人路由；2b 默认仍 shadow |

## 冲突扫描

- **AE 倾诉 / 观察翼**：第一刀只动「已经判定为产品问且短答未命中」的空态，不把情绪句推进 Help Center。情绪误入产品闸是**另一张**修复单（ledger 扇出项）。
- **AX Help Center**：第二刀只加目录篇，不改打开方式。
- **人设**：阿寅仍不讲课；空态是指路，不是现编功能步骤。

**结论**：无未拍板冲突。第三刀与旧 Help Center Brief「不改 Confide 检索」冲突 → 必须另 Brief，不得混进第一刀。

## 验收（点头后的实现刀）

- 第一刀：`How long can I practice breathing?` 在 catalog 仍 miss 时，英文须含 Help Center 与 `hello@twinsology.com`，不得再出现 Practice or Preferences。
- `有点烦` / `俺 感觉 有点烦躁` 仍观察翼，不得变空态。
- 第二刀：四篇缺口在 Help Center 目录可点开；单测锁 allowlist id。

## 回滚

第一刀：locale 改回旧诚实空态句。第二刀：从 catalog 去掉新 id。
