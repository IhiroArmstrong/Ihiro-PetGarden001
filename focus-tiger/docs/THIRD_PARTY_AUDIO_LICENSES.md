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

| 工程文件 | Pixabay id | 创作者（文件名） | License（声明） | Agent 单页核验（2026-08-13） |
|---|---|---|---|---|
| `session-start-bell.mp3` | 410608 | SoundReality | Pixabay Content License | **未完成**（Cloudflare 403） |
| `session-end-chime.mp3` | 254774 | linhmitto | Pixabay Content License | **未完成**（Cloudflare 403） |
| `session-interval-bell.mp3` | 376885 | DRAGON-STUDIO | Pixabay Content License | **未完成**（Cloudflare 403） |

平台摘要：[License summary](https://pixabay.com/service/license-summary/)（Agent 抓取同样被 Cloudflare 拦；须人工打开）。

**人工补核清单（约 3 分钟）**

1. Safari 打开上表三枚候选单页（见 `cues/ATTRIBUTION.md`）  
2. 确认页面可见 *Free for use under the Pixabay Content License*（或等价）  
3. 在 `cues/ATTRIBUTION.md`「核实账本」补一行：日期 + 你的确认  

## 入库门禁（后续素材）

1. ASCII kebab-case 文件名  
2. 写入对应 `ATTRIBUTION.md`（来源、作者、id、候选 URL、license 名）  
3. 在本索引表加一行  
4. 能打开单页则记「人工/Agent 确认」；打不开则记「未完成」——**禁止**默认写成「已审查」
