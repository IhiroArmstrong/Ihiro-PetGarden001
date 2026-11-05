# 引导冥想源文件清单

> 权威路径：`focus-tiger/docs/guided-meditation-source-inventory.md`  
> 配套 Brief：[`task-briefs/task-guided-meditation-media-delivery.md`](./task-briefs/task-guided-meditation-media-delivery.md)  
> **源文件不进 Git。** 本表只记元数据。后续课由 PO 补行，Cursor 不得猜分辨率/时长。

入库文件名一律英文 ASCII `kebab-case`（例：`what-is-zen-ancient-wisdom.mp4`）。展示名可含空格与符号。

## 已入库

| 字段 | 值 |
|---|---|
| `lessonId`（建议） | `what-is-zen-ancient-wisdom` |
| 展示名 | What is Zen: Ancient Wisdom & Guided Meditation |
| 本机路径（PO 工作区，不进仓库） | `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001/🌿 What is Zen_ Ancient Wisdom & Guided Meditation.mp4` |
| 建议对象键 | `guided-meditation/v1/what-is-zen-ancient-wisdom/master.mp4` |
| SHA-256 | `4fbb598b2239257b07ad20736031d3a9638aa811d2bee8ff5ecd932adc136a64` |
| 大小 | 135 481 888 bytes（129.21 MiB） |
| 时长 | 1303.0 s（21 分 43 秒） |
| 画面 | H.264 (`avc1`) · 1272×720 · Spotlight 视频码率 700 kbps |
| 音轨 | **1 条** AAC (`mp4a`) 立体声 · 44.1 kHz · 128 kbps · 约 19.9 MiB 音数据 |
| 字幕/时间轴轨 | 无（容器内未见字幕轨） |
| 语言 | 文件名与标题为英语；容器语言码为 `und`。日语版：**无**（后续另文件） |
| 配乐 | 与语音合在同一 AAC 轨（无法分轨抽出而不做源分离） |
| 宣传链 | `https://youtu.be/xawM6cgJSrE`（只作外宣，**不**作应用内播放） |
| 量测日期 | 2026-11-04 |
| 量测方法 | `ls` + MP4 `moov` 盒 + macOS `mdls` / `afinfo` |

## 配乐授权（T88 · 对外前须填实）

> 成片音轨里的配乐。YouTube 宣传授权 **不等于** App 内播放。Cursor **不得编造**来源。空行 = 尚未核实，**不得对外**。本表不是运行时门闩。下列长片行 PO 已于 2026-11-05 书面核实（H7 App 内播放拍板）。

| 字段 | 值 |
|---|---|
| 来源 | 成片合轨配乐（PO 未另交曲名/作者细目） |
| 授权范围 | App 内播放与合轨分发；含短课独立交付片（H7 拍板） |
| 核实日期 | 2026-11-05 |

### 交付片（R2 · delivery-video · 2026-11-06）

| 字段 | 值 |
|---|---|
| 桶 | `focus-tiger-guided-media`（公开读） |
| 公开根（**仅 dev/QA**） | `https://pub-6c48f2ff7b7a48739a7da5ab8cab4a68.r2.dev` |
| 播放 URL | `{公开根}/v1/what-is-zen-ancient-wisdom.mp4` |
| 规范键（含哈希） | `guided-meditation/v1/what-is-zen-ancient-wisdom/67898a1efc878ab82f991fe777394b8effff5f73ce9a331431af3c281383459b.mp4` |
| 交付 SHA-256 | `67898a1efc878ab82f991fe777394b8effff5f73ce9a331431af3c281383459b` |
| 交付大小 | 136 179 423 bytes（~130 MiB · faststart remux） |
| 画面 | H.264 1272×720 · AAC 128k · faststart |
| 对外发布前 | 须把应用内 `GUIDED_MEDITATION_MEDIA_HOST` 换为**自定义域**（禁止长期依赖 r2.dev） |

### 交付片（R2 · delivery-audio · 2026-11-06）

