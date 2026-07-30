# Task Brief · 用户上传氛围乐（v1.0.0 必交付）

> **状态（2026-07-31）**：产品范围已拍板；**实现已开工**（分支 `feature/user-ambient-upload`）。  
> **权威口径**：`DESIGN.md`「禅意背景音」§5；排期入口 `PROCESS.md` Backlog「用户上传氛围乐」。

## 目标

用户可在 Ambient Soundscape 面板上传自己的氛围乐，多首进入清单且整段落在内置曲之上；仅可删除自己上传的曲。本机存储、刷新后仍可播。属 **v1.0.0 纯本地必交付**。

## 已拍板（勿再问）

| 项 | 口径 |
|---|---|
| 发版范围 | **v1.0.0 必交付**（非仅 Backlog） |
| 多首 | 允许 |
| 用户曲排序 | **最近在上**（按添加/上传时间倒序）；整段用户曲在内置曲之前 |
| 删除 | 仅自传；内置曲不可删 |
| 格式 | 仅 **mp3 / m4a**（`audio/mpeg`、`audio/mp4` / `audio/x-m4a`） |
| 容量硬顶 | **合计 ≤ 64 MiB** 且 **最多 10 首**（先触达者拒绝并提示）；单文件 ≤ **20 MiB** |
| 不做 | 云同步、均衡器、在线曲库、复杂排序拖拽 |
| 存储 | IndexedDB + Object URL（禁止超大 base64 进 localStorage） |
| 播放口径 | 继承既有 opt-in / Rise 停播 / 手势解锁；不默认开播 |
| 文案 | 一行「仅本机、不上传服务器」+ 拒绝格式/超容时的温和提示（en+ja） |

## 实现要点（建议）

1. `UserAmbientLibrary`（或同等）：CRUD + 容量校验 + IDB；`clearAllFocusTigerLocalState` **必须**清用户曲。  
2. `AmbientSoundscapeController.setTrack` / `normalizeAmbientPref`：认识 `user-*` id；解析 src 走库而非仅 `AMBIENT_TRACKS`。  
3. `AmbientSoundscapeUI`：上传入口、用户曲行（文件名或短标签）+ 删除、清单合并渲染（用户块 → Off? 保持现有 Off 位次：Off 仍可在最上或紧邻现逻辑，**用户曲块在内置曲之上**）。  
4. 回归：静音后续播偏好、面板 Off、Rise 停播。

## 验收 / 测试

- **单元**：pref 含 user id；清单合并顺序（最近用户曲 → 更早用户曲 → 内置）；超容/非法格式拒绝；删曲后 pref 回落。  
- **e2e**：小 fixture（mp3）→ 上传 → 清单置顶 → 选播 → 删除 → 刷新后用户曲仍在/已删符合操作。  
- **TEST_TRACKER**：实现落地时登记「待人工测试」（含 375 面板不溢出）。

## 已好清单（邻接保护面）

- 内置曲选播 / 音量 / 音符开面板 / 静音后续播偏好曲  
- Rise / 达标自动停播、再 Sit 不自动再开  
- 窄宽壳 Soundscape 入口（右上 ♪ / ActionBar）

## 非目标

主题/皮肤/换背景图、均衡器、用户改名、云端曲库。
