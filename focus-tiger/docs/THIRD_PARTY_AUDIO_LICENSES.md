# Third-party audio licenses（索引）

> **目的**：音效/曲目入库时的授权可追溯入口。  
> **原则**：合并进 `develop` **不等于**授权审查完成；每批素材须有 ATTRIBUTION + 核实账本。  
> **本文件**：索引；细则写在各目录 `ATTRIBUTION.md`。

## 清单

| 目录 | 用途 | 授权记录 |
|---|---|---|
| `public/audio/ambient/` | Ambient Soundscape 长循环曲库（含付费深库） | [`ambient/ATTRIBUTION.md`](../public/audio/ambient/ATTRIBUTION.md) |
| `public/audio/cues/` | Focus 计时提示音（开始 / 间隔 / 结束；**免费**，不走 Ambient entitlement） | [`cues/ATTRIBUTION.md`](../public/audio/cues/ATTRIBUTION.md) |

## Focus session cues（Pixabay · 2026-08）

| 工程文件 | Pixabay id | 创作者（文件名） | License | 产品书面确认 |
|---|---|---|---|---|
| `session-start-bell.mp3` | 410608 | SoundReality | Pixabay Content License | 2026-08-12 入库 Prompt |
| `session-end-chime.mp3` | 254774 | linhmitto | Pixabay Content License | 2026-08-12 入库 Prompt |
| `session-interval-bell.mp3` | 376885 | DRAGON-STUDIO | Pixabay Content License | 2026-08-13 书面（检索页 [bell ding · p2](https://pixabay.com/sound-effects/search/bell%20ding/?pagi=2)） |

平台摘要：[License summary](https://pixabay.com/service/license-summary/) · 检索页同上。  
Agent 单页抓取曾遇 Cloudflare 403；**产品书面确认**已记入 `cues/ATTRIBUTION.md` 核实账本（以产品确认为入库合规依据）。

## 入库门禁（后续素材）

1. ASCII kebab-case 文件名  
2. 写入对应 `ATTRIBUTION.md`（来源、作者、id、候选 URL、license 名）  
3. 在本索引表加一行  
4. 产品书面或可打开的单页确认写入核实账本——**禁止**仅因「已合并」写成「已审查」
