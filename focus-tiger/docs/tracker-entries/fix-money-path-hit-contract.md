# fix/money-path-hit-contract

| Support 付款钮命中守门（叠层不得再吃点击） | 纯后端 | 仅单元测试覆盖 | **本条验收的是**机器守门：`glassCardDeck.test.js` 锁付款卡 > 遮罩 > 玻璃卡；PR 冒烟 `e2e/support-cta-hit.spec.js` 对 Subscribe / 加入会员 / 解锁 / 请茶 / 关闭钮做 `elementFromPoint` 命中，并 mock 结账请求。**不代表**真 Stripe 付款页观感已关单。 | — | — | — | `e2e/support-cta-hit.spec.js` · `glassCardDeck.test.js` | 2026-10-11 |
