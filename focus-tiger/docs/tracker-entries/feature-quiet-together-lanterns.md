# feature/quiet-together-lanterns

| Quiet Together ∪ Global Lanterns MVP | UI可见 | 待人工测试 | **前置**：生产 Worker `/api/lantern-presence` 已部署。`http://127.0.0.1:5173/?product=1` 硬刷新；Privacy 默认开。**主路径**：**硬刷新 Idle** 约 2.5s 见灯点或人数（无需 Sit→Rise）；宽屏 caption 须在热力图簇**上方**可读。另一标签 Sit 后 Idle 人数 +1；Focusing 内须消失；Rise 约 1s 内减 1。**对照**：Privacy 关 / `?quietTogether=0` → 不请求、不画。**不测 Circle。** | **2026-09-04 用户书面**：冷启动不见灯火；caption 被热力图盖住；双端 Sit 计数 2 已验证。fix `quiet-together-lanterns-idle-peek-layout` | — | — | `fix/quiet-together-lanterns-idle-peek-layout` | 2026-09-04 |
