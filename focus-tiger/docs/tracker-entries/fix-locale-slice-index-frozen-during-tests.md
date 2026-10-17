# fix-locale-slice-index-frozen-during-tests

| 并行 smoke 冻结 locale 切片索引 | 纯后端/测试基建 | 仅单元测试覆盖 | **无用户路径。** 验收：`run-src-unit-tests` 写完索引后上锁；压测只改 `localeSliceModules.rewrite-probe.js`；锁定期改共享索引必须抛错。不改发送链、不改文案。 | — | — | — | `write-locale-slice-index.js` · `run-src-unit-tests.js` · `localeSliceIndexWrite.test.js` | 2026-10-17 |
