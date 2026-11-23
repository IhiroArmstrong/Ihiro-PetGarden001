# Task Brief · T104 网页获客转安装包

> **状态**：**排队中** · Brief 待点头 · **无运行时**。  
> **代号**：**T104**。人话：搜索、论坛、Product Hunt 先到网页体验，再引导下载电脑安装包。  
> **槽位建议**：**可选 · 排队中**。依赖 **T95** 有一份可指向的安装包地址之后才写 Download。  
> **类**：营销站改 CTA 时为 **B 类**。发帖本身是运营，不是代码。  
> **不是**：把练习壳挂到 `twinsology.com` apex。**不是** 现在就在宣传站加 Download（现网 Brief **禁止** Download App，直到第一份包可下）。**不是** 换原生壳。

**口令（点头后且安装包 URL 已有）**：`按 T104 Brief 开工网页转安装包`。口令「现在宣传站加 Download」在 **T95** 包地址未锁前 **不执行**。

---

## 0. 大白话

宣传站已经在，用来让人先看见阿寅。练习网页也还在，用来最快试坐。电脑安装包才是 Mac 留下来的钩子。本刀规定：包没准备好时宣传站继续不放下载；包准备好后，网页试坐旁边出现诚实的下载入口，而不是先逼装包。

---

## 1. 地面真相

| 项 | 事实 |
|---|---|
| 宣传站 | `marketing-site/` · 现网 `twinsology.com` · Slice 0–2。**禁止** Download App / 练习壳挂 apex |
| 产品门面 | canonical 计划 `samatia.net`，HTTPS 未绿前不开跳转 |
| 练习壳 | Worker / `?product=1`，与宣传站分开 |
| 桌面前提 | [`task-electron-desktop-scaffold.md`](./task-electron-desktop-scaffold.md)：Web 仍是主力获客 |
| 发包装日 | **T95** 2026-12-08；更新根 `https://updates.twinsology.com/` |

---

## 2. 拍板建议（点头即锁）

1. **漏斗**：发现（搜索 / Reddit r/macapps / Product Hunt）→ 宣传站或练习网页 → 试坐 → 电脑版下载。禁止宣传站首页一进来就只有 DMG。  
2. **Download 开门闩**：须有公证（或至少书面风险接受的）安装包 URL。未锁 URL 时 **不改** Slice 1/2 的「禁止 Download」。  
3. **练习网页保留**：继续当最快体验；下载钮文案诚实（Mac 电脑版，不是 App Store，除非以后另拍）。  
4. **运营清单**（非本仓代码）：PH / r/macapps 发帖模板进 Brief 附录，由人发；Agent 不代发。  
5. **samatia.net**：仍遵守商标闸；本刀不宣布换域。

我认为最合理的是：**T95 包可下之后再加 Download，网页试坐始终保留。** 弱方案是包还没出就在宣传站放空下载（骗点击）。

---

## 3. 明确不做

- apex 挂练习 SPA / workers.dev  
- 为获客改倾诉默认开  
- Agent 用官方账号发 Reddit / PH

---

## 4. 冲突扫描

相邻：营销 Slice 1/2 禁 Download、T87-C 换名、T95 发包、T49。职责 = 获客路径，不是新练习。强度：下载次于「先看见陪伴」。
