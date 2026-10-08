# feature/art-collection-hd-delivery

| 艺术品高清付清后才下发 | UI可见 | 待人工测试 | **主路径**：付清并回到应用后，收藏里这一张会从水印预览换成已下载的高清；没买、或只有本机「已拥有」记录时，仍是预览。断网时已下载的那张还能看。退款之后再要新文件会失败，已经在这台设备上的文件还在。公开目录里仍然只有 `preview-*.png`。私有原图要先放进 `ART_COLLECTION_HD`，否则付清后仍只见预览。自动化：`artCollectionHd.test.js`、`pngBuyerMark.test.ts`、`getArtCollectionHd.test.ts`。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#art-collection-panel` | 2026-10-08 |
