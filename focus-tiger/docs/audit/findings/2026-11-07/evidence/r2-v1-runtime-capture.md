# R2 · V1 运行时抓包（最小版）

- 日期：2026-11-07
- 产品树：`845aa8e0840f7e787cc909dd320d510ab6447df5`。相对该 SHA，`focus-tiger/src`、`desktop/`、`cloud/` 与当时 `origin/develop` 无差异。本机该 SHA 工作副本没有 `node_modules`，桌面壳用同一棵产品树的已安装 Electron 启动。
- 隔离目录：`--user-data-dir=/tmp/r2-t89-v1-capture/userdata`（不是本机日常 `Application Support`）
- 启动：开发态 `FT_DESKTOP_DEV=1`，临时追加 `--log-net-log=/tmp/r2-t89-v1-capture/netlog.json --net-log-max-size-mb=32 --remote-debugging-port=9333`。没有改产品默认启动脚本。
- 一次练习：点了 Sit；查询串带 `sessionMinutes=1` 以便在一分钟内走完，不是商店默认十分钟。
- 同意开关：用产品里的同意写入函数各开、各关一遍（研究计数、付费漏斗、个人化、Quiet Together）。隐私整页在本机打开时报错（`_refreshT54ResearchOptInCopy is not a function`），所以没有靠那一页的勾选框。

## (A) Chromium net-log

- 文件约 29 MB，留在本机 `/tmp/r2-t89-v1-capture/netlog.json`，**不入库**（体积大，且开发态会记下本地资源路径）。
- 解析：按 JSON 的 `events` 抽 `url` 字段。事件约 220852 条。
- 主机：**只有** `127.0.0.1:5173`。没有 `workers.dev`、没有 Hugging Face、没有更新源。
- 这与 Brief v1.3 一致：主进程 `fetch` 的云接口不进这一层。

## (B) Node 全局 `fetch`（主进程 pid）

- 主进程 pid `86172`（开发态名 `Electron`）。
- 启动后抽样：`TCP 100.64.164.2:58757 -> 104.21.42.26:443`。该 IP 对本机解析为 `focus-tiger-cloud.ihiro.workers.dev`。
- 练习中、开关切换后再抽样：主进程只剩调试端口 `127.0.0.1:9333`。连接是短的，关掉后 `lsof` 看不到。
- 页面里调用漏斗上传后返回 `ok: true`。个人化上传在练习未结束时返回 `busy`，关掉时返回 `in_flight`，所以这一条没有当成「已发出」。

## (C) 渲染进程 Network 补充

- `performance.getEntriesByType('resource')` 里，去掉 5173 之后是 **0** 条。
- 品味层 / 云 API 不出现在渲染进程资源表。

## 对照 B5 §2（抽样 ≥5）

| 请求 | 默认 / 开关 | 本轮看到什么 | 同意之前还是之后 |
|---|---|---|---|
| 品味层 / 成长度量（启动自动） | 默认开 | 主进程连上 `workers.dev:443` | 默认，无用户内容同意 |
| 开发态 5173 | 仅开发 | net-log 全部是它 | 不适用 |
| 模型下载 | 未触发（本地已有向量文件，本会话未再下） | 没有 HF / hf-mirror | — |
| 更新检查 | 未设 `FT_UPDATE_FEED_URL` | 没有更新主机 | — |
| 付费漏斗上传 | 默认关，本轮打开后调用上传 | 函数返回成功；主进程短连接 | **之后** |
| 研究计数上传 | 打开同意 | 本轮没有在练习结束时再送（练习仍占着界面） | 未观察到实际上送 |
| 个人化 ingest / delete | 打开 / 关闭 | 被 busy / in_flight 跳过 | 未观察到实际上送 |
| 云备份 | 代码写死关 | 没有 `/api/practice-backup` | 同意前也不会发 |
| Quiet Together | 默认开 | 练习中主进程没有一直占着 443 | 心跳型，短连接可能已结束 |

## 结论用句

静态代码不能单独维持 V1。运行时：**没有看到未经同意的用户内容离开本机**。默认启动会连云主机拉配置。开发态渲染层只打本地 5173。
