#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Classify TEST_TRACKER rows that are 待人工测试 but lack automation mentions.
 * Output: docs/tracker-no-auto-classification.json + stdout summary
 */
const fs = require('fs');
const path = require('path');

const trackerPath = path.join(__dirname, '../docs/TEST_TRACKER.md');
const text = fs.readFileSync(trackerPath, 'utf8');
const lines = text.split('\n');
const rows = [];
let inTable = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('## 功能清单')) inTable = true;
  if (!inTable || !line.startsWith('|') || line.includes('---|') || line.includes('功能 | 类型')) continue;
  if (line.includes('tracker-fragments')) continue;
  const parts = line.split('|').map((s) => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  if (parts.length < 9) continue;
  const [name, type, status, steps, feedback, , , accessPath, date] = parts;
  rows.push({ line: i + 1, name, type, status, steps, feedback, accessPath, date });
}

const isUi = (r) => /UI可见|UI\/交互|UI文案/.test(r.type);
const hasAuto = (r) =>
  /自动化|e2e[:：]|单测[:：]|\.test\.js|\.spec\.js|npm run test|test:smoke|audit:|test\.js|spec\.js/i.test(
    `${r.steps}${r.name}${r.feedback}`,
  );

const pending = rows.filter((r) => r.status === '待人工测试');
const noAutoPending = pending.filter((r) => !hasAuto(r));

function classify(r) {
  const blob = `${r.name} ${r.steps} ${r.type}`;

  const modelWording =
    /confide|倾诉|短答|语气|tone|gemma|llama|generate|生成|tts|朗读|voice input|speak to type|本地智能|semantic|stage 2|观察翼|模型|whisper|听写|真实模型|fallback.*短|5 句连发|去重回落|spot-check|PO tone|措辞|好不好听|同句|复读|echo/i.test(
      blob,
    );
  const deterministic =
    /闸门|路由|data-source|fail-open|空态|retrieval=off|被挡|hidden|无 🎙|卸载|progress|testid|registry|catalog|matrix|disabled|suppress|gate|security|攻击|安全阀|corpus|kb-func|confide.*kb|manual entry|seen 已写|options-seen|banner|network.*hint|orchestration|ipc|companion.*l1|下载.*进度|focusing.*卸载|窄屏.*无|宽屏.*见|\.spec\.js|\.test\.js/i.test(
      blob,
    );
  const humanVisual =
    /像素|动画|观感|手感|叠化|闪一下|blink|celebrating|sessioncomplete|光影|听感|autoplay|排版|尖角|换行|safari|布局|坐姿|纸面|收藏避让|芥子|鹦鹉|节日|四行|视觉|美观|对齐|间距|字体|颜色|warm paper|蒲团|米色|立体|图\d|截图|附图|walkthrough|走查|满池|螺旋|抠图|调试面板|实验室|probe|毛玻璃|淡入|硬闪|陷阱|卡死|互踩|Saving|duplicate|重复 join|涨人数|1↔2|rca ·|工作流 rca/i.test(
      blob,
    );
  const pureDoc =
    /纯文档|无用户路径|进度表|决策权|阻断式确认|逃生舱|policy|sku|checkout 未接/i.test(blob);

  if (pureDoc) return 'skip-doc';
  if (modelWording && !deterministic) return 'model-wording';
  if (deterministic && !humanVisual) return 'automatable';
  if (humanVisual || isUi(r)) return 'human-eye';
  if (modelWording) return 'model-wording';
  return 'human-eye';
}

const classified = {
  automatable: [],
  'human-eye': [],
  'model-wording': [],
  'skip-doc': [],
};

for (const r of noAutoPending) {
  classified[classify(r)].push(r);
}

const tonightSecurityKb = classified.automatable.filter((r) =>
  /攻击|安全|security|kb.*未命中|空态|fail-open|retrieval=off|诚实|情绪桶|安全阀/i.test(`${r.name} ${r.steps}`),
);

const report = {
  generatedAt: new Date().toISOString(),
  source: 'docs/TEST_TRACKER.md',
  totals: {
    tableRows: rows.length,
    pendingHuman: pending.length,
    pendingWithAutomationMention: pending.filter(hasAuto).length,
    pendingNoAutomationMention: noAutoPending.length,
    uiPendingHuman: pending.filter(isUi).length,
  },
  classificationCounts: Object.fromEntries(Object.entries(classified).map(([k, v]) => [k, v.length])),
  tonightBatchCandidates: tonightSecurityKb.map((r) => ({
    line: r.line,
    name: r.name,
  })),
  classification: Object.fromEntries(
    Object.entries(classified).map(([k, v]) => [
      k,
      v.map((r) => ({
        line: r.line,
        name: r.name,
        type: r.type,
        accessPath: r.accessPath,
      })),
    ]),
  ),
};

const outPath = path.join(__dirname, '../docs/tracker-no-auto-classification.json');
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report.totals, null, 2));
console.log('classification:', report.classificationCounts);
console.log('tonight batch:', tonightSecurityKb.length);
