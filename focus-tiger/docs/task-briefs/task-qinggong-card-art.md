# Task Brief · 清供八件换脸（只换展示，不改账）

> **状态**：草案，待书面确认后才能改 `focus-tiger/src`。  
> **类**：B 类（结缘页用户能看见的图和名字）。  
> **不做**：称号页、记忆小册、主界面摆件、改价格、改门槛、改 SKU id、把器物叠回阿寅 / 莲花 / 序列帧。

## 一句话目标

清供八件仍用现在的 id、价格和门槛。卡面色点换成已抠好的透明图：未结缘偏暗，结缘后全彩；点开看大图和一两句短文。名字按图里的真实器物改，不再沿用对不上的旧名字。

## 已入库的图

25 张透明 PNG，无「即梦 / jimeng / AI生成」水印，在 `focus-tiger/public/ui/collection-objects/`。原图仍留在仓库根的三个「清供候选」文件夹，不进产品路径。

## 抽屉八件（id / 价格 / 门槛不动）

| id | 价格 | 门槛（不动） | 新展示名 | 文件 |
|---|---:|---|---|---|
| `space.incense-tint-warm` | 24 | 香炉纪念或练习日 ≥ 3 | 错金银镂空莲纹香薰 | `silver-gilt-openwork-lotus-censer.png` |
| `space.lotus-dew` | 48 | 已有第一朵莲花 | 青瓷兽足盘 | `celadon-beast-foot-pan.png` |
| `yin-accent.wood-beads` | 36 | 无 | 错金银瑞兽纹匣 | `silver-gilt-beast-box.png` |
| `yin-accent.folded-cloak` | 60 | Honesty 睡醒 | 错金狩猎纹豆 | `bronze-gilt-hunting-stem-bowl.png` |
| `title.sits-with-yin` | 18 | 练习日 ≥ 3 | 青瓷琮式尊 | `celadon-cong-vessel.png` |
| `title.returned-gently` | 30 | 至少 1 次主动 Recover | 青瓷蒜头长颈瓶 | `celadon-garlic-mouth-vase.png` |
| `badge.rare.quiet-pebble` | 72 | 无 | 哥窑开片三足鼎 | `ge-crackle-tripod-ding.png` |
| `bundle.sumeru-seat` | 360 | 终身分钟 ≥ 600 | 青花饕餮纹鼎 | `blue-white-taotie-ding.png` |

没有莲盏、念珠、石碑、镇纸、奁的原样图，所以这五件换了真正画里有的器物。须弥小鼎换成同是鼎的青花饕餮纹鼎。

## 目录里仍不进抽屉

| id | 价格 | 新展示名 | 文件 |
|---|---:|---|---|
| `collection.porcelain.qing-vase` | 40 | 青瓷出戟觚 | `celadon-flared-gu.png` |
| `collection.bronze.ritual-vessel` | 56 | 错金银鸟尊 | `silver-gilt-bird-zun.png` |

## 短文（进语言包，不写进逻辑）

每件英文一句、中文一句，观察式，不推销。

| 文件 | English | 中文 |
|---|---|---|
| lotus censer | A lotus cut through silver. The room can stay quiet. | 银上镂出莲瓣。屋子可以安静。 |
| beast-foot pan | Four small beasts hold a wide green dish. | 四只小兽托着一只宽青瓷盘。 |
| beast box | Animals move through gold and silver. The lid stays shut. | 瑞兽走在金银之间。盖子合着。 |
| hunting stem bowl | Hunters and beasts circle a tall cup. | 狩猎的人与兽绕着高足杯。 |
| cong | A square body, a round mouth. It stays. | 方身圆口。它就在那里。 |
| garlic-mouth vase | A long neck and a small mouth. | 长颈，小口。 |
| ge ding | Crackled glaze, three feet. | 开片，三足。 |
| taotie ding | A taotie face on a blue-and-white ding. | 青花鼎上有一张饕餮。 |

## 交互

- 未结缘：缩略图变暗，仍可看见是什么。
- 已结缘：全彩。
- 点击：大图 + 上面那两句。0–1 秒内大图出现。
- 结缘动词、余额、缺口句、Bond 按钮保持现有行为。

## 冲突扫描

对照完成庆祝、Honesty、练习徽章、芥子印、莲花池。

- 强度：只换卡面，不加声音、倒计时、抽奖。
- 人设：仍说结缘，不说购买。
- 职责：不进艺术收藏面板，不进请茶，不盖主坐席。已结缘用户的 id 不变，只会看到新名字和新图。

## 验收

- 抽屉仍是这八个 id，价格与门槛与改前一致。
- 八张图无水印、背景透明。
- 未结缘偏暗，结缘后全彩，点开有大图和短文。
- 单测锁：商店 id 列表长度仍为 8；价格表不变。
