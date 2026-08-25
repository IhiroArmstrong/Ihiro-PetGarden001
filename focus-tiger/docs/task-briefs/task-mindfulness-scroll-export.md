# Task Brief · 静默画卷 · 深练 / 年终纪念卡（Web2 导出）

> **状态（2026-08-24）**：待排期 · 排在 **`task-journey-daily-card`** 之后。  
> **接哪里**：C 轨 **记忆小册** 页签（`FOCUS_COINS.md` §7）+ 增长包「永久档案靠 Save image 带出 App」（`task-journey-daily-card.md`）。  
> **拒 Web3**：用户感知为「保存一幅修行纪念画卷」，**不是** mint / 上链所有权。

---

## 一句话目标

在用户完成**一段深练期**（如累计达阈值）或**自然年末**，将一段时间内积累的 Quiet Line 观察句、Journey 摘要与阿寅寄语渲染成**一张可 Save image 的竖版画卷/线装书卡**，本地下载；可选纳入邮箱 OTP 备份快照（**仅**走已拍板 A 轨练习记忆备份 + 用户同意，**不**写公链）。

---

## 产品契约

| 项 | 口径 |
|---|---|
| 对外名 | **静默画卷** / **Mindfulness Scroll** · 副标题可用「岁月印记」 |
| 触发（首刀二选一，建议先做 B） | **A** 每年 12/31 本地日首次打开 Idle 且当年有 ≥N 条 Journey/Quiet Line；**B** 统一 practice score 或 lifetimeMinutes 跨档（如 score≥42 或 3000 分钟）且用户主动在 **记忆小册** 页签点 **Save scroll** |
| 内容 | 期段起止、累计分钟、精选 Quiet Line（最多 7–12 句，**须**本地已有归档；无则降级为时长 + 一句固定寄语） |
| 动作 | **Save image**（PNG）；复用 Daily Card canvas 管线；可选 `navigator.share` |
| 档位 | **免费** |
| 禁止 | 链上元数据、wallet、对外「NFT 所有权」、未同意上云的全文上传 |

---

## 范围

**做**：

1. Quiet Line / Journey 只读聚合 helper（不分析、不打标签）。  
2. 画卷 layout 组件 + 导出。  
3. Collections **记忆小册** 页签：历史 scroll 列表（本地 id + 缩略 metadata）+ Save。  
4. 单测：无数据不崩；有条目可生成 buffer。

**不做**：

- 一键发 IG/X。  
- 付费墙。  
- 实时云渲染；全量反思原文默认不出设备（备份扩展另立项）。

---

## 依赖

| 前置 | 必须 |
|---|---|
| `task-journey-daily-card` | **是** — 共用 canvas / Save image 管线 |
| Journey Log D′ | 已合 — 有本地留痕可读 |
| Quiet Line 日句归档 | 查 `Reflection` / 本地池是否可按日索引；缺口须先补只读 API |

**预估**：5–8 人日（含 Quiet Line 按日索引若缺）。

---

## 建议分支

`feature/mindfulness-scroll-export`

---

## 后台网络

**不涉及**自动后台请求。用户点 Save = 本地生成。若将来「备份画卷 PDF」走练习记忆 A 轨，须单独 Brief + Privacy 明示 + 内容相同跳过写入（`BACKGROUND_NETWORK.md`）。
