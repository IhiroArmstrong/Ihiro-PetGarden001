# fix/leave-trace-three-state

| 留痕失败窗口保持 / 云端三态 | 界面 | 待人工测试 | **测**：`node --test src/core/focusCircleWitness.test.js src/ui/FocusCircleWitnessLeaveUI.test.js`。人工：入圈后 Rise 留痕 → 选句；成功仍关窗。失败（断网或未部署 KV）须见原因句且选句仍在，可再点。等待时见「正在留下」类 pending。 | — | — | — | `src/ui/FocusCircleWitnessLeaveUI.js` | 2026-11-21 |
