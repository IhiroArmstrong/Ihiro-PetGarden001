# feature/taste-layer-boot-prefetch

| 品味层开机预取与版本检查错峰 | 纯后端 | 仅单元测试覆盖 | 无新按钮。冷启动后约 12 秒、且到达/诚实/回顾叠化不在播时，才拉品味层和网页 `version.json`。叠化还在就再等。失败仍用本地表，不挡 Sit。`?tasteLayer=0` 仍关闭品味层。单测：`tasteLayerBootSchedule.test.js`。慢网观感仍须以后人工看首段呼吸是否掉帧。 | — | — | — | `?product=1` | 2026-10-01 |
