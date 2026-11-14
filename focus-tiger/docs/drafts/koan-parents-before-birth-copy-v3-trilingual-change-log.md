# Koan copy · v3 trilingual change log（产品暂定锁）

> **用途：** 三语对照与已拍板记录。实现以各语言锁定稿为准。  
> **标注：** en/ja = **AI 预审后的产品暂定**，非「母语已审」。zh = **PO 停等外审后的产品暂定**。

---

## 重要 · 2026-11-13（K1 时间锚纠正）

公案原意是**父母尚未出生**（父母未生前），不是「父母生下你之前」。三语第 1 步问句与 zh 锁定稿已同改：

| 语言 | 新问句锚点 |
| --- | --- |
| zh | 父母**未生前**，你是什么样？ |
| en | Before your parents **were born**, what did you **look like**? |
| ja | 父母が**まだ生まれていないとき**、あなたはどんな**姿**だった？ |

「About this question」仍可用古典名（本来面目 / original face）。

---

## 重要 · 2026-11-03

1. **停等中文外审。** 不再等 Claude Doc 批注回来再合并。  
2. **en/ja v3.1 产品暂定定稿**（结构与禁词维持；第 1 步问句 mirrors 锁定 zh）。  
3. **选项三语 · PO 已同意：** zh **有点不舒服** · en **A little uncomfortable** · ja **少し落ち着かない**。  
4. **B3 已写入锁定 zh：** 「现在不用想明白什么」。  
5. **K1/K2 随暂定稿上线**；日后公案侧改口则三语同改。  
6. **开发已排 T79**（Brief 待点头；点头前不写 `src/`）。

---

## 已落地（en/ja · 语言/结构 · 非 K1 改口）

| # | 区域 | 变更摘要 |
| --- | --- | --- |
| E1–E6 | en | hold it together、a/an、room→right here、fix them、侧面5、B 类 Nothing to figure out、禁词扩展 |
| E7 | en v3.1 | 第4次 → `Thoughts will come. Let them, then return to the question.` |
| E8 | en v3.1 | 第1步 **产品暂定** mirrors zh：`Before your parents gave birth to you, what were you like?` |
| E9 | en v3.1 | 第4步选项去掉内联备注 → 脚注三语对照 |
| J1–J4 | ja | 防火墙、座/静かに過ごす、考え、第4步路由、断句等 |
| J5 | ja v3.1 | 选项过去式 + **少し落ち着かない**（PO 已同意） |
| J6 | ja v3.1 | 着地：「かえって緊張するなら」 |
| J7 | ja v3.1 | A 类：「その気持ちは…置いておいてもいい」 |
| J8 | ja v3.1 | 第1步 **产品暂定** mirrors zh：`父母があなたを生む前、あなたはどんなものだった？` |
| J9 | ja v3.1 | 文体：防火墙です・ます / 寅常体 |
| J10 | ja v3.1 | 禁词 + **悟り** |
| R1 | 记录 | 选项三语 PO **同意**（2026-11-03） |
| R2 | 记录 | 作废「父母が生まれる前」；采用 **父母があなたを生む前** |
| R3 | 记录 | PO 停等中文外审；排 **T79** |

**撤回表述：** 旧行「仍不排开发」「待中文审稿再合并」——**作废**。

---

## 产品暂定 · K1 / K2（上线用；可日后三语同改）

| ID | 内容 | 上线句 |
| --- | --- | --- |
| K1 | 时间锚点 | zh「父母未生前」；en `Before your parents were born`；ja 父母が**まだ生まれていないとき**。卡/标题仍可用古典名 |
| K2 | 问法 | zh「你是什么样」；en what did you **look like**；ja どんな**姿**だった |

---

## 已定稿 · 第4步选项（PO 同意 · 2026-11-03）

| 项目 | zh | en | ja |
| --- | --- | --- | --- |
| 第4步选项 | 有点不舒服 | A little uncomfortable | 少し落ち着かない |

---

## 中文暂定 checklist

1. [x] 停等外审；写入 [`koan-parents-before-birth-copy-locked-zh.md`](./koan-parents-before-birth-copy-locked-zh.md)  
2. [x] B3：「现在不用想明白什么」  
3. [x] 选项三语 PO 已同意  
4. [x] 排 **T79**（Brief 待点头）

---

## 文件路径

| 语言 | 路径 |
| --- | --- |
| zh | [koan-parents-before-birth-copy-locked-zh.md](./koan-parents-before-birth-copy-locked-zh.md) |
| en | [koan-parents-before-birth-copy-for-review-en.md](./koan-parents-before-birth-copy-for-review-en.md) · **v3.1 产品暂定** |
| ja | [koan-parents-before-birth-copy-for-review-ja.md](./koan-parents-before-birth-copy-for-review-ja.md) · **v3.1 产品暂定** |
| Brief | [`../task-briefs/task-t79-contemplative-inquiry.md`](../task-briefs/task-t79-contemplative-inquiry.md) |
