# T95 · `/prep/` 更新通道端到端演练清单

> **目的**：在 **2026-12-08** 发包装日前，证明「首个 DMG 装完后，不靠用户手动重装也能收到修复」**成立**。  
> **办理（2026-11-24 已锁）**：**桶 / DNS 一就绪，立刻打第一轮 V_low → V_high**，不要等到 12-08 当周才第一次走。12-01 前再用与发版相同签名彩排一次。  
> **配套**：[`t95-desktop-release-week-checklist.md`](./t95-desktop-release-week-checklist.md) · [`task-briefs/task-electron-desktop-updater.md`](./task-briefs/task-electron-desktop-updater.md)。

**口令**：不发新 T 号。登记 **T95**。

---

## 0. 通过定义（PO 2026-11-24）

同时在 **一台此前未装过本产品的干净 Mac（arm64）** 上：

1. 安装 **较低版本** 的已公证 DMG（**V_low**）。  
2. 应用能从 `https://updates.twinsology.com/prep/` 拉到 **更高版本** 的 `latest-mac.yml`。  
3. Idle 左下出现更新芯片 → 点下载 → 「重启安装」→ 确认后重启 → **V_high** 启动。  
4. `spctl` 显示 **Notarized Developer ID**，首开无 Gatekeeper 阻断。

**未跑通 → 不得写「自动更新已就绪」。**

**现在还不能跑端到端的原因（git 事实）**：T95 Brief 仍写存储桶未建。本清单把「何时跑」锁死：**谁负责 = 会签证书且能写 R2 的人；何时 = 桶通的当天**，Agent 不能代替上传凭证。

---

## 1. 前置（一次配置）

- [ ] Developer ID Application 证书 + 私钥  
- [ ] `notarytool` 凭据 `samatia-notary`（`.p8` 不进仓库）  
- [ ] R2 / `updates.twinsology.com` DNS **已绑**  
- [ ] 本仓库已合 **#1711**（Electron 45.3.1）

---

## 2. 版本与产物

| 角色 | 建议 |
|---|---|
| **V_low** | 例 `1.0.0`，装到干净机 |
| **V_high** | 例 `1.0.1`，**只上 `/prep/`** |
| Feed | **仅** `https://updates.twinsology.com/prep/` |

试包 pack 默认 prep：`desktop/scripts/pack.js`。对客根校验：`npm run build:verify-update-feed`。

---

## 3. 轨道 A · V_low 与 V_high 各公证贴票一遍

见 [`t95-desktop-release-week-checklist.md` §2](./t95-desktop-release-week-checklist.md)。每包：

- [ ] `spctl -a -vv -t install` → **Notarized Developer ID**  
- [ ] Hardened Runtime  
- [ ] `stapler staple` DMG + App  

---

## 4. 轨道 B · 上传 `/prep/`（仅 V_high）

- [ ] 上传 V_high DMG（及 blockmap）  
- [ ] 上传 `latest-mac.yml`，`version` = V_high  
- [ ] `curl -sfI https://updates.twinsology.com/prep/latest-mac.yml` → **200**  
- [ ] DMG URL **200**，长度与本地一致  

凭证不进 Git。

---

## 5. 干净 Mac（人工 · 必做 · 桶通当天）

- [ ] arm64；未装过本产品（或清 App + Application Support）  
- [ ] **不要**用 `desktop:dev` 代替  
- [ ] 装 V_low；确认版本  
- [ ] Idle ≥ 3s；左下桌面更新芯片  
- [ ] 点芯片 0–1s 内 downloading  
- [ ] 确认重启 → V_high  
- [ ] 抽测 Retry / Not now  

开发假通路 `?forceDesktopUpdate=1` **不能**计入通过定义。

---

## 6. 时间表（已锁）

| 何时 | 做什么 |
|---|---|
| **桶/DNS 就绪当天** | **立刻** §3–§5 第一轮 V_low→V_high |
| 12-01 前 | 与发版相同 signing 再彩排 1 次 |
| 12-08 发版周 | 对客根 `/` 上传公开发布包（非第一次摸桶） |

---

## 7. 汇报模板

```text
T95 prep 更新演练 · 日期 ____
V_low: ____  V_high: ____
干净机: 是 / 否
spctl Notarized: 是 / 否
prep/latest-mac.yml 200: 是 / 否
芯片出现: 是 / 否
下载+重启到 V_high: 是 / 否
Gatekeeper 首开: 通过 / 拦
结论: 通过 / 未通过（阻塞项: ____）
```

---

## 8. 相关文件

| 文件 | 作用 |
|---|---|
| [`desktop/updater/updaterRuntime.js`](../desktop/updater/updaterRuntime.js) | 打包后 feed |
| [`src/core/desktopUpdateFeedUrl.js`](../src/core/desktopUpdateFeedUrl.js) | 主机锁 |
| [`task-t95-electron-shell-upgrade.md`](./task-briefs/task-t95-electron-shell-upgrade.md) | T95 Brief |
