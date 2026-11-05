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

主 Brief 曾列 3 / 5 / 10 分钟候选。**PO 2026-11-04：** 本母版 **22:43 先上**；**优先**从本片剪 **3–5 分钟入门**（须 PO 听感定切点，Cursor 不猜）。10 分钟课非 MVP 硬门槛。

**剪辑任务（P0.5）：** 在未上传前用非破坏性工程文件试剪；导出仍走 `delivery-video` + cue JSON。
