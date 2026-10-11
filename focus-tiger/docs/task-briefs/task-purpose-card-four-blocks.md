# Task Brief · 问号简介卡四层排版

> **状态**：2026-10-11 PO 点头（按这份 Brief 开工）。只重整层次和列表样式，不改已定稿句子。  
> **类**：B 类（用户打开「?」后看到的层次、链接形态、设备说明长短会变）。  
> **触发**：2026-10-11 设计师四层结构 + 线框。布局采纳；线框里的新口号、新版权句不采纳。

## 要解决的事

Idle 点「?」后的 `#onboarding-app-purpose` 把理念正文、免责摘要、桌面内存说明、帮助中心链、Privacy 小按钮和版权混在一张卡里，链接样式不统一。

改成自上而下四块，点击去向不变。

## 四块（锁定）

| 次序 | 块 | 用户看到 | 行为 |
|---|---|---|---|
| 1 | 品牌 | 现有标题与正文，视觉上分成标题、理念短句、本地优先一句。去掉斜体堆砌。 | 只读 |
| 2 | 设备说明 | 仅 Electron。柔和通知卡：标题 + 1–2 句。 | 只读；Web / 手机 Safari 整块不出现 |
| 3 | 操作列表 | 三行，右端同一箭头：Help Center；Medical disclaimer；Privacy | 每行一点即走，见下表 |
| 4 | 收尾 | 现有版权三行 + **Got it** | Got it 关闭简介卡 |

### 操作列表（0–1 秒）

| 行 | 0–1 秒内 |
|---|---|
| Help Center | 简介卡让位，出现帮助中心目录。禁止和简介卡叠成两层（场景 AX）。 |
| Medical disclaimer | 出现现有 `#onboarding-wellness-detail` 全文（含 diagnose / treat / cure / prevent）。不新做 Modal。 |
| Privacy | 出现现有 `#onboarding-privacy-sheet`。点空白仍是简介卡和隐私页一起关掉。 |

免责一行摘要（现在的 “mindfulness tool, not medical or clinical therapy”）留在第三块 Medical 行上方，打开「?」后不用再点就能看见。全文仍在详情卡里。

## 文案：保持现句

不改这些已定稿句子的意思，只改排版：

- 标题 `What Focus Tiger is`
- 正文：*A quiet digital culture for people who want to live more consciously.* / Practice alone. / Grow quietly. / Meet others who do the same. / Local first: no ads, no data mining. Your reflections stay on this device.
- 免责摘要 + 详情全文
- 版权：`Focus Tiger™` / `Created by Ihiro Armstrong / Twinsology` / `© 2026 Ihiro Armstrong. All rights reserved.`
- 帮助中心链、Privacy、Got it 的现有用词（三语切片）

设备说明可以收成两句，但必须仍写明：Mac 与 Windows、8 GB 及以下、本地陪伴模型默认隐藏、为的是减轻内存压力。Web 不出现这块。

## 明确不做

- 不把口号改成 “A quiet space for mindful flow” 或 “conscious living”。
- 不把 “no data mining / stay on this device” 收成 “Private”。
- 不加 `v1.0`，不改版权句。
- 不把 Five moments、今日方向加回这张卡（今日方向已在菜单；卡上入口保持隐藏）。
- 不改帮助中心目录、隐私页正文、免责详情正文。
- 不涉及后台网络。

## 冲突扫描（场景 W / AX / Y）

- **W**：简介仍含 no ads、留在本机；免责摘要仍在卡上可见；Privacy、Got it、版权三行仍在；桌面内存块仍仅 Electron。与 W 无强度或语气冲突。
- **AX**：帮助中心仍从这条链进入，且不与简介卡叠层。只统一成列表行。
- **Y**：问号卡上的 Five moments 链现网已经不在这张卡上。本任务不恢复、不删除菜单入口。

## 验收

1. `?product=1` Idle 点「?」→ 0–1 秒内见四块：理念、（仅桌面）通知、三行箭头列表、版权 + Got it。
2. 三行分别打开帮助中心、免责详情、隐私页；返回后仍是这张简介卡。
3. Web 不见桌面内存通知。Electron 可见，且写明 8 GB、默认隐藏。
4. 375 可滚动、可关。Rise 后再开仍是四块。
5. 文案键仍走 locale 切片；三语对齐。单测更新简介卡结构契约。

## 共用机制

不改 overlay 忙态、HUD 呼吸计时、遮罩 dim。简介卡仍用现有 backdrop；点外关闭行为不变。
