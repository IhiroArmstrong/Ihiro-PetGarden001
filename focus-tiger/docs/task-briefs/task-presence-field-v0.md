# Task Brief · 智能场 v0 / Presence Field（同坐耦合场）

> **状态**：**待点头**（2026-11-02 起草）。**点头后才改 `src/`。**  
> **工程名**：`presence-field`。对外：**智能场 / Presence Field**。  
> **类**：**B 类**（可选可见氛围 + 菜单开关；会改 Focusing 金晕观感）。过 **T55 / C-11**（禁止读心、禁止疗效）。  
> **T 号**：交给治理会话登记。实现旁支与 PR 只写「智能场 v0 / presence-field」，**禁止自编 T71**。  
> **不是**：T66 心念流；**不是** T66 第二步 embedding / UMAP；**不是** token 熵曲线；**不是** 3D 阿寅；**不是** Focus Confidence 打分；**不是** `presence-signals` 倾诉观察账本。

## 0. 大白话

坐下专注时，金晕可以慢慢从「各自跳」收到「同拍」。这是同坐的氛围，不是监工、不是脑波、不是疗效。默认关。不行就同一开关藏掉。倾诉旁边那团光点仍是心念流，本刀不管。

## 1. 目标与非目标

**目标（第一刀只做这些）**

1. Focusing **进行中**显示同坐场：用现有 `LightProgression` 金晕（`#light-progression-rim` / `#light-progression-fx`）被一组相位（12–24，禁止几百）轻轻拉开或收拢。  
2. **默认关**。⋯ → 偏好一行「智能场」，玻璃卡一个开关。  
3. 离散状态机：`scatter` → `lock` → `rest`；展示门槛的离开 → `detune`；开关关 → `off`。  
4. 可选轻声：只调制**已经在播**的氛围乐滤波 / 音量包络。不新做曲库。铃仍走 T39 默认关。T27 结束句朗读不动。  
5. Hover / `title` 一句：意象化氛围，不是读心、不是疗效（locale 切片）。  
6. 失败或你觉得不好受：同一开关关掉 = 零额外节点、零额外声。不必删代码。

**非目标（同一 PR 禁止）**

- UMAP / PCA / 真 Hidden States / GPT-2；T66 第二步阶段 B **不执行**。  
- Token 熵数字、曲线坐标轴、「你这句话很不确定」文案（第二刀另 Brief）。  
- 可旋转流形小窗（第三刀，须新 Brief、新方法）。  
- 用 3D GLB / 相机推拉替换 2D 阿寅 PNG。  
- 改 `EmotionController`、阿寅序列、Confide 发送链。  
- 用键鼠 / 切窗 / 可见性估「是否真专注」。  
- 用户主界面出现 K / 噪声 / Kuramoto / entropy / 脑波字样。  
- T68 纪念画、T66 embedding。

## 2. 与已有「presence」三词划界（强制）

| 现网词 | 是什么 | 本刀 |
|---|---|---|
| `presence-signals` / `focus-tiger.presence-signals.v1` | 倾诉观察账本 | **禁止读写** |
| `presenceBoost`（`LightProgression.updateFocusGlow` 入参） | 已有金晕亮度加成 | 可继续吃同一 `focusLevel`；**禁止**另造第二套全屏光 |
| `ImmersivePresenceUI` | Focusing 陪伴入口条 | **不替代、不藏死**；场不是 chrome |
| 本刀 `presence-field` | 同坐耦合氛围 | 新 key：`focus-tiger.presence-field-enabled.v1` |

## 3. 视觉与工程落点

- 新目录：`focus-tiger/src/effects/presence-field/`（kebab-case）。驱动器只调金晕相位 / 明暗 / 允许在 `#light-progression-fx` **内**加少量晕瓣子节点（N=12–24）。  
- **禁止**再叠一套全屏 Shader / 独立 WebGL / GSAP。  
- **禁止**挡脸：不盖 `#sprite-stage` 中心；晕仍在外围。  
- 画布或晕瓣：`pointer-events: none`。  
- z：场跟 LightProgression FX **同带 z=4**（`Z_INDEX.md` 已有 `#light-progression-fx`）。偏好玻璃卡 z=15（同心念流偏好）。二者都 **低于 Support FAB z=24**。登记 `Z_INDEX.md` + `zIndexLayers.js`。  
- 场 **不是 chrome**：T47 专注中收控件时场仍可在；⋯ 逃生舱仍可唤出。T45 少数字仍少。  
- 心念流：Focusing **继续藏**。本场 **Focusing 才显示**。Idle / Arrival / Recover 文案条期间无场（`off` 或仅 detune 瞬间）。

