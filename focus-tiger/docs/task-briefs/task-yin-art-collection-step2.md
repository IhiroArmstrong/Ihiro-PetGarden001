# Task Brief · Yin's Art Collection Step 2（独立收藏页）

> **状态**：草案。你书面点头（「按这份 Brief 开工」）之前，不改 `focus-tiger/src`。  
> **类**：B 类（新的可见面板）。  
> **前提**：`YIN_ART_COLLECTION.md`、`art-collection-catalog.md`。图已在 `public/ui/art-collection/`。  
> **不采用**另一份「先上五件旧图」的草案。第一批就是下面这 22 张。

## 一句话

单独开 **Yin's Art Collection**。用户按张买一组里的画。买到的是高清、一句故事、获得日期和已拥有。买不到寅币、成长、练习解锁或清供。

## 第一批

三组，组里按张卖。建议价每张 **$1.99**（落在 $0.99–$2.99）。付款未接通前，这个数字只显示，不收款。

| 组 | 张数 | 目录 |
|---|---:|---|
| Song Porcelain · 宋瓷 | 8 | `song-porcelain/` |
| Song Ge Ware · 宋代哥窑 | 6 | `song-ge-ware/` |
| Tixi Lacquer · 剔犀漆器 | 8 | `tixi-lacquer/` |

已撤回、不得出现：`celadon-garlic-mouth-ring-bottle.png`、`ge-dragon-handle-he.png`。

## 这一刀做

1. 独立入口和面板，名字用 **Yin's Art Collection**。不放进阿寅的珍藏，不放进 `#yin-coin-panel`。
2. 按组展示。每张卡：图、名字、一句故事、价格。
3. 已拥有只表示「付款已经记下的收藏」。换设备靠登录恢复。本机缓存不能单独当成付款凭证。
4. 文案称 Digital Artwork。不称 Digital Collectible，不称 NFT。

## 这一刀不做

- 点一下就在本地记成已拥有。
- 用请茶或寅币得到这些画。
- 限量、编号、倒计时、售罄、社区身份、实体优先权、打包成必须整组买。
- 数据模型里的 chain / contract / token。
- 把这 22 张写进寅币商店。

现有付款是请茶和会员。艺术品要单独的结账，不能把「请茶成功」当成「拥有这张画」。付款接口未单独立项前，购买按钮可以看见，按下只说明「付款尚未开通」，不写入拥有。

## 冲突扫描

对照请茶、Lifetime、寅币结缘。面板是次级入口，不插进完成庆祝。卖的是画，不是更专注。与珍藏、请茶分开。

## 验收

- 从珍藏抽屉进不去这些画的购买。
- 已撤回的两张不出现。
- 未接通付款时，按下购买不会增加已拥有。
