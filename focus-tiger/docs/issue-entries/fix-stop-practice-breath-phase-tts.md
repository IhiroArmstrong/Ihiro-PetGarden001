---
ledger: 任何练习中间不要语音播放 inhale / exhale，其它播放可以
kind: progress
status: 跟进中
updated: 2026-10-21
---

T27 实现旁支：`maybeSpeakBreathPhaseCue` 改为恒返回 false、不 `speak`。Arrival / Honesty / Ritual / MicroRitual 调用方保留。`HONESTY_BREATH_*` locale 保留。结束句与其它公告仍走 `maybeSpeakPracticeAnnouncement`。
