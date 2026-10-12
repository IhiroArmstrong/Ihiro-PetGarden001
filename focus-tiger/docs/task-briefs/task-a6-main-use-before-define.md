# Task Brief · A6 `main.js` 先用后定义静态检查

> **状态（2026-10-13）**：**PO 已点头 · 开工**（口令「立刻开工：A6」；规格锁在盘点表 `root-cause-audit-2026-10-12.md` §4 A6）。  
> **类**：**A**（静态检查；不改用户可见路由 / 回复 / 等待）。  
> **依赖**：A5 启动冒烟已合 [#1186](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1186)。

## 一句话目标

`src/main.js` 再写出 #1139 那种「函数里读尚未 `let` 的变量」时，`test:smoke` 必须红。现存 23 个符号逐条封顶登记；帽子只减不增。

## 范围（in）

- ESLint `no-use-before-define`（仅 `variables`；函数声明豁免）
- 夹具：#1139 `onboardingHints` overlayBusy 写法必须报错
- 豁免表 `scripts/main-use-before-define-exemptions.js`
- 接到 `test:smoke`（`npm run lint:main-use-before-define`）

## 范围（out）

- 不拆 `init()`、不把 23 个绑定提前声明（A7）
- 不改产品运行时、Support / Stripe、overlay dim、z-index

## 点击反馈（0–1 秒）

不涉及可点击交互。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层。  
不改 `#yin-support-modal` / Support FAB / Stripe CTA。不涉及后台网络。

## 冲突扫描

无用户路径。相邻场景（冷启动 / Sit）画面不变。

## 已好清单

- A5：`pre-push` 启动冒烟仍跑
- 现存违例有封顶；新名字或同一名字多一处 → 红
- 夹具去掉 `onboardingHints` 先用后定义则夹具检查红

## 验收

1. 夹具含 #1139 写法 → lint 报 `onboardingHints`。
2. 函数声明先调用后定义 → 不报。
3. 当前 `src/main.js` 与豁免表 23 名 / 67 次对齐。
4. `npm run test:smoke` 绿。
