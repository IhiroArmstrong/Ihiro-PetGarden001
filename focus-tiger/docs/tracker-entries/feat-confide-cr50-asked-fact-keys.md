# feat/confide-cr50-asked-fact-keys

| 功能 | 测试类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 测试路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide CR-50 问到的事实键（0038 / EDU-0003 / 记录三档） | 纯后端 + 目录 | 待人工测试 | **终端已覆盖**：0038 / EDU-0003 近义只用新事实键；EDU-0003 不进 where；记录原型对照「本机已记下」vs「一次设计时长」；0.80 未动。`node --test` 本支单测 + `npm run test:smoke`。**人只补**：宽屏 embedding 就绪后，英文「要不要每天 Honesty 打卡」仍须 0038；「focus 和 meditation 是不是一回事」须 EDU-0003；「我这台机器练了多久」须记录或空记录句；「一次该坐多久」不得念本机累计。不要用 v1 原句关单。关单用仓外未见批 v2。 | — | — | — | `confideProductAskRole.test.js` · `confideFactFirstSpeak.test.js` · Electron 宽屏 Confide | 2026-10-16 |
