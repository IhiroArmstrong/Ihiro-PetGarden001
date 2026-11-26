---
id: fix-help-center-crisis-paraphrase-not-search
kind: feature
status: 只读审计缺口 2 · 帮助中心改写危机句不得当检索
updated: 2026-11-26
---

`resolveHelpCenterAskSubmitPolicy` 在字面安全之后接入既有语义危机层。无关键词的改写句在向量命中时 `reason=safety`、`shouldSearch=false`。缺口 1 / 缺口 3 另 PR。
