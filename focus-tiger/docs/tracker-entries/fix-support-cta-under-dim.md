# fix/support-cta-under-dim

| Support Subscribe 点到遮罩关卡（玻璃卡 z-index） | UI可见 | 待人工测试 | **主路径**：Idle → 右上 Support FAB → 点 Subscribe to Pro → **0–1 秒内** CTA 忙碌，然后跳 Stripe，或卡内错误文案仍留在打开的 Support 上。**禁止**：点下去整张 Support 淡出且无支付页。**回流**：关掉再开，再点 Join Membership / Unlock Sanctuary / Buy a Tea，须进对应卡或结账，不得被遮罩吃掉。**对照**：Help 等 z18 玻璃卡仍最多两张、仍可拖。 | **2026-10-11 用户书面**：Subscribe to Pro 点了卡片消失、无支付页 | release-blocker | 本轮修 | `http://127.0.0.1:5173/?product=1` · `#yin-support-modal` · yin-support-pro-cta | 2026-10-11 |