## 4. 状态机（离散；不估「是否真专注」）

| 模式 | 何时 | 序参量目标 \(r^\*\) | 用户看见 |
|---|---|---|---|
| `scatter` | 进入 Focusing 后约 0–45s | 0.15–0.35 | 金晕略不齐，脉动各跳各的 |
| `lock` | 过阈值（滞回：进 ≥0.62、出 &lt;0.40） | 0.75–0.95 | 一次可感到的收拢 |
| `rest` | 锁相后 | 保持高；视觉振幅几乎退到背景 | 极静；T45 仍少数字 |
| `detune` | **仅**已达 Recover **展示门槛**的离开（&gt;60s；沿用现链） | 短暂降 \(r\) | 失谐；**不弹窗、不说话** |
| `off` | 开关关 / 非 Focusing / 功能藏 | — | 零额外节点、零额外声；金晕回库存 `updateFocusGlow` |

**滞回**：避免在 0.62 附近抖。进 `lock` 须 \(r\) 升过 0.62；回 `scatter` 须掉到 0.40 以下（`rest` 不因微扰掉回 scatter）。

**Across tools / 去别处练习**：禁止用 `visibilitychange` / 失焦 / 切窗驱动 `detune`。短离 **SB-01**（&lt;20s）与 **SB-02**（20–60s）保持静默，场不跟。

## 5. 动力学（实现对用户不解释）

- \(N\) 相位 \(\theta_i\)，N ∈ [12, 24]。  
- \(\dot\theta_i = \omega_i + K r \sin(\Psi - \theta_i) + \sigma \xi_i\)；\(r e^{i\Psi} = \frac1N\sum e^{i\theta_j}\)。  
- \(K\) 由模式给定，**不是**用户主滑杆。  
- 内部测试：`?presenceField=1&presenceFieldDebug=1` 才出 K / 噪声滑杆（英文内部标签即可；不进三语文案）。`?presenceField=1` 仅当次会话强制开场，**不**写 localStorage，除非用户又点开关。

## 6. 声（可选）

- 仅当氛围乐**已在播**：用 \(r\) 轻轻推滤波 / 音量包络。  
- 氛围未播：零额外声，不算失败。  
- 禁止：新生成曲库、自动响铃、改 T39 铃默认、改 T27 TTS。

## 7. 存储与重置

- Key：`focus-tiger.presence-field-enabled.v1`（`'1'` = 开，缺省 / 删除 = 关）。  
- 必须进 `localStateKeys` 白名单；DEV 重置须清。  
- **禁止**占用 `focus-tiger.presence-signals.v1`。

## 8. 冲突扫描（对照相邻已上线路径）

相邻：T66 心念流（#1475）、T39 铃默认关（#1393）、T45 静坐少数字（#1402）、T47 专注中收控件（#1404）、Recover / SB-01/02（场景 B）、Support 受保护路径、练习观察纸、诚实补登、Across tools。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 默认关；无新必选仪式。被动失谐（detune）轻于主动 Recover（不弹窗、不说话）。短离仍静默。 |
| **b. 语气** | 观照场；禁止「你该专注 / 你走神了」。Hover 写清意象、非读心、非疗效。 |
| **c. 职责** | 不替代心念流（倾诉旁、Focusing 藏）。不替代练习观察纸。不替代未做的 Focus Confidence 打分。不替代 Recover 文案。 |

**无用户路径重叠到必须停手的死结。无付款路径。**

## 9. 变体矩阵（A10）

本次触及练习进行中氛围、宽窄视口、三语入口文案，矩阵必填。