| 字段 | 值 |
|---|---|
| 播放 URL | `{公开根}/v1/what-is-zen-ancient-wisdom.m4a` |
| 交付 SHA-256 | `5596b7eba0877e9afef8dec8bd5a9446cf92b0b386177baf98bbd9b4782df123` |
| 交付大小 | 10 753 157 bytes（~10.3 MiB · AAC 64k · faststart） |
| 抽轨 | `ffmpeg -i delivery-video.mp4 -vn -c:a aac -b:a 64k -movflags +faststart` |


## 已入库 · 短课（独立片，不从长片再剪）

| 字段 | 值 |
|---|---|
| `lessonId` | `concepts-habits-intro` |
| 展示名 | 正念冥想引导 · 概念与习惯小课 |
| 本机路径（PO 工作区，不进仓库） | `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001/正念冥想引导-5分钟小课程001.mp4` |
| 建议对象键 | `guided-meditation/v1/concepts-habits-intro/master.mp4` |
| SHA-256 | `94b8f05596d5654f6f2cddd88802d791fa110666967b5a6b2d21e7dae55db00c` |
| 大小 | 327 603 529 bytes（312.43 MiB） |
| 时长 | 约 281 s（4 分 41 秒 · PO 标称） |
| 画面 | HEVC · 1080p（交付须转 H.264 + AAC + faststart；**不进 Git**） |
| 音轨 | 合轨（与长片同样不可无损分轨） |
| 语言 | 英语旁白（文件名中文）；日语版无 |
| 内容 | 正念冥想练习开头的概念与修行习惯小辅导，**不是**呼吸/坐姿引导 |
| 与长片关系 | 长片开头含同类 4:41 段落；本课用**独立文件**，不从 22 分母版再剪 |
| 量测日期 | 2026-11-05 |

### 交付片（R2 · delivery-video · 2026-11-06）

| 字段 | 值 |
|---|---|
| 桶 | `focus-tiger-guided-media` |
| 公开根（**仅 dev/QA**） | `https://pub-6c48f2ff7b7a48739a7da5ab8cab4a68.r2.dev` |
| 播放 URL | `{公开根}/v1/concepts-habits-intro.mp4` |
| 规范键（含哈希） | `guided-meditation/v1/concepts-habits-intro/b49bcf602716c10248d9cb3055b6574175a60d9835f51504befaded2a6533c5d.mp4` |
| 交付 SHA-256 | `b49bcf602716c10248d9cb3055b6574175a60d9835f51504befaded2a6533c5d` |
| 交付大小 | 28 523 034 bytes（~27.2 MiB） |
| 画面 | H.264 1272×720 · AAC 128k · faststart（自 HEVC 1080p 母版转码） |
| 母版 SHA-256 | `94b8f05596d5654f6f2cddd88802d791fa110666967b5a6b2d21e7dae55db00c`（HEVC 原片，**非**播放校验值） |

### 交付片（R2 · delivery-audio · 2026-11-06）

| 字段 | 值 |
|---|---|
| 播放 URL | `{公开根}/v1/concepts-habits-intro.m4a` |
| 交付 SHA-256 | `f035a80640370e257acd0a6627545deb88bd13b6fcd83f2eb7f9c820f7792161` |
| 交付大小 | 2 343 753 bytes（~2.2 MiB · AAC 64k · faststart） |
| 抽轨 | 从 delivery-video 抽 AAC 64k |

## 空行模板（PO 复制）

| 字段 | 值 |
|---|---|
| `lessonId` | |
| 展示名 | |
| 本机路径 | |
| SHA-256 | （可留空，入库时 Cursor 补） |
| 大小 | |
| 时长 | |
| 分辨率 / 视频编码 / 视频码率 | |
| 音轨数 / 编码 / 采样率 / 码率 | |
| 是否含背景音乐（合轨或分轨） | |
| 语言（en / ja） | |
| 有无字幕或文稿 | |

## 和主 Brief 候选课时的差

**PO 2026-11-05：** 首批上 **长片 + 独立 4:41 短课**（短课不从 22 分再剪）。H7 App 内播放已拍板。短课已转 H.264 并上 R2（见各课「交付片」表）。

**剪辑任务（P0.5）：** 在未上传前用非破坏性工程文件试剪；导出仍走 `delivery-video` + cue JSON。
