# T95 · 桌面发版周检查单（签名 → 公证 → 贴票 · 与存桶分开）

> **代号**：T95（电脑壳升级 + 更新通道）。  
> **发包装日**：2026-12-08。Brief：[task-t95-electron-shell-upgrade.md](./task-briefs/task-t95-electron-shell-upgrade.md)  
> **权威彩排纪录（2026-11-16）**：[feature-t95-developer-id-signed-probe.md](./tracker-entries/feature-t95-developer-id-signed-probe.md) — **不等于** 发版周自动完成；每次发版须重跑本单。

---

## 0. 两条轨道（不要混成一步）

| 轨道 | 何时做 | 产出 | 与 2026-11-16 试包的关系 |
|---|---|---|---|
| **A · 签名 → 公证 → 贴票** | 每次要打 **可 Gatekeeper 安装的 DMG** 时 | 本机 `desktop/release/` 下已签、已公证、已贴票的 DMG + `.app` | 试包 submission id `600e233b-a522-4e2f-8624-965026126752` 仅证明流程可走通；**发版周必须新 pack、新 submit** |
| **B · 存桶 + `/prep/` 更新源** | R2 已建、DNS 已绑 **之后**；与轨道 A 可同周但 **命令与路径分开** | `https://updates.twinsology.com/prep/` 上的 `latest-mac.yml` + DMG（及 blockmap） | 试包 **未** 上传存储桶；对客根 `/` 在公开发布前仍禁止放未公证包 |

未走完轨道 A，不得把 DMG 写成「客户可装」。未走完轨道 B，不得把「内部 1.0.0→1.0.1 更新」写成已验证。

---

## 1. 轨道 A 前置（会签证书机 · 一次配置）

1. **Developer ID Application** 在登录钥匙串，私钥配对；叶子证书信任 = **使用系统默认**（不要「始终信任」）。
2. **公证档案** `samatia-notary`（App Store Connect API 密钥 · App 管理权限）。`.p8` **不进仓库**。  
   ```bash
   xcrun notarytool store-credentials samatia-notary \
     --key /path/to/AuthKey_XXXX.p8 --key-id <KEY_ID> --issuer <ISSUER_UUID>
   ```
3. **贴票**：`xcrun stapler`（Command Line Tools 即可；**不需要**为贴票单独安装完整 Xcode）。

---

## 2. 轨道 A · 可重复命令（试包 / 发版周彩排）

在仓库根：

```bash
cd focus-tiger/desktop
```

### 2.1 一条龙（默认：打试包 + 公证 + 贴票 + 模型探针）

```bash
npm run prep:sign-notarize-staple
```

跳步（例如 DMG 已打好、只补公证）：

```bash
FT_PREP_SKIP_PACK=1 npm run prep:sign-notarize-staple
FT_PREP_SKIP_PACK=1 FT_PREP_SKIP_NOTARIZE=1 npm run prep:sign-notarize-staple   # 只贴票 + 探针
```

### 2.2 分步（与脚本等价）

| 步骤 | 命令 | 通过标志 |
|---|---|---|
| 签名 + 打试包 | `npm run pack:prep` | `release/t95-sign-note.json` → `developerIdSigned` / `hardenedRuntimeVerified` 为真 |
| 公证 | `npm run notarize:prep` | 终端 `status: Accepted` + `accepted id=…` |
| 贴票 | `npm run staple:prep` | `stapler staple` 对 DMG 与 `.app` 均成功；`notarized` 为真 |
| 真界面探针 | `node scripts/probePackagedLlamaGui.js` | `guiProcessLoaded=true` |

**对客发行包**（非 `FT_T95_PACK_PROBE`）用 `npm run pack` 打出 DMG，再执行 **同一套** `notarize:prep` → `staple:prep`，并额外跑 [plan-a-live-ship-release-flags.md](./plan-a-live-ship-release-flags.md) 机械闸。

### 2.3 发版周签字前快速核对

```bash
codesign --verify --deep --strict "release/mac-arm64/Samatia.app"
xcrun stapler validate "release/mac-arm64/Samatia.app"
spctl --assess --type execute -vv "release/mac-arm64/Samatia.app"
```

期望：`spctl` 为 **Notarized Developer ID**。任一失败 → 不得进入轨道 B 上传。

---

## 3. 轨道 B · 存桶 + `/prep/` 更新源（与试包公证分开登记）

**现状（文档锁定）**：`updates.twinsology.com` 主机与对客根路径已锁；**R2 桶与对象上传未在本仓库完成**。Brief §5.3 与 [RISK_REGISTER.md](./audit/RISK_REGISTER.md) RR-03 仍适用，直到 PO 确认桶可用。

### 3.1 上传范围

| 路径 | 允许内容 | 禁止 |
|---|---|---|
| `https://updates.twinsology.com/prep/` | 已公证 + 已贴票 **内部** 包；`FT_UPDATE_FEED_URL` 指向此前缀的试包 | 未签名 / 未公证 DMG |
| `https://updates.twinsology.com/`（根） | **公开发布日** 对客包 + `latest-mac.yml` | 在 12-08 前用根地址做试传；未公证包 |

打包时默认更新地址校验见 `npm run build:verify-update-feed`（对客根）。试包探针默认 feed：`pack.js` 内 `https://updates.twinsology.com/prep/`。

### 3.2 上传后检查（桶就绪后每次执行）

1. 浏览器或 `curl -I`：`https://updates.twinsology.com/prep/latest-mac.yml` 返回 200（generic provider）。
2. yml 内 `path`/`url` 指向的 DMG 可下载，大小与本地 `release/*.dmg` 一致。
3. 旧内部包（较低 version）启动后，在 Idle 见更新芯片 → 下载 → 「Restart to install」（见 Brief §5.2 项 5 与 [task-electron-desktop-updater.md](./task-briefs/task-electron-desktop-updater.md) 分层 C）。

**PO 办理（2026-11-24）**：桶就绪**当天**须在干净 Mac 走完 **V_low → V_high**（不要拖到 12-08 当周才第一次跑）。逐步清单：[t95-prep-update-e2e-rehearsal.md](./t95-prep-update-e2e-rehearsal.md)。

**本仓库暂未包含** R2 上传脚本；上传凭证不进 Git。上传操作记在 PO 侧运行日志，不替代 TEST_TRACKER 行。

### 3.3 与轨道 A 的衔接

```text
轨道 A 完成（本机 release 已贴票）
        ↓
轨道 B（人工/基础设施：上传 DMG + latest-mac.yml 到 /prep/）
        ↓
壳回归：1.0.0 → 1.0.1 仅命中 /prep/
```

---

## 4. 相关文件

| 文件 | 作用 |
|---|---|
| [desktop/scripts/runPrepSignNotarizeStaple.js](../desktop/scripts/runPrepSignNotarizeStaple.js) | 试包流水线编排 |
| [desktop/scripts/notarizePrepDmg.js](../desktop/scripts/notarizePrepDmg.js) | `notarytool submit --wait` |
| [desktop/scripts/staplePrepArtifacts.js](../desktop/scripts/staplePrepArtifacts.js) | `xcrun stapler staple` DMG + App |
| [src/core/packSignatureInspect.js](../src/core/packSignatureInspect.js) | 签名/贴票/公证输出解析 |
| [plan-a-live-ship-release-flags.md](./plan-a-live-ship-release-flags.md) | 对客 pack 前机械闸 |