| 变体 | 入口 / 前置 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 默认关 | 任意练习、任意视口 | 无智能场节点；金晕仅库存呼吸；无额外声 | 本刀单测：默认关无 DOM |
| 开 + Idle | ⋯ 打开关 | 开关开着但 **无场**（Idle 不显示） | 本刀单测 |
| 开 + Arrival | Notice/Choose | 无场 | 本刀单测或场景钩 |
| 开 + Sit Focusing | 坐下计时 | 0–45s `scatter`，其后可 `lock`→`rest`；不挡脸 | 本刀单测 + 待人工 |
| 开 + 呼吸 / 开放式静坐 Focusing | 同类 Focusing | 与 Sit **同一套场**（不按练习种类换算法） | 单测：只认 Focusing 布尔 |
| 开 + 微仪式 / Honesty | 非 Focusing | 无场 | 单测 |
| T47 收控件 | Focusing 宽/窄 | 场仍可在；⋯ 仍可唤出；不把场当 chrome 收掉 | 待人工；单测「Focusing 有场」 |
| T45 少数字 | Focusing | HUD 数字策略不变；场不把时间写回来 | 既有 T45 测仍绿 |
| T39 铃关 | 任意 | 场不得响铃 | 单测：不调用铃 API |
| 氛围已播 | Focusing + 开关开 | 可轻推包络；不换曲 | 待人工 |
| 氛围未播 | Focusing + 开关开 | 只有光，无新声 | 单测 |
| 375 / 宽屏 | Focusing | 不挡 Sit/Support；晕在外围 | 待人工 |
| en / zh / ja | 菜单行 + 偏好卡 + hover | 切片三语一致键；无 Kuramoto 字 | `locale` 切片 + 既有 ja 守卫 |
| Recover &gt;60s | 已 Focusing 且开 | 一次 detune，不弹窗 | 单测滞回 + 模式 |
| SB-01 / SB-02 | 短离 | 场不 detune、无新表面 | 单测：短离不切 detune |
| Across tools | 切窗去别处 | **不** detune | 单测：visibility 不驱动 |
| 开关再关 | Focusing 中关掉 | 下一帧拆节点；金晕回库存 | 单测：关即拆 |
| 付款 / Support | FAB / 三卡 | 场不压 FAB、不改 CTA | 不改付款代码；z=4 |
| `?presenceFieldDebug=1` | DEV | 才见 K 滑杆 | 单测：无 debug query 无滑杆 |

## 10. 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化三态 |
|---|---|---|
| ⋯ / 抽屉「智能场」 | 玻璃卡展开；开关可见（同心念流行） | — |
| 偏好开关打开 | checkbox 立即勾上；若当前 **Focusing**，下一帧出现场；若 Idle，只记住偏好、**仍无场** | 挂起：无额外转圈（本地同步写）。成功：勾上。失败：status `role=status` 礼貌提示（切片 `PRESENCE_FIELD_SAVE_FAILED`） |
| 偏好开关关闭 | checkbox 立即取消；场节点当帧拆除 | 同上三态 |
| 关闭钮 / Esc / 点外 | 卡收起；场是否显示只跟开关+Focusing，不跟卡是否打开 | — |
| 金晕 / 晕瓣本身 | 不可点（`pointer-events: none`） | 不在白名单的沉默不算点击；无点击 |
| Debug 滑杆 | 仅 debug query；拖动 0–1s 内晕的齐度变 | 不写盘 |

设计静默：短离无 detune = **SB-01 / SB-02**。切窗无 detune = 本 Brief 新设计静默，实现时在 `SILENT_BEHAVIORS.md` **加一行**（建议 `SB-presence-field-no-blur-detune`，编号按表下一条），禁止无编号的「没反应」。

## 11. 边缘状态（A14）

| 边缘状态 | 预期（含 0–1 秒） |
|---|---|
| localStorage 不可写 | 开关回弹；status 失败句；不假装已开 |
| DEV 重置 | key 清除；下次启动关 |
| `shouldSuppressRuntimeGlow`（里程碑等烧录动画） | 场暂停或振幅归零，不跟烧录抢光 |
| Support / 会员 / 请茶打开 | 场不抢点击、不改已购淡化、不开 Stripe |
| 心念流同时开 | Idle：只见心念流。Focusing：只见智能场。禁止两画布叠在同屏抢戏 |
| 模型未就绪 / Confide | 无关；本刀不碰发送链 |
| 已购 Lifetime | 不受影响 |
| 窄屏 Focusing | 场在；底栏收控件规则仍走 T47 |
| debug 滑杆在生产无 query | 不出现 |

