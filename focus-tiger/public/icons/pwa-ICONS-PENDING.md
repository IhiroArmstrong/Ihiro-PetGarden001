# PWA / 主屏幕图标 — 待补图标

**状态：待美术产出。禁止用占位 PNG 上线或冒充可验收。**

`manifest.webmanifest` 与 `index.html` 已指向下列路径；文件到位前安装体验不完整，**不得**标 TEST_TRACKER「已通过」或正式邀测关单。

| 路径 | 尺寸 | 用途 |
|---|---|---|
| `pwa-192.png` | 192×192 PNG | Manifest `purpose: any` |
| `pwa-512.png` | 512×512 PNG | Manifest `purpose: any` |
| `pwa-maskable-512.png` | 512×512 PNG | Manifest `purpose: maskable`（安全区约居中 80%） |
| `apple-touch-icon.png` | 180×180 PNG | iOS 主屏幕 |

到位后：放入本目录同名文件 → 人工验 Android Chrome + iOS Safari「添加到主屏幕」→ 再谈验收。

非本清单：`icon-sit-with-yin.png` / `icon-quick-start.png` / `icon-honesty-checkin.png` 是 UI 功能图腾，**不是** App 主屏幕图标。
