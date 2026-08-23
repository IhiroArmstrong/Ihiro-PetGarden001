# Task Brief · 练习备份后台网络错峰 / 跳过同内容写盘

> **状态（2026-08-23）**：口令已执行；运行时在旁支 `fix/practice-backup-background-network`。慢网人工仍待。  
> **权威**：`BACKGROUND_NETWORK.md` 触点 1；`PROCESS.md` Backlog「练习记忆云端备份」本条为 A 运行时的跟进修复，**不是** B 多端无缝。  
> **口令**：「开工练习备份后台网络修复」

## 一句话

已同意云端备份的用户，回 Idle / 开机空库恢复时的 `fetch` 不得和动效窗口抢主线程；本地白名单与 opt-in **内容相同则不重写**。

## 已拍板（审计结论，勿再议「有没有风险」）

1. Idle 进入后 400ms `forceSoon` 上传与呼吸循环开始重叠。  
2. busyProbe 不含 Arrival 开着、不含精灵预加载；空库恢复 1200ms 不看 busy。  
3. 上传成功整份重写 opt-in；空库恢复六 key 无条件 `setItem`。  
4. 无低速网络下 Idle / Arrival 流畅度记录。

## 要做（口令后才改代码）

1. **Q1**：上传 / 恢复排到 Arrival / Honesty / Reflection 叠化结束、Idle 呼吸已稳定开始、精灵预加载完成之后。Arrival 开着须 busy。重叠则推迟，禁止「请求很快」。  
2. **Q2**：快照 / 各 store 内容相同 → 跳过 `setItem`；只更新 cloud-ok（如 `lastUploadAt` / `lastRestoreAt` 一类标记）。  
3. **Q3**：低速网络模拟下看 Idle 呼吸与一条叠化转场，不得只断言 `ok: true`。  
4. 回归：busy / 空库 / 非空跳过恢复等现有单测仍绿；补「同内容不写盘」与「Arrival 开着不发」失败用例。

## 不做

- 不改白名单六 key、不改为付费 B 同步、不改 OTP 点击路径。  
- 不顺便改品味层预取或陪伴模型下载（各有自己的 Brief）。

## 冲突扫描（立项时）

对照 `SCENARIO_TESTS` Idle 呼吸眨眼 / Arrival 叠化 / Honesty / Reflection / Journey 备份角。本修复只挪请求时机与写盘，不改备份产品语义、不加重补登仪式。
