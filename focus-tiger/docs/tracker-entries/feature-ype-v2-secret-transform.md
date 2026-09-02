# feature/ype-v2-secret-transform

| YPE V2 秘密变换（白名单 insight + algorithmVersion） | 纯后端 + 缓存 | 待人工测试 | **主路径**（同意已开且样本≥10）：Idle ingest 响应 Pack 可含 `returns_often` / `reflects_often` 字符串；`companionStyle` 仍等于本机选档；DevTools 响应 **无** `algorithmVersion`。**回流**：关同意 → Pack key 清除；再开同意后仍不阻塞 Sit。**禁止**：用完成率改档；Confide Send 0–1s 变慢；insight 进 L3 prompt。未知 Pack 键整包丢。 | — | — | — | Privacy 第四条 ON；Worker 须已绑定并部署 V2 | 2026-09-02 |
