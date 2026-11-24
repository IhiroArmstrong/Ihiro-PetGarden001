# Task Brief · 第一份 DMG 安装包资源体积评估（A 类）

> **状态（2026-11-24）**：Brief 已写；**ambient A 档试算已跑（本机 /tmp，未改仓库音频）**。**办理口径已锁**（PO：「如何合理就如何办理」）。**本回合不替换 `public/audio`。**  
> **代号**：挂在 **T95** 发版周；**不是** 新 T 号。**不是** 拿掉 Gemma。  
> **类**：A 类盘点。B 类压缩替换须另口令（见 §8）。

---

## 0. 大白话

客户觉得安装包大，大头是打进包的动画和声音，不是以后才下的聊天模型。本回合已量过体积，并对氛围乐做了压缩试算：全是 320kbps，压到 96kbps 大约能少一百多兆。**现在不改用户听到的文件**；下一刀才替换。精灵首屏序列不延后下载。

---

## 1. 与上轮结论对齐（PO 2026-11-24）

| 结论 | 本 Brief |
|---|---|
| 拿掉 Gemma 4E4 **不会**缩小安装包 | **不**把「删模型」写进体积方案 |
| Command-Tab 不立刻卸模型 | **不**写进本 Brief |
| 第一印象要轻 → 动 `extraResources` | **是**本 Brief 杠杆 |
| 如何合理就如何办理 | §8 已填死，不再等人勾表 |

打包权威：[`ARCHITECTURE.md`](../ARCHITECTURE.md) 桌面壳 · `desktop/package.json` 的 `extraResources`。

---

## 2. 冲突扫描

本回合无运行时 → **无用户路径**。若后续 B 类替换 MP3：须对照氛围乐默认关、离线可坐；压缩不得引入新的「没网不能坐」。

---

## 3. 盘点方法（可重复）

```bash
cd focus-tiger && npm run audit:public-resource-weight
```

---

## 4. 基线快照（2026-11-24 · `public/`）

| 路径 | 体积 | 备注 |
|---|---:|---|
| `public/sprites/` | **833.2 MiB** | 几乎全部 `tiger-cub/monk-robe-default/` |
| `public/audio/` | **188.2 MiB** | 12 首 ambient，合计 **187.8 MiB** |
| `public/ui/` | **132.2 MiB** | 艺术收藏预览等 |
| `public/models/` 及其它 | &lt; 20 MiB | 非 GGUF |
| **合计** | **≈ 1.149 GiB** | 1415 文件 |

### 4.1 单文件 Top 10（按字节）

| # | 体积 | 路径 |
|---:|---:|---|
| 1 | 40.06 MiB | `audio/ambient/mer-ka-ba.mp3` |
| 2 | 34.91 MiB | `audio/ambient/maestro-tlakaelel-jesse-gallagher.mp3` |
| 3 | 34.54 MiB | `audio/ambient/the-inner-sound-jesse-gallagher.mp3` |
| 4 | 15.73 MiB | `audio/ambient/lord-of-the-dawn-jesse-gallagher.mp3` |
| 5 | 12.60 MiB | `audio/ambient/divine-life-society-jesse-gallagher.mp3` |
| 6 | 9.50 MiB | `audio/ambient/meditation-impromptu-02.mp3` |
| 7 | 7.71 MiB | `audio/ambient/frozen-in-love-aakash-gandhi.mp3` |
| 8 | 7.42 MiB | `audio/ambient/somnia-variation-10-reed-mathis.mp3` |
| 9 | 7.14 MiB | `audio/ambient/invisible-beauty-aakash-gandhi.mp3` |
| 10 | 6.87 MiB | `audio/ambient/dreamland-aakash-gandhi.mp3` |

另两首未进 Top 10：`somnia-variation-3` 5.80 MiB、`kiss-the-sky` 5.50 MiB。

### 4.2 精灵序列 Top 10（`monk-robe-default/`）

