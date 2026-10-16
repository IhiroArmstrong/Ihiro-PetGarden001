# Task Brief · 问到的事实键（CR-50 续刀）

> **状态（2026-10-16）**：**PO 已点头开工**（本会话书面：只改三类事实写法，再出未见批 v2）。
> **类别**：B 类。会改变宽屏倾诉里哪一张卡 / 哪一档记录被近邻选中；短答正文不改。
> **跟进号**：**CR-50**。不并入 CR-45 / CR-46 / 形状轴扩档。
> **原则**：`PRINCIPLES.md` **R-Confide-No-Symptom-List**。禁止按症状加说法名单。
> **基线**：`origin/develop` 含 #1277+#1284。v1 诊断 9/33；错卡不念 5/5。不调 0.80。

## 0. 大白话

错卡不念已经站住。没到的是：打卡是不是必须、这套练习和冥想差在哪、以及问的是本机记录还是产品设计时长。这一刀只把这三件「问的是哪条事实」写清楚，让近邻去对那一句。不放低门槛，不加当天问法名单。

「为什么 / 有什么好处」在现网形状轴里仍是动机档（`none`），本刀**不**新开 why 形状。若 v2 里 `benefit-why-0003` 仍起不来，才轮到下一刀形状轴。

## 一、锁文案（一句事实键，不是问法表）

**KB-FUNC-0038** 形状仍只 `whether-required`：

> Is Honesty Check-in or a daily streak required, or can I sit with Yin without checking in?

短答正文不改。0020 仍只答入口。

**KB-EDU-0003** 补事实键 + 形状只 `what-is`（不再用遗留 where/how 去抢入口问）：

> Are focus practice, meditation, and mindfulness the same thing, or is Sit with Yin a Focus sit rather than a generic meditation class?

短答正文不改。不把「有什么好处」写进短答。

**记录三档原型**（能力句，不是失败句）：

- 查本机：`How many minutes or practiced days does this device already have written down for me?` · `What does this machine already record about when I have sat?` · `Have the days already counted on this device shown me showing up?`
- 一次该坐多久：`How long is one Sit or Breath sitting designed to last in the product, not my lifetime total on this device?`
- 陪伴：仍是不够近时的默认档，不另做原型名单。

命中线仍 0.80。

## 二、明确不做

- 不调 0.80 / 0.78 / 函数 A 0.01
- 不把 v1 失败句写入 keywords / 单测 / 事实键
- 不新开 why-benefit 形状、CR-45、CR-46 中档接线
- 不改 0038 / EDU-0003 短答；不新开第三张卡

## 三、验收

终端：事实键与记录原型单测；`npm run test:smoke`。  
关单：仓外未见批 **v2**（新 `author_prompt_id`）跑 `audit:g2-fact-arrival`，只报三类是否明显上来。v1 原句不得再跑。

## 变体矩阵（A10）

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）（A14）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态（A14）

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 冲突扫描

- **AE 倾诉**：命中后仍念已审短答；本刀只改检索面上的问句形事实键。
- **AX 帮助中心**：不改打开方式与目录。
- **Honesty / 0020**：0038 仍只 whether-required，不抢入口。
- **危机 / 付款**：不碰。

**结论**：无未拍板冲突。

## 回滚

0038 / EDU-0003 事实键与记录原型回到 #1284 文案。