## 12. 共用机制核对（COLLAB 七 · 结论句）

- **overlayBusy**：本刀不新增计入 `overlayBusy` 的面板字段。偏好卡同心念流，打开时**不**挡 Focusing 金晕；**不**登记新的 sceneAnim busy 源。切语问候路径不受影响。  
- **HUD 呼吸**：场不成为 HUD 呼吸驱动者。左上角计时仍只走既有 FocusSession / T45。核对 `SHARED_RESOURCES.md` §4.2 后：**无需**接入 `overlayBreathing`。  
- **z / dim**：场 z=4，**不是** z≥17 遮罩。Idle 常驻 chrome dim 消费者（Support FAB / Ambient / 倾听耳 z=24）**不受影响**。偏好卡若用既有玻璃卡 dim，不得把 `#yin-support-modal` 写成 inline 18/19。  
- **新建可点击叠层**：场本体不可点。偏好卡须走与心念流同类的 overlay 登记（O-04）：实现时点名 `OVERLAY_UI_SURFACE` 新增 `presenceFieldPref`（或同等 id）及三态键；本 Brief 锁定「要登记」，禁止只开卡不进表。

## 13. 后台网络

不涉及。无新请求、无预取、无模型下载。

## 14. 受保护路径（动手前影响面）

- **作用于**：`#light-progression-rim` / `#light-progression-fx` 子节点；氛围乐包络；⋯ 次级菜单多一行；localStorage 新 key。  
- **是否包含受保护路径**：**否**。不改 `#yin-support-fab`、`#yin-support-modal`、三卡 CTA、任一 `/api/create-*-checkout-session`。  
- **排除**：z=4 ≪ 24；`pointer-events: none`；菜单只打开偏好卡，不打开 Support。

## 15. 验收（点头后实现）

**单测（撤掉修复会红）**

1. 默认关：无智能场 DOM。  
2. 开且 Focusing：有场；开且 Idle：无场。  
3. scatter→lock 滞回（0.62 / 0.40）不抖。  
4. 开关关：拆节点。  
5. storage key 在白名单；DEV 重置清除。  
6. 无 debug query：无 K 滑杆。  
7. visibility / 短离不切 `detune`。

**命令（实现收尾，本 Brief 回合不跑）**：`node --test` 本目录；`npm run test:payment-contract`（因动了共享光层，须证明付款可点未被误伤）；`npm run test:smoke` 一次。

**tracker**：实现 PR 写 `docs/tracker-entries/feature-presence-field-v0.md`，状态待人工测试。

## 16. 点头后才碰的文件（预告，本回合不写）

- `src/effects/presence-field/*`  
- `src/effects/LightProgression.js`（只加驱动钩，禁止重写 Arrival/Recover）  
- `src/ui/PresenceFieldPreferenceUI.js` + 菜单 proxy `presence-field`  
- `src/locales/slices/presence-field.json`  
- `src/core/localStateKeys.js`（及 test）  
- `docs/Z_INDEX.md` · `src/ui/zIndexLayers.js` · `SHARED_RESOURCES.md` 一行 key  
- `SILENT_BEHAVIORS.md` 一行切窗不 detune  
- 对应 `*.test.js`

## 17. 开工闸

**须 PO 书面点头本 Brief**（或「按智能场 v0 Brief 开工」）后才改 `src/`。口令「立刻开工」不能跳过本闸。

点头后的实现口令建议带 **「大任务」**（跨 effects / UI / locale / 单测）。

## 18. 第二刀 / 第三刀（本 PR 不做）

- **第二刀** 倾诉天气（熵→雾，无数字）：第一刀合入且你点过「场本身好受」之后。  
- **第三刀** 可旋转流形画布：须**新 Brief、新方法**；禁止口令复活 T66 第二步。
