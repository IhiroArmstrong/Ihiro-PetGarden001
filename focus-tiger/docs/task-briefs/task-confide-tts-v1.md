# Task Brief · Confide TTS V1（倾诉出字同步念出 · macOS）

> **状态（2026-09-26）**：**PO 已点头 · 立刻开工**  
> 父 Brief：`task-system-tts-v1.md`（Slice 0 探针已及格）  
> 决策修订：原「倾诉朗读下一期」→ **本期先做 Confide**，专注结束播报暂缓。  
> 挂线：Epic **#5** 苹果 DMG（与 Voice Input / System TTS 同壳）。

---

## 拍板（硬 · 2026-09-26 晚）

| 项 | 口径 |
|---|---|
| **挂载点** | **Confide 出字**：Yin 回复文字出现在面板时 **0–1s 内**开始本机朗读（与文字同步，非对口型）。 |
| **音色** | 英文 **Joelle（优化音质）**；日文 **Otoya（优化音质）**。两语言均须 `.enhanced` 档；无则同名最接近，仍禁止靠加快语速冒充音量。 |
| **语言** | 跟随界面语言（`en` → `en-US`，`ja` → `ja-JP`）；不默认中文音色。 |
| **壳** | **仅 Electron / macOS DMG 宽屏 ≥480px。** Web / PWA / 窄屏 **不露出**。 |
| **安全** | `safety_redirect` · `aggression_toward_others` **不朗读**，继续纯文字。 |
| **本期不做** | 全局声音开关（留 `task-system-tts-v1` Slice 1b）；专注结束播报；对口型；危机句以外的新路由特殊逻辑。 |
| **与 STT** | 共用 `macos-speech-helper.swift`；开关独立；TTS **不需要**麦克风。 |

**一句话**：电脑版宽屏倾诉里，Yin 回你话时字出来就念——Joelle / Otoya 优化音质，危机句仍只显示文字。

---

## 冲突扫描

| 相邻 | 结论 |
|---|---|
| Voice Input V1 | **无冲突**。听写 ≠ 朗读；可并存。 |
| System TTS 专注结束 | **切开**。本期只做 Confide；专注结束播报后移。 |
| PRINCIPLES 语音边界 | **无冲突**。系统声 ≠ 阿寅对口型。 |
| Celebrating / Focusing | **无冲突**。Confide 叠层内朗读；Focusing 关闭 Confide 时须 `stop`。 |
| 危机阀 | **须守**。安全转介路由跳过 TTS。 |

---

## 实现分层

```text
ConfideToYinUI._showReply
  → systemTtsBridge（宽屏 Electron gate）
  → desktop:system-tts-speak IPC
  → macos-speech-helper speak（Joelle / Otoya enhanced）
```

新回复到达时：先 `stop` 上一句（若有），再 `speak`。关闭 Confide 面板时 `stop`。

---

## 验收

**人工（Mac Electron 宽屏 `?product=1&confide=1`）**：

1. 界面英文 → Confide 发一句 → 0–1s 内听到 **Joelle** 念回复。  
2. 切日文界面 → 同路径 → 听到 **Otoya** 念回复。  
3. 触发危机转介路由 → **只有文字**，无朗读。  
4. 关 Confide / 再发新句 → 上一句可打断。  
5. Web `?product=1` → **无**朗读。

**自动化**：`systemTtsBridge.test.js`（路由跳过 + locale 映射 + 宽屏 gate）；`ttsProvider` 打断契约。

---

## 明确不做（本 Brief）

- 全局声音开关（下一刀与专注结束一并做）  
- 木鱼 / ambient ducking  
- 童声 / 角色配音  
- Web 朗读
