# Task Brief · T103 深链 Shortcuts 收口（食谱 + 专注模式 / 日历 / Things）

> **状态**：**排队中** · Brief 待点头 · **无运行时**（第一刀以 Help / 文档食谱为主）。  
> **代号**：**T103**。人话：把已经能用的深链，写成用户自己能搭的快捷指令和日历步骤，接到系统专注模式、日历和 Things。  
> **槽位建议**：**P2 · 排队中**。可与 **T101** 并行（少碰壳）。  
> **类**：第一刀 **A 类文档 + Help**；若须补 Help 卡则为 **B 类** 小改。  
> **不是**：Things / Notion / Slack **官方插件**。**不是** Zapier。**不是** iOS 原生壳（**T49**）。**不是** 再解析一套 URL。

**口令（点头后）**：`按 T103 Brief 开工 Shortcuts 食谱收口`。

---

## 0. 大白话

深链开坐、日历导出、iPhone 记入健康，代码大多已经在。缺的是一份用户照着就能接上自己工具的说明书。以前说明书写过「Things 继续不做官方对接」——本刀只做**用户自己的快捷指令**，仍然不做 Things 应用内插件。

---

## 1. 地面真相（git）

| 已合 | 还缺 |
|---|---|
| 解析 A #1675 · Web B #1678 · Electron C #1681 | Help 里逐步食谱（Brief 原 **D** 刀） |
| Health 记入钮 #1688（默认关；电脑壳关偏好 #1710） | PO 真机 D 层仍待 |
| `.ics` 导出 #1684（事件 URL 已走深链） | 日历「打开 URL」与专注模式自动化的用户步骤 |
| Raycast/Alfred 一行已写在深链 Brief §5.4 | Things / 专注模式逐步图 |

深链 Brief [`task-deep-link-shortcuts-cookbook.md`](./task-deep-link-shortcuts-cookbook.md) §13.7 曾锁「Things 继续不做」。**本 T103 覆盖该条的产品范围**：允许 **用户快捷指令 / 打开 URL**，仍禁止官方扩展与云同步。

---

## 2. 拍板建议（点头即锁）

1. **日历**：沿用已有「添加到日历」`.ics`；食谱写清：事件打开的是 `focus-tiger://`（电脑）或 https 查询（网页）；诚实句继续禁止「同步」。  
2. **专注模式**：系统「专注」自动化 → 打开同一深链。App **不**读取专注状态、不申请 Focus Filter。  
3. **Things**：食谱只教：Things 任务备注或快捷指令「打开 URL」指向深链。禁止 `things://` 写回倾诉原文。禁止官方插件。  
4. **第一刀交付**：Help Center 或仓库用户步骤（en 可发、zh 草稿、ja 可发）覆盖 5.1 一键 5 分 Sit、日历、专注模式、Things、Raycast 各一页。**不**新注册 scheme。  
5. Markdown 导出仍等有使用信号（原 Brief §5.5）。

我认为最合理的是：**只发用户可复制步骤，不写 Things API。** 弱方案是做官方 Things 扩展（维护面大、与 Never-Cloud 重叠收益不成比例）。

---

## 3. 明确不做

- 新 URL 参数、新练习种类  
- HealthKit 读取；Mac 承诺记入 Health  
- Slack / Notion / Zapier 连接器

---

## 4. 冲突扫描

相邻：深链 Sit、`.ics`、Health 默认关、T49、T44。职责 = 外部说明书，不是新坐法。强度不得重于点 Sit。覆盖 §13.7 时须在实现 PR 描述写明「仅食谱，非插件」。
