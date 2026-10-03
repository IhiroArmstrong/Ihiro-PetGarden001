# feature/art-collection-refund-revoke

| Art Collection 退款撤销拥有 | 纯后端 | 仅单元测试覆盖 | Stripe Dashboard 对一笔 Art Collection 测试单全额退款 → `POST /api/verify-art-collection` 对应 `artId` 行含 `revokedAt`；已下到本机的 HD 文件不会消失；再次购买同一 `artId` 后 `revokedAt` 清除。自动化：`artCollectionKv.test.ts` · `artCollectionStripeWebhook.test.ts`。 | — | — | — | Cloud `POST /api/stripe-webhook` · `charge.refunded` | 2026-10-03 |
