# feature/beside-seat-figures

| 圈子陪坐轮廓 | UI可见 | 待人工测试 | **主路径**：两人各自的浏览器。一人在小圈里发出请坐码，另一人填码点 Sit beside them。**0–1 秒内**见 “You sat down with them.”，同时左侧出现一行 Yin 打坐轮廓，个数等于圈里的人数；刚用码入座的那个轮廓里面是淡金，其余只留线条。**预览**：`?product=1&debugBesideSeats=5&debugBesideGold=2` 可见 5 个轮廓、其中 2 个淡金，不必真的入圈。**回流**：点 Sit 进入专注后这一行消失；起来后再出现。**375**：轮廓仍在左侧，不挡住底部主按钮。 | **2026-10-11 用户书面**：点击 sit beside them 目前啥都没有。期望界面出现陪坐的圈子，用 Yin 打坐小轮廓表示；5 人就 5 个排在左侧；已经邀请入座的轮廓里面加淡金。 | — | — | `http://127.0.0.1:5197/?product=1&debugBesideSeats=5&debugBesideGold=2` | 2026-10-11 |
