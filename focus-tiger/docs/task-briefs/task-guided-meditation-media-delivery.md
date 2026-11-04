# Task Brief：引导冥想媒体交付（云端托管 + 按需下载 + 本地缓存）P0 只读审计

> 状态：**§7 已由 PO 拍板（2026-11-04）** · 范围：只读审计 + 文档，**不写运行时代码**  
> 权威路径：`focus-tiger/docs/task-briefs/task-guided-meditation-media-delivery.md`  
> 与 [`task-guided-meditation-p0-audit.md`](./task-guided-meditation-p0-audit.md) 的关系：本 Brief 是其**姊妹篇**，专管「媒体文件怎么存、怎么送到用户手上」。主 Brief 的 B 项改为引用本 Brief，不再重复审计。  
> 审计产出：[`guided-meditation-media-delivery-audit.md`](../guided-meditation-media-delivery-audit.md) · [`guided-meditation-media-delivery-spec.md`](../guided-meditation-media-delivery-spec.md) · [`guided-meditation-source-inventory.md`](../guided-meditation-source-inventory.md)  
> 下一刀运行时须另口令（建议：`开工引导冥想媒体交付实现`，且须先过主 Brief P1）。本回合口令已执行的是审计，不是播放器。

---

## 0. 大白话总结（给 PO）

我们有自己原创的引导冥想视频（有 MP4 源文件）。平时放在自己的云盘，用户点开某一课时再下载或边下边播，下完可离线。安装包不会被撑大。

这一轮**只查不改**。源文件第一课已量完：大约 22 分钟、129MB、画面加声音在同一条音轨。你已拍板：选这种课时默认播视频、课免费、不偷偷预下载。

## 1. 背景与目标

- 桌面包已有约 1.1GiB 的精灵/音频资源（`extraResources`）；再把冥想视频打进安装包会让整包更新更慢。
- **视频课**（本清单第一课）：用户点了该课 → **默认播视频**；语音与配乐已合轨。
- **音频课**（若以后另给源）：另议；本轮不把视频课改成「默认只听声音」。
- 目标：用户点了才拉大文件、下完可离线、失败静默降级；不破坏叠层仲裁与后台网络规则。

## 2. 本轮不做（硬边界）

- 不写任何运行时代码、不改资源、不上传任何文件到云端、不改 Worker。
- 不实现下载器、缓存、播放页。
- **不把冥想音视频打进安装包或 Git。**
- 不使用 YouTube 或其它第三方视频站做应用内播放。
- 不接账号体系；这些课是公开静态资源，不绑用户身份。
- 不声称任何治疗或健康功效。
- 不把高清艺术品私有桶 `focus-tiger-art-hd` 拿来放公开课。

## 3. 审计项

见产出对照表。H1 第一课已按本机文件填写，未猜后续课。

## 4. 产出物

1. `guided-meditation-media-delivery-audit.md`
2. `guided-meditation-media-delivery-spec.md`
3. `guided-meditation-source-inventory.md`
4. `PROCESS.md` 速览一行；`task-entries` 一片。不改 `TASKS.md` / `GLOSSARY.md`。

## 5. 约束与红线

- 只读 + 文档；必须改代码才能确认的事，写进「需实测」。
- 不得把「已合入」写成「已验证」。
- 不得为凑完整而猜测。

## 6. 验收

- H1–H9 每项有结论或「未核实/需实测」。
- 桌面与 Web 各有状态机草案。
- 失败降级表覆盖无网、慢网、中断、校验失败、磁盘不足。
- 已写明不增加安装包体积的验证方法。
- 仓库 diff 仅含 docs（外加根目录 `/*.mp4` gitignore）。

## 7. 拍板（2026-11-04 · PO）

| # | 题 | 决定 |
|---|---|---|
| 1 | 默认播音频还是视频 | **用户选择视频课时，默认播视频。** 语音与画面一体。音频衍生件只作失败/无网/明确切「只听」的降级，不是默认体验。 |
| 2 | 语音与配乐是否分轨 | **不分轨。** 母版已是一条 AAC 立体声。 |
| 3 | 托管位置与预算 | **Cloudflare R2 新建公开桶**（建议名 `focus-tiger-guided-media`），经自定义域或 R2 公开 URL 拉文件；**禁止**混用艺术品私有桶 `ART_COLLECTION_HD`。Worker 只适合清单 JSON，不适合当 100MB+ 片的中转。现有帐号已在用 Workers + R2；R2 有免费额度且出站不计费。整帐是否「完全免费」**未核实**（看 Cloudflare 控制台套餐）。预算：首课与后续少数课先吃免费额度；预估月流量公式见 spec，**不编账单数字**。超出额度再问 PO。 |
| 4 | 免费还是付费 | **课程免费。** 下载不做权益校验。以后若要对个别课收费，另 Brief；预留 catalog 键但不接线。 |
| 5 | 是否提供「预先下载」 | **不做后台偷偷预下载。** 点课才下；桌面课卡可「供离线保存」。Web 边下边播，不等整片下完。 |

**与主 Brief PO 对齐（2026-11-04）：** 原声优先；授权前不上传；先英文；长课计入规则见主 Brief §8（非本 Brief 范围）。

## 8. 与主 Brief 的衔接

| 主 Brief 条目 | 处理 |
|---|---|
| B. 音频体积与加载 | 引用本 Brief 的 H3–H5、H8 与 spec |
| F.3 语音来源 | 仍在主 Brief；本 Brief 只关心已有 MP4 的转码与交付 |
| 其余 A、C、D、E、G | 不变 |

两份审计文档合并后再进入 P1 MVP 评审。主 Brief 入口/计入/仲裁仍待其自己的审计。
