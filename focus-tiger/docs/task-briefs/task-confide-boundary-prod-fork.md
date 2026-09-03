# Task Brief · Confide boundary 模板生产分叉

> **状态（2026-09-03）**：审定句已锁 · **本旁支 Worker 源表**。生产 Redeploy 另须口令「部署」。父概念 `ANTI_PLAGIARISM_LAYER.md` §3.1 · overlay `task-confide-copy-overlay.md`。  
> **硬边界**：只换 `CONFIDE_BOUNDARY_RESPECT` **EN value**。路由 / E′ 正则 / `data-source=boundary` / ja·zh / locale 冻表 / corpus **不改**。

## 审定句（本刀权威）

| 面 | EN |
|---|---|
| **Worker / overlay** | `Nothing needs to be said. Yin is still here.` |
| **客户端 locale 冻表**（杀开关 / 没网） | `We can leave it unspoken. Yin is here.` |

**为什么这句**：不贴心理标签（禁止 curious）；不催「准备好再说」；与在场分叉 `nothing needs to begin` 平行但动词不同（said ≠ begin），QA 可一眼分开两条路由。

## 已拍板

1. 只分叉 EN。ja / zh 仍冻表。  
2. 禁止把审定句写回 `src/locales/*.json`。  
3. 现网生效 = Redeploy；未部署时 curl 生产仍为旧句。

## 冲突扫描

对照 AE 边界尊重 / 陪伴在场。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 仍 0–1 秒模板；Send 不待网 |
| **b. 语气** | 观照许可 + 在场；不是教练、不是诊断 |
| **c. 职责** | 仍 `boundary`；≠ `companion_presence`（begin） |

**无冲突。**

## 点击反馈

Share 边界句：0–1 秒内 `data-source=boundary`。有网 overlay 后见审定句；`?tasteLayer=0` 见冻表句。不出现「正在下云端句库」。

## 后台网络

**不新增请求。** 仍走既有 `/api/confide-copy` 预取槽。
