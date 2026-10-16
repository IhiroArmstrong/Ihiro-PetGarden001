# Task Brief · Zen Cinema 策展列表（第二部片 + 可扩展目录）

> **状态（2026-10-17）**：PO 书面指定 YouTube `https://youtu.be/xawM6cgJSrE` 与封面；后续还要加片，目录按 Wallpapers 策展列表组织。  
> **类**：B 类（Idle 礼物卡可见列表）。  
> **性质**：仍是策展礼物，**不是** YouTube 频道墙、无应用内播放器。

## 权威边界

| 项 | 口径 |
|---|---|
| 入口 | 现网 ⋯ / 抽屉 **Zen Cinema**（proxy `zen-cinema`） |
| 播放 | 点 Watch → 系统浏览器打开该片 YouTube；**禁止** App 内嵌播放器 |
| 组织 | `ZEN_CINEMA_FILMS` 为 SSOT；卡内缩略图网格点选 + Watch；营销页同一目录 |
| 封面 | 入库 `public/images/zen-cinema/*.png`，kebab-case ASCII |
| 禁止 | Reflection 边缘入口、登录墙、FOMO、一键社交、把短答念成片名 |

## 本刀片目

1. Satori: The Flash That Changes Everything（`satori-flash` · 已有）
2. What is Zen? Ancient Wisdom & Guided Meditation（`what-is-zen` · 本刀新增）

## 已好清单（不变量）

- 菜单行仍开 `#zen-cinema-card`，遮罩 `#zen-cinema-backdrop`，z-index 不改。
- Watch 仍 `_blank` + `noopener,noreferrer`。
- 与 Quiet Line / Wallpapers 分职：本条 = 外链视频。

## 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle | ⋯ → Inspiration → Zen Cinema | 0–1 秒卡展开，网格 ≥2 部片 | `zenCinemaConfig` · 卡单测 |
| 窄屏 Idle | 抽屉同项 | 同上；卡宽两列缩略图 | 人工 375 |
| en / zh / ja | 开卡 | 片名键走字典；英文片名可与 ja 同字（专有名词） | i18n slice |
| 未点选即 Watch | 默认第一部 | 打开 `youtu.be/RV46qrvG1pw` | 单测 fallback |
| 点选第二部再 Watch | `what-is-zen` 选中 | 打开 `youtu.be/xawM6cgJSrE` | 单测 selected id |

## 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 菜单 Zen Cinema | 行按压 + 确认卡展开 | 无 |
| 缩略图瓷砖 | 选中描边（`is-selected` / `aria-pressed`） | 无（仅会话内） |
| Watch on YouTube | 主钮按压 + 卡开始收起；浏览器新标签打开该片 | 无（外链） |
| Not now / 空白 / Esc | 卡 + dim 同退 | 无 |

## 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 未知 film id | 打开回落到目录第一部；不得哑点击 |
| YouTube 标签页慢出 | 卡已关仍算已接收，不报哑点击 |
| 窄屏 375 | 网格不挡主球；Watch 与 Not now 都可点 |

## 冲突扫描

对照场景 U1 / U2 / U3：强度仍是礼物确认卡（与 Wallpapers 点选后动作同级）；语气仍是小礼物；职责仍是外链视频，不抢静语/壁纸。不是频道墙（无搜索、无订阅、无登录）。
