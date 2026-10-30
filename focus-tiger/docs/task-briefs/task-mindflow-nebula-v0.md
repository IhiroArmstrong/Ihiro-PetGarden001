# Task Brief · T66 心念流 / 隐迹星云 v0

> **状态**：**已点头**（2026-10-29 PO「合理则办」）。**点头后写代码。**  
> **代号**：**T66**（治理 PR 登记；实现旁支只写 PR 描述）。  
> **类**：**B 类**（可选可见画布 + 菜单开关）。过 **T55** / **C-11**（禁止读心、禁止疗效）。  
> **不是**：真实 embedding / UMAP / t-SNE 投影；**不是** T50 会话摘要；**不是**评测仪表。

## 0. 大白话

倾诉或安静坐着时，小虎旁边可以开一块很小的光点画布。它只跟着三种节奏慢慢动：平常静、你在说、小虎在回。这是意象，不是「看见 AI 在想什么」。默认关，菜单里自己开。

## 1. 目标与非目标

**目标**

1. 约 **180×180px** 圆角画布，挂 `body`，宽屏靠右下、不挡阿寅脸与胸口；**Focusing 隐藏**。
2. **默认关**；⋯ → 偏好里一行「心念流」打开玻璃卡，一个开关。
3. 三种驱动模式（无 embedding）：`rest` / `confide` / `companion_speak`。
4. 画布 `title`（hover）= 意象化免责声明（locale 切片）。
5. 不碰 Confide 发送链；不新增云端请求；不存倾诉原文。

**非目标**

- UMAP、t-SNE、PCA、逐 token 刷新。
- 公案板块预设、新颖度实验（T66 第二步，另 Brief）。
- 判懂不懂、情绪诊断、分数。

## 2. 视觉与位置

- 色：米白 / 淡青 / 浅灰蓝，低饱和；无频闪、无爆炸特效。
- 动画：Canvas 2D 粒子；`requestAnimationFrame`；模式间 **lerp** 速率，禁止整图跳变。
- z-index：**CLUSTER 12**（与热力图同带，低于 Support FAB）；登记 `Z_INDEX.md`。
- `pointer-events: none` 画布本体；偏好面板可点。

## 3. 状态机

| 模式 | 何时 | 粒子行为（象征） |
|---|---|---|
| `rest` | 开关开、Idle、Confide 关 | 极慢漂移 |
| `confide` | Confide 面板开、非 speak 窗口 | 柔和舒展 |
| `companion_speak` | 回复展示后至 TTS 结束或 6s 上限 | 略快、仍柔和 |

存储：`focus-tiger.mindflow-nebula-enabled.v1`（boolean，默认 false）。DEV 重置清。

## 4. 冲突扫描

对照 **AE** Confide、**T42** 不挡脸、**T47** Focusing 收 chrome、Support 受保护路径。

| 轴 | 判断 |
|---|---|
| 强度 | 默认关；无新必选仪式 |
| 语气 | hover 写清「意象化、非精确想法」 |
| 职责 | 不替代安全/觉照/研究开关 |

## 变体矩阵

| 变体 | 预期 |
|---|---|
| 默认 | 关；无画布 |
| 开 + Idle + Confide 关 | rest 画布可见（若实现为仅 Confide 开时显示，须在 PR 写明——**本 Brief 锁定：开且 Idle 即 rest；Focusing 必藏**） |
| 开 + Confide | confide / speak 切换 |
| Focusing | 隐藏 |
| 375 / 宽屏 | 不挡 Sit、不挡 Support |
| en / zh / ja | 切片三语 |

## 点击反馈（0–1 秒）

菜单 → 偏好卡 → 开关：0–1s 内 checkbox 状态变；画布在下一帧显/隐。开关失败 → status 行 polite 提示。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| Confide 关 | 回 rest（仍可见若开关开） |
| TTS 无 bridge | speak 模式用 6s 定时回落 confide |
| 付款/Support 打开 | 画布不压 FAB（z 12） |

## 共用机制核对

不新建 z≥17 遮罩；不碰 overlayBusy 契约。

## 后台网络

不涉及。

## 验收

- 单测：`mindflowNebulaStore`、模式解析、localStateKeys 登记。
- `test:smoke` + 相关 `node --test` 绿。
- tracker：UI 待人工测试（并入下一批批量验收）。

## 第二步（未排期 · Brief 已起草）

新颖度离线实验 → 本机 embedding → 板块预设。SSOT [`task-mindflow-nebula-step2-embedding-presets.md`](./task-mindflow-nebula-step2-embedding-presets.md)（**待点头**；实现旁支 `feature/t66-mindflow-step2-*`，**禁止**复用 v0 旁支）。
