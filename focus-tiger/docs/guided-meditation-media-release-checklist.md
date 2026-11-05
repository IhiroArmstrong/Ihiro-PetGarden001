# 引导冥想媒体 · 对外发布前检查清单

> 配套：[`guided-meditation-media-delivery-spec.md`](./guided-meditation-media-delivery-spec.md)  
> 运行时唯一常量：`GUIDED_MEDITATION_MEDIA_HOST`（[`guidedMeditationLessons.js`](../src/core/guidedMeditationLessons.js)）

PO / 发布执行人在 **对用户开放引导课播放之前** 逐项打勾。开发阶段可用 `*.r2.dev`，但指向 `main` 的 PR 会被 CI 拦住。

## A. 对象与转码

- [ ] 两课 `delivery-video` 已在 R2（哈希已写入课表）  
- [ ] 两课 `delivery-audio`（AAC 64k m4a）已上传，`audioSha256` / `audioBytes` 已写入课表  
- [ ] 换内容只换路径，不覆盖旧对象  

## B. R2 与域名

- [ ] 桶 `focus-tiger-guided-media` 未写入 `ART_COLLECTION_HD`  
- [ ] Custom Domain 已绑（建议 `https://media.twinsology.com`）并通过 HTTPS  
- [ ] `GUIDED_MEDITATION_MEDIA_HOST` 已指向该子域（**非** `*.r2.dev`）  
- [ ] `npm run check:guided-media-host -- --release-gate` **exit 0**  
- [ ] 上传对象带 `Cache-Control: public, max-age=31536000, immutable`  

## C. 缓存与 CORS

- [ ] 同一 URL 第二次 `curl -I` 见 `cf-cache-status: HIT`  
- [ ] **单文件缓存上限已核实：Free/Pro/Business = 512 MB**；长课 ~130 MB 在范围内  
- [ ] CORS 维持公开读（现网 `*`）；Electron 不依赖 CORS  

## D. 关闭开发域

- [ ] 应用已切自定义域  
- [ ] 桶设置里 **Public Development URL（r2.dev）已关闭**  

## E. 应用行为（冒烟）

- [ ] **Web：** `<video>` 直链 HTTPS，未等整片下完即可播；缓冲有状态句  
- [ ] **Electron：** 主进程整片下载 + 字节数 + SHA-256；命中缓存跳过下载  
- [ ] 用户可点「只听音频」；**不**自动静默换轨  
- [ ] 配乐授权表已填（来源 / 范围 / 核实日期）  

## F. 仍不做

- [ ] 课文件不进 DMG / `public/` / Git  
- [ ] 不在 Focusing / Arrival 后台预拉整片  
