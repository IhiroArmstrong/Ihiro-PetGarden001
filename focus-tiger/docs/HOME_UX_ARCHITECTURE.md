# Home UX Architecture — 方向锁（H0）

> **状态**：已锁（2026-11-17 PO 书面：先写本锁，无需再点头，立刻开工 H1）  
> **从属**：[`PRODUCT_POSITIONING.md`](./PRODUCT_POSITIONING.md) · [`PRINCIPLES.md`](./PRINCIPLES.md) · [`GROWTH_JOURNEY.md`](./GROWTH_JOURNEY.md) · [`MENU_CHROME_CENSUS.md`](./MENU_CHROME_CENSUS.md) · [`SANCTUARY_UI_ART_DIRECTION.md`](./SANCTUARY_UI_ART_DIRECTION.md)  
> **切片 Brief**：[`task-briefs/task-home-ux-architecture.md`](./task-briefs/task-home-ux-architecture.md)  
> **不是**：全盘推倒现网栖居。**不是**把产品改成 productivity dashboard。**不是**照搬概念示意图的米色后台视觉。**不是**复活栖居指南针三叶。

本锁只定首页**空间结构与入口层级**。视觉仍用现网暖米玻璃与阿寅形象。

---

## 产品动作（首页只服务这三步）

用户打开应用后，应自然完成：

1. 看见阿寅，感到陪伴。
2. 了解自己今天的状态。
3. 开始一次练习。

禁止让首页感觉像在操作一套复杂效率仪表盘。

## 现网六个问题（接法是收拢，不是否定）

| # | 问题 | 本锁接法 |
|---|---|---|
| 1 | 层次不清：看见阿寅却不知下一步 | 中央只留阿寅 + 一句短问候（H5）+ **Begin Practice** |
| 2 | 扇形五组没有真正秩序 | 宽屏 ⋯ 的五组索引改为**侧边浮动导航**（方案 C）。这是收益最大的一刀（H1） |
| 3 | 计时、成长、Support、纪念物、语言地球各自漂着 | 三块区域（H2）：左成长、中练习、右陪伴与记忆 |
| 4 | 没有醒目的开始练习 | H1 加 Begin Practice，走现网 Sit 同路径，不新开菜单 |
| 5 | 圆标语义不清 | 首页可点物带短文字；裸圆标不再单独承担导航 |
| 6 | Support Yin 抢第一眼 | 功能保留；H4 才降视觉优先级，不跟 Begin Practice 抢 |

## 三块区域（结构方向 · 截图 2）

只锁分区，不锁示意图配色与卡片皮肤。

1. **中央：阿寅 + Practice**  
   保留现网形象与已有呼吸。下方明确 **Begin Practice**。点下去进入现网静坐路径（含到达仪式，若该路径本来有）。**不得**再先弹出一层复杂菜单。问候轮换属 H5。
2. **左侧：Personal Progress**  
   把左上计时与左下成长收成一块。首页仍只显示成长旅程**一行**（阶段名、下一小步、极细轨迹）。不在首页堆练习天数、累计小时、百分比、连续打卡。天数与累计时间仍在点开后的详情。依据 [`GROWTH_JOURNEY.md`](./GROWTH_JOURNEY.md)。
3. **右侧：Yin & Personal Memories**  
   Confide / Quiet gifts / Records / Practice & moments 的**轻预览**，点进完整页。首页纪念物只留：最近一件、件数、进入收藏。禁止一排徽章（H3）。

截图 4 只核对信息该归哪一块（顶栏品牌与音乐、底栏稳定导航），不替代截图 2 的布局气质。

## 侧边浮动导航（方案 C · 截图 3）

替换的是宽屏 ⋯ 展开后的**五组径向圆标**，不是底栏逃生舱本身。

- ⋯ 仍在。菜单逃生舱不得因叠层仲裁被吞。
- 宽屏够高时：⋯ 先出右侧浮动名单（五组带文字），点一组再出既有暖米列表。
- 窄屏仍用底边抽屉（H6 再对齐骨架）。
- 矮窗退化仍直接列表（沿用高度闸，不复活 sprite-stage 相交）。
- 五组英文名不改：Practice & moments、Records、Quiet gifts、You are not alone、Preferences。
- Support 五卡仍只从既有 Support 入口打开，不进普通菜单目录。

底栏三颗练习入口（Quick / Sit / Honesty）H1 **留下**。Begin Practice 与 Sit 球同代理，职责写清：文字主按钮 = 坐下；三球仍是练习种类入口。

## 明确不做

- 不照搬概念图视觉风格。
- 不把首页做成四栏分页仪表盘。
- 不重新打开栖居指南针 FAB（`HOME_SANCTUARY_NAV_ENABLED` 保持关）。语言地球留下，尺寸在新骨架里与邻钮对齐即可。
- 不在功能 PR 里把 Support 五卡塞进 ⋯。
- 不把成长一行改成打卡墙。
- 不一次改完 H1–H6。

## 刀序

| 刀 | 工作 | 槽位 |
|---|---|---|
| **H0** | 本锁 + Brief | 本 PR |
| **H1** | 侧边名单 + Begin Practice | 立刻做（叠在本锁之后） |
| **H2** | 三块区域骨架 | 立刻做（H1 #1756 已合）；Brief [`task-briefs/task-home-ux-h2.md`](./task-briefs/task-home-ux-h2.md) |
| **H3** | 首页纪念物一件 + 件数 + 进收藏 | 排队 |
| **H4** | Support 降优先级（功能不删） | 排队；付款面须复检 |
| **H5** | 短问候轮换 | 骨架稳定后 |
| **H6** | 窄屏同一套结构 + 过渡 | 骨架稳定后 |
| **H7** | Preferences 分组中心（列表信息架构） | 立刻做（叠 H1） |
| **H8** | Preferences 子页同一套纸 | H7 合入后 |

T100（输出侧刚性闸）可并行，互不挡路。
