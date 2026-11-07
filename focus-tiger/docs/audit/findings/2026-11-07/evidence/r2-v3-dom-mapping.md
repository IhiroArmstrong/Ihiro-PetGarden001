# R2 · V3 前提链（远程文案 → DOM）

- 产品树：`845aa8e0`
- 没有改代码。没有把远程字符串贴进本文件。

## 链

| 下发 | 字段 | 最终 DOM | 会不会进 `innerHTML` |
|---|---|---|---|
| `/api/daily-message` | 当日智慧句 | `<daily-wisdom>` 用 Lit 文本绑定 `${this._text}` | 否（会转义） |
| `/api/quiet-line` | 静句 | 走 overlay 池，不是 `src/ui` 里直接 `innerHTML =` 远程句 | 未见到 `innerHTML` |
| `/api/confide-copy` | 固定句 / 模板 | 语料选择后 `ConfideToYinUI` 用 `textContent` | 否 |
| `/api/calm-action-copy` | 动作句 | 内容层取 overlay 文本；`src/ui` 的 Calm Action 文件没有 `innerHTML` | 否 |
| `/api/companion-channel-copy` | 通道句 | `formatCompanionChannelLine` → `MomentWhisperUI` 的 `textContent` | 否 |
| `/api/emotion-weight`、`/api/growth-metrics-config` | 权重 / 配置 | 不是给用户读的 HTML | 否 |
| 本地 `t()` 键 | 菜单图标、重置练习文案等 | 若干 `innerHTML` 只拼本地键或 SVG | 不是服务端下发 |

## 9-07 / Electron

- 渲染进程仍然没有 CSP。
- 锁文件 Electron 仍是 **37.10.3**（`package.json` 写 `^37.2.6`）。
- CI `dependency-audit.yml` 的工作目录仍是 `focus-tiger/`，不含 `desktop/`、`cloud/`。

## 判定用句

没有发现「服务端下发字符串进入 `innerHTML`」。因此 **不把 9-07 升到 P1**，**V3 仍是通过（暂定）**。前提还是：渲染进程只加载本地壳 + 开发态 5173，远程句只走文本节点。