| # | 体积 | 帧数 | 序列名 | 办理 |
|---:|---:|---:|---|---|
| 1 | 70.9 MiB | 94 | `golden-halo-palms` | 首发 **D 不动** |
| 2 | 64.7 MiB | 63 | `meditation-star-reward` | 首发 **D 不动** |
| 3 | 53.0 MiB | 65 | `conjure-flowers-blow-away` | 首发 **D 不动** |
| 4 | 52.0 MiB | 93 | `parrot-ear-visit-feather` | 首发 **D 不动** |
| 5 | 45.0 MiB | 57 | `celebrate-dance` | 首发 **D 不动** |
| 6 | 43.2 MiB | 67 | `starlight-cloak-sleep` | 首发 **D 不动** |
| 7 | 43.2 MiB | 67 | `starlight-cloak-wake` | 首发 **D 不动** |
| 8 | 38.3 MiB | 51 | `idle-breathing` | **禁止 C**；首发 **D** |
| 9 | 34.4 MiB | 60 | `celebrate-dance-v2` | 首发 **D 不动** |
| 10 | 33.0 MiB | 54 | `ear-wiggle-head-touch` | 首发 **D 不动** |

---

## 4.3 ambient A 档试算（2026-11-24 · 本机 ffmpeg · **未进仓**）

`ffprobe`：12 首全部 **MP3 · 320 kbps · stereo**。

对最大一首 `mer-ka-ba.mp3`（40.06 MiB / 1050 s）重编码：

```text
ffmpeg -i mer-ka-ba.mp3 -c:a libmp3lame -b:a 96k -ac 2 /tmp/ft-ambient-a-trial/96k.mp3
```

| | 体积 | 码率 | 时长 |
|---|---:|---:|---|
| 现网 | 40.06 MiB | 320 kbps | 1050 s |
| 试算 96 kbps | **12.02 MiB** | 96 kbps | 1050 s（不变） |

比例 ≈ **0.30**。按 12 首合计 187.8 MiB 线性外推：

| 目标码率 | 估计合计 | 估计节省 |
|---|---:|---:|
| **96 kbps（办理默认）** | ~56 MiB | **~132 MiB** |
| 128 kbps（若听感不够再退） | ~75 MiB | ~113 MiB |

氛围乐**默认关闭**；安装包仍整包携带。**96 kbps 对默认关的背景乐足够**；听感抽检留给 B 类替换 PR，不挡本评估刀。

产物只在 `/tmp/ft-ambient-a-trial/`，**禁止**把试算文件 commit。

---

## 5. 决策框架（已执行，不再开放并列菜单）

| 档位 | 本回合 |
|---|---|
| **A · 进包 + 压缩** | **仅 ambient 全包**：试算完成；**替换文件另开 B 类 PR** |
| **B · 减帧/降分辨率** | 首发不做 |
| **C · 延后下载** | 首发不做（含 `idle-breathing` **禁止 C**） |
| **D · 首发不砍** | 精灵 Top 10、`public/ui/` 预览 |

---

## 6. 交付物

- [x] 可重复脚本 + §4 数字  
- [x] ambient A 档试算（命令 + 节省估计）  
- [x] §8 办理已锁  
- [ ] **不在本 PR** 替换 `public/audio/**`

---

## 7. 验收

- [ ] `npm run audit:public-resource-weight` exit 0  
- [ ] 本文 §4.3 与试算命令一致  
- [ ] git diff **无** `public/audio` 二进制

---

## 8. 办理表（已锁 · 2026-11-24）

| 项 | 办理 | 依据 |
|---|---|---|
| `ambient/` 全包 MP3 | **A 试算已完成；B 类替换另口令** | 默认关 + ~132 MiB / 低回归 |
| `golden-halo-palms` 等奖励/罕见序列 | **D 首发不动** | 12-08 前不新开延后下载 |
| `idle-breathing` | **D；禁止 C** | 冷启动呼吸契约 |
| 艺术收藏 `ui/` 预览 | **D 首发不动** | 与货架交付另线，不挡 DMG |

**下一刀口令（仅当要真改安装包音频）**：「按资源体积评估 Brief 开工 ambient 96k 替换」。须听感抽检 + 不改默认关。

---

## 9. 权威交叉

- 壳资源：`task-electron-desktop-scaffold.md` P0-4  
- 发版周：[`task-t95-electron-shell-upgrade.md`](./task-t95-electron-shell-upgrade.md)  
- 更新演练：[`../t95-prep-update-e2e-rehearsal.md`](../t95-prep-update-e2e-rehearsal.md)  
