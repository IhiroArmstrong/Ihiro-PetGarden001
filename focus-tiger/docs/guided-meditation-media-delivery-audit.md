# 引导冥想媒体交付 · P0 审计（H1–H9）

> 2026-11-04 · 只读 · 不写运行时  
> Brief：[`task-briefs/task-guided-meditation-media-delivery.md`](./task-briefs/task-guided-meditation-media-delivery.md)  
> 方案：[`guided-meditation-media-delivery-spec.md`](./guided-meditation-media-delivery-spec.md)  
> 源清单：[`guided-meditation-source-inventory.md`](./guided-meditation-source-inventory.md)

每项：**现状 → 是否满足 → 缺口 → 建议**。

---

## H1. 源文件与转码

**现状**  
PO 提供 1 个母版（已量，未猜）：

| 项 | 事实 |
|---|---|
| 文件 | `🌿 What is Zen_ Ancient Wisdom & Guided Meditation.mp4`（仓库根，gitignore） |
| SHA-256 | `4fbb598b2239257b07ad20736031d3a9638aa811d2bee8ff5ecd932adc136a64` |
| 大小 / 时长 | 129.21 MiB / 1303 s |
| 画面 | H.264 1272×720 · ~700 kbps |
| 声音 | 1× AAC 立体声 44.1 kHz 128 kbps（合轨） |
| 字幕轨 | 无 |

宣传链 `https://youtu.be/xawM6cgJSrE` 不作为播放源。

**是否满足**  
清单格式满足。转码产物尚未做（本轮禁止上传/转码）。母版码率已经偏低，不是「未压缩相机片」。

**缺口**  
无 ja 版；无 cue；无 3/5/10 分钟短课源。本机无 `ffprobe`（用 MP4 盒 + `mdls`/`afinfo`）。

**建议**  
- 对象键用 `what-is-zen-ancient-wisdom`。  
- 视频课默认用 **H.264 + AAC** 的交付 MP4（Electron / Safari / Chrome 均熟）。母版已接近可播，可只做封装整理 + 内容哈希文件名。  
- 另出 **音频降级件**（AAC 64 kbps 或 Opus，估算 8–12 MiB）供失败降级，**不是**默认播放。  
- 480p 可选；首课不是必须。估算（未实测）：480p 合计约 60–90 MiB。  
- 不分轨（PO）。

---

## H2. 文案时间轴

**现状**  
容器内无字幕轨。产品 locale 对外 en + ja（`localeRegistry.js` / `INFRA_SNAPSHOT` §3）；zh 草稿。

**是否满足**  
不满足播放时逐句高亮。

**缺口**  
无 SRT/JSON cue；无校对流程。

**建议**  
- 格式：JSON 数组 `{ tStart, tEnd, textEn, textJa }`，`schemaVersion: 1`；未知版本整份丢弃。  
- 从成片文稿或 Whisper **草稿** → 人校时间 ±150 ms。  
- 暂停/拖动：按当前 `currentTime` 重算高亮句，不另开时钟。  
- zh 只进草稿文件，不进对外 manifest。

---

## H3. 托管与版本化

**现状**  
- Worker `focus-tiger-cloud`：`https://focus-tiger-cloud.ihiro.workers.dev`（`INFRA_SNAPSHOT` §1 · `cloud/wrangler.jsonc`）。  
- KV ×9+：支付、备份、品味层等。**无**现成「公开大文件」路由。  
- R2 仅 `ART_COLLECTION_HD` / 桶 `focus-tiger-art-hd`，键 `private/art-hd/…`，走短时链接 `GET /api/art-collection-hd`（付清才发）。  
- 品味层 JSON：未知 `schemaVersion` 丢弃、用冻表。

**是否满足**  
有 Cloudflare 与 R2 **能力**，没有公开课桶、没有课清单。

**缺口**  
未核实 Cloudflare 套餐是否免费。R2 公开访问/自定义域未接线。Worker 拉 100MB+ 片会撞 CPU/时长，不适合当 CDN。

**建议**  
- **新建**公开桶 `focus-tiger-guided-media`（或同名），键 `guided-meditation/v1/{lessonId}/{hash}.{mp4\|m4a\|json}`。  
- **禁止**写入 `ART_COLLECTION_HD`。  
- manifest 小 JSON 可放 R2 根或 Worker；客户端不认识的 `schemaVersion` → 丢弃，课卡「需要网络」/保持旧缓存。  
- 费用框架：存储 ≈ Σ(文件字节)；流量 ≈ 播放次数 × 平均拉取字节。R2 出站通常 $0；若误走 `workers.dev` 中转则可能吃 Worker 流量。数字须看控制台，本轮不编。  
- Range：R2 支持；桌面可复用 `desktop/companion/l0Download.js` 的 `.part` + Range 思路，**目录分开**。

---

## H4. 下载与缓存（桌面 vs Web）

**现状**  
- 桌面大文件先例：GGUF → `userData` / `Focus Tiger/companion-l0/`（`l0Download.js`）。  
- 艺术品高清：付清后下到本机（`task-art-collection-hd-delivery.md`）。  
- `extraResources` 只有 `sprites` + `audio`（`desktop/package.json`）。  
- 无课程缓存目录。

**是否满足**  
有可抄的下载器模式；无课程状态机。

**缺口**  
磁盘上限、用户删除入口、Web Cache API、配额满时的文案均未实现。

