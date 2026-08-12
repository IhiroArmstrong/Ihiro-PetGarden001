# Session timer cues — audio assets

| File | Description | License / source |
|---|---|---|
| `session-start-bell.mp3` | Focus session **start** bowl / bell | **Pixabay Content License**。原文件名：`开头磬声-soundreality-bell-fx-410608.mp3`。创作者：**SoundReality**；资产 id **410608**。候选单页：`https://pixabay.com/sound-effects/bell-fx-410608/`。商用/非商用可用；平台条款**不强制**署名。 |
| `session-end-chime.mp3` | Focus session **end** (target-reached) chime | **Pixabay Content License**。原文件名：`结尾铃声-linhmitto-bellding-254774.mp3`。创作者：**linhmitto**；资产 id **254774**。候选单页：`https://pixabay.com/sound-effects/bellding-254774/`。同上。 |
| `session-interval-bell.mp3` | Focus session **interval** bowl (every 3 min) | **Pixabay Content License**。原文件名：`中间间隔磬声-dragon-studio-notification-bell-sound-1-376885.mp3`。创作者：**DRAGON-STUDIO**（文件名 dragon-studio）；资产 id **376885**。候选单页：`https://pixabay.com/sound-effects/notification-bell-sound-1-376885/`。同上。 |

**平台条款摘要入口**：[Pixabay Content License summary](https://pixabay.com/service/license-summary/) · [Terms](https://pixabay.com/service/terms/)  
**检索页（入库来源）**：[bell ding · page 2](https://pixabay.com/sound-effects/search/bell%20ding/?pagi=2)

## 核实账本（强制 · 防「已合并 = 已审查」）

| 日期 | 核实人 | 范围 | 结果 |
|---|---|---|---|
| 2026-08-12 | 产品提供方（入库 Prompt 书面） | start + end | 声明为 Pixabay Content License、可商用、不强制署名；检索页 [bell ding](https://pixabay.com/sound-effects/search/bell%20ding/?pagi=2) |
| 2026-08-12 | Agent（#275 实现） | start + end | 将上列声明写入本表并合入 `develop` tip `0d05b10`。**未**打开单页做独立截存 |
| 2026-08-13 | Agent（docs #277） | start + end + interval | 尝试抓取单页 → Cloudflare 403；候选 URL 已登记 |
| 2026-08-13 | 产品书面确认 | **interval**（第三文件） | 下载来源同 [bell ding · pagi=2](https://pixabay.com/sound-effects/search/bell%20ding/?pagi=2)；确认 Pixabay Content License（2019 前为 CC0）、可商用/非商用、不强制署名 → **授权已确认，可入库**（#277 已合 tip `b51f9a2`） |
| 2026-08-12 | 产品书面确认 | start + end | 同口径确认（#275 入库 Prompt） |

**说明**

- 工程路径：`/audio/cues/…`（**不**进 `ambient/`；与 Ambient Sound Gate / 付费曲库无关）。
- 产品用途：Focus 计时开始 / 间隔 / 达标结束提示音；免费；开关见 Soundscape「计时提示音」。
- 仓库级索引：`docs/THIRD_PARTY_AUDIO_LICENSES.md`。
- 接线 Brief：`docs/task-briefs/task-session-interval-bell-and-awareness-card.md`。
