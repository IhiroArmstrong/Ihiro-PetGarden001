# Task Brief · 复述提问护栏（T32）

> **状态（2026-10-21）**：**PO 已点头开工**（口令「立刻开工」继续 T32；冻结前修名词化复述）。本文件锁规格并与实现同批。  
> **类别**：**B 类**（会改变倾诉可见回复：sanitize 拒收后改走陪伴短句）。  
> **代号**：**T32**。占号仍是 **CR-22** 语义护栏切片（答句实词重叠），**不是**观察翼幼虎套势 embedding 那一刀（`task-l3-observe-cliche-semantic-guard.md`）。  
> **时限**：10/23–25 合入。合入后与 T29/T30/T31 一并重跑黄金脚本英文 60 + 安全回归。  
> **分支**：`fix/confide-paraphrase-echo-guard`（base = `origin/develop`，已含 T31 #1365）。**不**叠 T30。  
> **交叉**：[`l2Sanitize.js`](../../desktop/companion/l2Sanitize.js) · [`task-l3-observe-cliche-gate.md`](./task-l3-observe-cliche-gate.md) · [`CONFIDE_NOW.md`](../CONFIDE_NOW.md)

---

## 0. 大白话

有人把心事说成短名词（「谁不喜欢寅」收成「不喜欢寅」）时，阿寅不得把那几个实词再念一遍当回答。没有新内容就换成现成的陪伴短句。不要把当天测到的原句写进拒收表。

## 一、拍板锁

1. **改判定机制：答句实词 ⊆ 用户句实词则拒收。** 实词 = 去掉封闭功能词后剩下的词干；`dis-`/`un-` 与词根、四字母以上前缀视为同一实词。禁止把田野原句写入 keywords / 拒收表（`R-Confide-No-Symptom-List`）。  
2. **拒收后走现网陪伴短句。** `sanitizeCompanionL2Reply` 返回空 → 现网 corpus fallback。本刀不新开文案池、不改茶句文本。  
3. **字面照抄与双字母重叠仍保留。** 本刀补的是它们漏掉的名词化改写，不替换。  
4. **有新实词则放行。** 陪伴观察句只要带了用户句里没有的实词（坐、等、身体、茶、幼虎等），不算复述。  
5. **不碰安全通道、不改跳转、不改个人事实、不改 TTS、不改付款。** 危机 / 产品问 / 徽章行仍先于 generate sanitize。

**为什么这不是「按症状加 Sister 词」：** 拒收条件是「答句没有超出用户句的实词」，与当天那两句名词化同形，也适用于明天换人名、换对象的短改写。

## 二、做 / 不做

**做：**

- `isContentWordParrotReply`。  
- 单测：名词化短改写拒收；中英观察句、茶句、带新实词的陪伴句放行。

**不做：**

- 不把田野句写入生产字符串。  
- 不接线观察翼 embedding 陈词滥调 Brief（CR-22 另一切片，须另口令）。  
- 不改 1.7B、不放低 embedding。  
- 不做 T33 生成路径改码。

## 三、变体矩阵（A10）

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

本刀只锁 generate sanitize 的实词形状（英为主、中文汉字块对照），入口仍是现网倾诉 Share。

## 四、点击反馈（0–1 秒）（A14）

本次无可点击交互改动，点击反馈节跳过。发送后等待指示与现网 generate 相同。

## 五、边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| sanitize 拒收 | 可见另一条 corpus 短句，禁止空白 |
| 安全路由 | 不进本护栏 |
| Web / 窄屏无 generate | 行为与现网一致（无本层） |
| 中文情绪短句 + 英文观察答 | 实词对不上则放行（既有打乱配对句） |

## 六、落地

1. `desktop/companion/l2Sanitize.js`：实词集合 + 拒收。  
2. `l3ObserveShuffleGate.test.js`：形状单测。  
3. 可见回落沿用现网 corpus，不改 `confideCorpus.js`。

## 七、冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE 倾诉 / L3 generate：** 强度不变——发一句等一句；拒收后 corpus 是既有路径，不比安全桶更重。  
- **人设：** 继续观照，禁止把用户句当标签念回去；不改口说教。  
- **职责：** 本刀管**答句有没有新内容**；问句翼 / 安全 / 跳转 / 徽章行不抢。幼虎套势仍走既有字面 + 余弦闸，本刀不并 embedding Brief。  
- **场景 C Reflection echo：** 不改。

**结论：** 无第二项待决。

## 八、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 九、验收

终端：`node --test src/core/l3ObserveShuffleGate.test.js`；既有 hollow / 照抄 / 套势单测不退；`npm run test:smoke`。  
关单：不声称黄金脚本 60 句已绿；10/24 与 T29/T30/T31 一并重跑。
