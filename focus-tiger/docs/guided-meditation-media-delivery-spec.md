# 引导冥想媒体交付 · 推荐方案（P0）

> 非运行时。PO §7 已锁。实现须另口令。

## 1. 产物

| 产物 | 格式 | 用途 | 体积（第一课 · 估算） |
|---|---|---|---|
| `master` | 现有 MP4 H.264 1272×720 + AAC 128k | 存档；可不对用户直出 | 129.21 MiB（已测） |
| `delivery-video` | H.264 + AAC，faststart，文件名含哈希 | **默认播放** | 约 80–130 MiB（母版已低码，可能接近原大小） |
| `delivery-audio` | AAC 64k 或 Opus | 仅降级 / 用户点「只听」 | 约 8–12 MiB |
| `cues` | JSON `schemaVersion: 1` | 文案高亮 | < 50 KiB |
| `manifest` | JSON `schemaVersion: 1` | 课列表、体积、哈希、语言 | < 20 KiB |

语音与配乐 **不分轨**。

## 2. Manifest 草案

```json
{
  "schemaVersion": 1,
  "lessons": [
    {
      "id": "what-is-zen-ancient-wisdom",
      "durationSec": 1303,
      "locales": ["en"],
      "defaultRendition": "video",
      "renditions": {
        "video": {
          "url": "https://media.example/guided-meditation/v1/what-is-zen-ancient-wisdom/{hash}.mp4",
          "bytes": 0,
          "sha256": "",
          "mime": "video/mp4"
        },
        "audio": {
          "url": "https://media.example/guided-meditation/v1/what-is-zen-ancient-wisdom/{hash}.m4a",
          "bytes": 0,
          "sha256": "",
          "mime": "audio/mp4"
        }
      },
      "cuesUrl": "https://media.example/guided-meditation/v1/what-is-zen-ancient-wisdom/{hash}.cues.json"
    }
  ]
}
```

未知 `schemaVersion`：整份丢弃，保留已缓存的旧课，新课显示需要网络。  
`example` 域名为占位；实现前由 PO 定自定义域，禁止把艺术品短时链格式套过来。

## 3. 托管

- 桶：新建 R2 `focus-tiger-guided-media`（公开读）。  
- **r2.dev 公开根仅 dev/QA**（Cloudflare 限速、无缓存/WAF）；**对外发布前**须换自定义媒体子域，应用只改 `GUIDED_MEDITATION_MEDIA_HOST` 一处。  
- 不绑用户。不经 Worker 流式传输整片。  
- Worker 至多：`GET /api/guided-meditation-manifest`（可选；也可纯 R2 JSON）。  
- YouTube 只引流。

### 费用框架（不编数字）

`monthly_cost ≈ storage_gb × storage_rate + class_a_ops × a_rate + class_b_ops × b_rate + (egress_if_not_r2)`

假设：R2 出站 $0；存储 ≈ 已上传字节；每次完整播放 ≈ 1 次 Class B 读 + 若干 Range。  
免费额度是否盖住，看当时文件总字节与播放次数。第一课 0.13 GiB 存储本身很小。

## 4. 状态机

### 桌面

```
not_cached --(点播放或「供离线保存」)--> fetching
fetching --(进度 0–100，可取消)--> ready
fetching --(取消)--> not_cached
fetching --(失败)--> error_retryable
error_retryable --(点重试)--> fetching
ready --(断网)--> ready（播本地）
ready --(点移除)--> not_cached
```

同一课禁止第二条并发下载；半途退出留下 `.part`，下次 Range 续。  
哈希已匹配：跳过写盘。

### Web

```
idle --(点播放)--> streaming
streaming --(可播缓冲)--> playing
streaming --(失败/无网)--> need_network
playing --(够缓存)--> cached_session（本会话/Cache API，不承诺永久离线）
```

## 5. 课卡文案态（草案，键位留给 locale slice）

| 态 | 用户看见 |
|---|---|
| not_cached | 可点播放 |
| fetching | 进度；可取消 |
| ready | 可离线播（桌面） |
| need_network | 需要网络（非模态） |
| error_retryable | 可重试（非阻断） |

Focusing / Arrival / Honesty 进行中：不自动开始下载；不弹窗。已在下的可继续，进度只在课页里。

## 6. 降级表

| 情况 | 行为 |
|---|---|
| 无网 + 已缓存 | 播本地视频 |
| 无网 + 未缓存 | 课卡需要网络 |
| 慢网 | 桌面显示进度；Web 先缓冲再播。可切音频降级（须用户点或视频多次失败后轻提示，不自动静默换轨抢体验） |
| 中断 | Range 续 |
| 校验失败 | 删残片，可重试 |
| 磁盘不足 | 可重试；建议移除其它课 |
| 系统打断 | 暂停播放；下载续 |

## 7. 预下载（何谓合理）

| 做法 | 结论 |
|---|---|
| 开机 / Idle 偷偷下 129MB | 不做（后台网络 + 克制） |
| 下载全部课程 | 不做 |
| 打开目录只拉 manifest | 做 |
| 点该课再下该课 | 做（默认） |
| 桌面课卡「供离线保存」 | 做（用户点了才下） |
| 网页「先下完再看」 | 不做；边下边播 |

## 8. 安装包

课文件不进 `public/`、不进 `extraResources`、不进 Git。  
缓存只在 `userData/guided-meditation/`。更新器不得清该目录。

## 9. 需实测（有运行时再做）

- 转码后实际 MiB  
- Safari / Electron `<video>` 对 1272×720 + faststart  
- 弱网流畅度 vs Idle 呼吸（若下载与 Idle 同屏）  
- 与 DMG 更新同时下载是否抢带宽  
- Cloudflare 套餐与自定义域

## 10. 首批两课（PO 2026-11-05 · 上云 2026-11-06）

| id | 课型 | durationSec | 播放 URL（r2.dev · 换域前） | delivery SHA-256 | bytes |
|---|---|---:|---|---:|---:|
| `concepts-habits-intro` | short | 281 | `…/v1/concepts-habits-intro.mp4` | `b49bcf602716c10248d9cb3055b6574175a60d9835f51504befaded2a6533c5d` | 28523034 |
| `what-is-zen-ancient-wisdom` | long | 1303 | `…/v1/what-is-zen-ancient-wisdom.mp4` | `67898a1efc878ab82f991fe777394b8effff5f73ce9a331431af3c281383459b` | 136179423 |

公开根：`https://pub-6c48f2ff7b7a48739a7da5ab8cab4a68.r2.dev`（应用常量 `GUIDED_MEDITATION_MEDIA_HOST`）。

P1 播放：整片 `fetch` + **SHA-256 校验**通过后 `blob:` 播放（校验值上表）；桶须 **CORS**（线上策略见 `cloud/r2/focus-tiger-guided-media.cors.json`，当前 `allowed.origins: ["*"]` 以便 Web + Electron fetch）且对象支持 **Accept-Ranges**（对象直链已测 `206 Partial Content`；P1 校验路径整片 fetch 后本地 blob 拖动不依赖 Range）。

短课**不**从长片再剪。
