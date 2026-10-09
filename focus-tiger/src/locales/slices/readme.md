# 文案小片

新的用户可见句子不要再改 `en.json`、`zh.json`、`ja.json`。这三个文件是大家一起改的总账。本目录一个功能一个文件，加载时再合并。

## 格式

文件名小写 kebab-case，后缀 `.json`。同一片里 en、zh、ja 的键必须一致。

```json
{
  "en": { "ART_NOTE": "A quiet note." },
  "zh": { "ART_NOTE": "一句安静的提示。" },
  "ja": { "ART_NOTE": "静かな一言。" }
}
```

键用大写蛇形，和现有字典一样。日文不能只是英文原文（专有名词例外见 `jaCopyGuards.js`）。

可以覆盖总账里已有的键，用来改一句旧文案。两片不要写同一个键。

## 不要做

- 不要在功能 PR 里改 `en.json` / `zh.json` / `ja.json`。检查会失败。
- 不要手改 `localeSliceModules.js`。它由脚本生成，并且不进 git。

```bash
cd focus-tiger && npm run locale:slices
```

`npm install`、`npm test` 和 Vite 启动时也会生成。
