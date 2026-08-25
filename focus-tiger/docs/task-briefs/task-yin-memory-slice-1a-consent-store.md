# Task Brief · Yin Personal Memory · Slice 1a（Consent + store 骨架）

> **状态（2026-08-25）**：**Slice 1a 开工**（口令「开工 Yin Personal Memory」子段 1a）。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md`。  
> **前置**：Slice 0 已合（#424）；AE「能聊」已关；1.7B 生产已接线。

---

## 做什么（本切片）

1. **Consent 门闩**：Electron 宽屏 Confide 首次层 3 路径前轻问一次；Allow / Not now；拒绝 = 永不抽取（**不**挡 L3 生成）。  
2. **本机 store 骨架**：`userData/companion-l2/yin-personal-memory.json`；schema v1（consent + 空 `memories[]`）；四类条目 normalize 已就绪。  
3. **IPC**：`desktop:yin-personal-memory-get` / `set-consent`；preload `yinPersonalMemory` 桥。

## 不做（本切片）

- Remember 管道（1b）
- What Yin remembers 列表 / Forget UI（1c）
- 层 3 prompt 注入（1d）
- localStorage key；练习云备份；`turns.jsonl` 混桶

## 验收

- Electron 宽屏：首次 unmatched → 层 3 前见 Consent 条；点 Allow / Not now 后 0–1s 内条消失并继续生成或语料 fallback。  
- 二次发送不再弹 Consent。  
- Web / 窄屏：无 bridge，行为与 Slice 0 一致。  
- `userData/companion-l2/yin-personal-memory.json` 写入 consent；`memories` 仍空。