**建议**  
| 端 | 做法 |
|---|---|
| 桌面 | `{userData}/guided-meditation/{lessonId}/{version}/`；校验 SHA-256；课卡可「移除本机副本」。上限建议先 2 GiB 或 5 课，超出最久未播的先删（实现时再锁数字）。 |
| Web | `<video>` 流式 + HTTP 缓存；可选 Cache API 只缓存**当前课**。不承诺整课离线。配额不足 → 只流式、不写缓存。 |
| 触发 | 点该课才下该课。打开目录只 GET manifest（小）。 |
| 预下载 | 桌面课卡「供离线保存」= 用户点击。无开机预取、无「下载全部」。 |
| 状态机 | 见 spec。 |

---

## H5. 后台网络三问与失败降级

**现状**  
`BACKGROUND_NETWORK.md`：非点击的请求须答时机 / 写盘 / 慢网。用户点了才发的路径不适用该三问（仍须点击 0–1 秒反馈）。现网有品味层预取、练习备份错峰、GGUF 在打开倾诉后下载。

**是否满足（方案层）**  
点课下载 = 用户点击 → **不走**后台三问。打开目录拉 manifest 也算用户点了菜单。  
**禁止**的开机/Idle 预下载才会撞 Q1–Q3。

若有人把「供离线保存」做成进入 Idle 自动下：Q1 会与 Idle 呼吸/精灵预加载重叠；Q2 须哈希相同跳过；Q3 不得卡呼吸。PO 已否自动预下载。

**缺口**  
失败文案、课卡四态、与 Focusing 互斥未实现（主 Brief D）。

**建议**  
- 进度条画在**课卡/播放页内部**，不是新的全局 z=22 芯片（避免和软更新芯片抢槽）。  
- 菜单渲染不依赖叠层仲裁（`PRINCIPLES` 菜单逃生舱）。  
- 无网已缓存 → 播本地。无网未缓存 → 课卡「需要网络」，**不**弹阻断模态。  
- 校验失败：删 `.part`，课卡可重试。磁盘满：可重试 + 建议移除其它课。切后台：Range 续传。

---

## H6. 权益与付费

**现状**  
`FEATURE_CATALOG` 无 guided-meditation 键（`INFRA_SNAPSHOT` §2）。艺术品高清用购买记录 + 短时链，与公开课相反。

**是否满足**  
PO：**课免费，不校验权益。** 满足本轮。

**缺口**  
若未来收费：公开 R2 URL 可被拷贝，UI 隐藏挡不住。要真门闩需签名链（接近艺术品方案），体积与体验更重。

**建议**  
本轮公开对象。预留 `content.guided-meditation` 类 catalog 键但不接线。禁止用「仅前端藏入口」冒充付费墙。

---

## H7. 隐私与合规

**现状**  
`PRIVACY_NOTICE.md`：练习数据默认本机；灯火/研究/备份为可选。未写「点课会向 Cloudflare 拉公开影片」。公开 GET 会让 CDN 见到 IP（与任何静态资源相同），无用户 id 则不可识别到帐号。

**是否满足**  
产品尚未拉课，故现网不泄露课播放。上线前隐私文案缺一句。

**缺口**  
授权：成片商用分发是否覆盖 **App 内** 与 YouTube — **未核实**（PO：核实前不上传）。无播放埋点。

**建议**  
- 下载 URL **禁止**带 restore token / 邮箱 / 设备 id。  
- Privacy 补一句：点引导课时会从我们的云存储拉取公开媒体。  
- **P1 硬门禁（主审计 §F2）：** Help/KB「Sit = no voice guidance」须与「另有引导课」并存，避免与 EDU-0003 矛盾。

---

## H8. 安装包与更新器

**现状**  
`desktop/package.json` `extraResources` = sprites + audio。`ARCHITECTURE.md` 写约 1.1 GiB。更新器 Brief：`task-electron-desktop-updater.md` — 忙时不弹窗；下载可后台；安装须用户点。

**是否满足**  
方案「课不进包」则不增加 DMG。尚未用打包命令验证（本轮不跑打包）。

**缺口**  
缓存目录 vs 更新覆盖：**需实现时**放在 `userData`，不要放 `extraResources` / 应用包内。与更新器抢带宽 **需实测**。

**建议**  
验证方法（P1，本轮不跑）：`jq`/读 `package.json` 无 meditation 路径；打出来的 DMG 文件列表无该课；`userData/guided-meditation` 在模拟更新后仍在。

---

## H9. 测试与验收草案

实现阶段（本轮不写测试代码）：

**单测 / e2e（有运行时再写）**  
点课开始下载、进度、取消、完成后断网可播、哈希失败重试、磁盘不足、半途再进、Focusing 开着不可抢播、菜单在播放中仍可达。

**仅人工**  
真弱网、真断网、桌面与一台手机浏览器、与检查更新同时下载（带宽）。

**本回合**  
纯文档。TRACKER 行只验「说明书齐」，不验播放。

---

## 冲突扫描（文档路径）

对照 `SCENARIO_TESTS.md`：本回合无新入口、无运行时。

| 相邻 | 三轴 |
|---|---|
| Ground exercise / Sit | 职责重叠留给主 Brief 入口审计；本篇只送文件 |
| 艺术品高清下载 | 同是大文件，但是付费私有 vs 免费公开；桶与目录必须分开 |
| GGUF 下载 | 可抄 Range；不可共用 `companion-l0/` |
| 桌面更新器 | 强度：课下载不得比 Focusing 更抢；忙时不弹阻断框 |
| Focusing | 主 Brief：课不进 Focusing 内部 |

无运行时冲突疑点，不阻塞本 docs PR。实现口令须再扫一遍。

**后台网络：** 推荐方案不涉及开机自动拉大文件。PR 写「点课才拉；不涉及后台网络」。若有人加 Idle 预取则须重答三问。

**受保护付款路径：** 不改 Support FAB / 结账 / z-index 全局层。
