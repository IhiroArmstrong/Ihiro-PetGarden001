/**
 * Rules authority registry (SSOT map) — machine-readable source for
 * `rules-authority-doc-check.js` and the machine block in `docs/RULES_INDEX.md`.
 *
 * Principle: each rule topic has exactly one authoritative document. Other docs
 * may cite it in one short sentence + link; they must not restate the full policy
 * or invent contradictory claims.
 *
 * Paths are relative to the repository root (parent of `focus-tiger/`).
 */

/** @typedef {{ id: string, pattern: RegExp, note: string }} ForbiddenClaim */
/** @typedef {{
 *   id: string,
 *   title: string,
 *   ssotPath: string,
 *   ssotSection: string,
 *   ssotMustContain: RegExp[],
 *   topicSignals: RegExp[],
 *   mustCite: RegExp[],
 *   restatementFingerprints: RegExp[],
 *   restatementThreshold: number,
 *   forbiddenOutsideSsot: ForbiddenClaim[],
 *   citeExemptFiles?: string[],
 *   restatementExemptFiles?: string[],
 * }} RuleAuthorityTopic */

/** Files scanned for drift / contradiction (repo-root relative). */
export const RULE_AUTHORITY_SCAN_FILES = [
  'WORKFLOW.md',
  '.cursor/rules/focus-tiger-regression-lock.mdc',
  '.cursor/rules/focus-tiger-docs.mdc',
  '.cursor/rules/focus-tiger-browser-energy.mdc',
  'focus-tiger/docs/RULES_INDEX.md',
  'focus-tiger/docs/PROCESS.md',
  'focus-tiger/docs/DEV_WORKFLOW_QUALITY.md',
  'focus-tiger/docs/COLLAB.md',
  'focus-tiger/docs/TEST_TRACKER.md',
  'focus-tiger/docs/DOC_CODE_CONTRACT.md',
  'focus-tiger/docs/PRINCIPLES.md',
  'focus-tiger/docs/ARCHITECTURE.md'
];

/**
 * @type {RuleAuthorityTopic[]}
 */
export const RULE_AUTHORITY_TOPICS = [
  {
    id: 'git-branch-model',
    title: '分支模型（main / develop / feature / fix / hotfix）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '分支模型',
    ssotMustContain: [
      /\|\s*\*\*`main`\*\*/,
      /\|\s*\*\*`develop`\*\*/,
      /\|\s*\*\*`feature\/<简述>`\*\*/,
      /\|\s*\*\*`hotfix\/<简述>`\*\*/
    ],
    topicSignals: [
      /分支模型/,
      /日常集成分支/,
      /`hotfix\/</,
      /main.*可发布|可发布.*main/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /\|\s*\*\*`main`\*\*.*可发布/,
      /\|\s*\*\*`develop`\*\*.*日常集成/,
      /\|\s*\*\*`hotfix\/<简述>`\*\*/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'main-as-daily',
        pattern: /(?:^|[^/`])main(?:`)?\s*[：:=].*日常开发|日常开发.*直接.*`?main`?/,
        note: 'main 不是日常开发分支；日常在 develop'
      }
    ]
  },
  {
    id: 'git-merge-main',
    title: '合并 develop → main 的门禁与谁点合并',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '何时可以把 `develop` 合并进 `main`？',
    ssotMustContain: [
      /npm run test:smoke/,
      /npm run test:e2e/,
      /最终点击合并的动作，始终由项目负责人本人/,
      /Agent 不得代为合并进 `main`/
    ],
    topicSignals: [
      /合并进\s*`main`|合并\s*`develop`.*`main`/,
      /合并 main 前的日常检查清单/,
      /最终点击合并/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /合并 main 前的日常检查清单/,
      /最终点击合并的动作，始终由项目负责人本人/,
      /量级裁剪/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'agent-may-merge-main',
        pattern: /Agent\s*(?:可以|可|应当|应)\s*(?:自动)?合并进\s*`?main`?/,
        note: '禁止 Agent 代为合并进 main'
      },
      {
        id: 'n-approvals-invented',
        pattern: /(?:至少|须|需要)\s*\d+\s*(?:名|位)?\s*(?:审批|reviewer|批准)/i,
        note: '仓库未规定「N 人审批」；合并门禁以 WORKFLOW.md 清单为准，勿另造人数要求'
      }
    ]
  },
  {
    id: 'git-agent-commit',
    title: 'Agent 自动 commit / 汇报 / Git 同步分级汇总 / push 与禁自动合 main',
    ssotPath: '.cursor/rules/focus-tiger-regression-lock.mdc',
    ssotSection: 'Commit 汇报与分支门禁',
    ssotMustContain: [
      /允许自动 commit 的范围/,
      /禁止静默提交/,
      /禁止自动合并进 `main`/,
      /声称「已修复 \/ 已修好」须有 push \+ CI 证据|push 本身仍须用户明确授权/,
      /Git 同步汇总/,
      /高风险标注/,
      /请安排下班前的 Git 同步/
    ],
    topicSignals: [
      /允许自动 commit/,
      /可自动(?:本地)?(?:\s*`?git commit`?| commit)/,
      /禁止静默提交/,
      /Commit 汇报与分支门禁/,
      /Git 同步汇总/
    ],
    mustCite: [
      /focus-tiger-regression-lock\.mdc|regression-lock|Commit 汇报与分支门禁/
    ],
    restatementFingerprints: [
      /允许自动 commit 的范围/,
      /禁止静默提交/,
      /禁止自动合并进 `main`/,
      /并行会话同规/,
      /Git 同步汇总/
    ],
    restatementThreshold: 3,
    forbiddenOutsideSsot: [
      {
        id: 'ask-before-every-commit',
        pattern:
          /(?:任何|每次|所有).{0,12}commit.{0,12}(?:都要|必须|须).{0,8}(?:询问|先问)|先问.{0,8}要不要.{0,8}commit|未经用户.{0,12}不得.{0,8}(?:本地\s*)?commit(?![^。\n]{0,40}汇报)/,
        note: '与「已验证任务可自动 commit」矛盾；废止「先问要不要 commit」'
      },
      {
        id: 'deprecated-no-ask-phrase',
        pattern: /不必询问(?:是否|要不要)?\s*commit/,
        note: '「不必询问」口径已废止；应写「可自动 commit + 必须汇报」并引用 regression-lock'
      },
      {
        id: 'auto-push-allowed',
        pattern: /(?:^|[^\u4e00-\u9fff])(?:允许|可以|应当)(?:post-commit\s*)?自动\s*(?:`?git\s*)?push/,
        note: '禁止 post-commit / 未经确认自动 push'
      }
    ],
    // Historical changelog lines that quote deprecated phrases are OK if marked 废止
    citeExemptFiles: []
  },
  {
    id: 'git-cross-session',
    title: '跨会话指令冲突处理（开 PR / 合并 / push 前）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '跨会话指令冲突处理',
    ssotMustContain: [
      /10–15\s*分钟/,
      /先向用户确认/,
      /仓库客观状态/
    ],
    topicSignals: [
      /跨会话指令冲突/,
      /10–15\s*分钟/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /冷却后再查状态/,
      /发现更晚活动\s*→\s*先问用户/,
      /可查的客观信号/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'must-read-other-chats',
        pattern: /必须阅读其他会话|须读取其他 Agent 对话/,
        note: '不要求读其他会话；只查仓库客观信号'
      }
    ]
  },
  {
    id: 'git-parallel-worktree',
    title: '并行 Cursor 会话须用 git worktree 隔离写操作',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '并行 Cursor 会话：必须用 git worktree 隔离写操作',
    ssotMustContain: [
      /并行写必须独立 worktree/,
      /git worktree add/,
      /禁止两 worktree 同时检出同一分支/
    ],
    topicSignals: [
      /并行 Cursor 会话/,
      /git worktree/,
      /并行写必须独立 worktree/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /并行写必须独立 worktree/,
      /一 worktree\s*↔\s*一分支/,
      /禁止两 worktree 同时检出同一分支/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'same-checkout-parallel-write-ok',
        pattern: /(?:可以|允许|应当)(?:多个|两个)(?:Agent|会话).*(?:同一|同一个)(?:目录|checkout|工作树).*(?:同时写|并行写)/,
        note: '禁止主张同目录并行写可接受；须 worktree 隔离'
      }
    ]
  },
  {
    id: 'regression-gate',
    title: '交互修复完工门禁（主路径+回流、静默失败、冒烟、N14/N15…）',
    ssotPath: '.cursor/rules/focus-tiger-regression-lock.mdc',
    ssotSection: '交互修复完工门禁',
    ssotMustContain: [
      /主路径/,
      /回流路径/,
      /test:smoke/,
      /test:e2e/,
      /待你决定 \/ 待你知道/
    ],
    topicSignals: [
      /交互修复完工门禁/,
      /禁止只验 Happy Path/,
      /回流路径/
    ],
    mustCite: [
      /focus-tiger-regression-lock\.mdc|regression-lock/
    ],
    restatementFingerprints: [
      /禁止用户可点、逻辑静默 return/,
      /自动化冒烟已跑通/,
      /回归锚已补/
    ],
    restatementThreshold: 3,
    // Narrative twin may expand why/how; must still cite SSOT and pass contradiction checks.
    restatementExemptFiles: ['focus-tiger/docs/DEV_WORKFLOW_QUALITY.md'],
    forbiddenOutsideSsot: [
      {
        id: 'happy-path-enough',
        pattern: /只验(?:证)? Happy Path\s*(?:即可|就够|就算|即算)/,
        note: '禁止只验 Happy Path 就宣称修好'
      }
    ]
  },
  {
    id: 'bug-close-s7',
    title: 'Bug close（§7）五证 checklist',
    ssotPath: '.cursor/rules/focus-tiger-regression-lock.mdc',
    ssotSection: 'AI 修复验收规范（Bug close · §7 · 强制）',
    ssotMustContain: [
      /禁止人工复测作为唯一正确性证据/,
      /push 到共享分支/,
      /Bug 修复验收（§7 checklist）/
    ],
    topicSignals: [
      /Bug close|§7 checklist|AI 修复验收规范/,
      /声称.{0,6}已修复/
    ],
    mustCite: [
      /focus-tiger-regression-lock\.mdc|regression-lock|DEV_WORKFLOW_QUALITY\.md.*§7|§7/
    ],
    restatementFingerprints: [
      /禁止人工复测作为唯一正确性证据/,
      /禁止无红绿对照的新增用例/,
      /禁止仅凭本地 commit 声称已修复/
    ],
    restatementThreshold: 3,
    restatementExemptFiles: ['focus-tiger/docs/DEV_WORKFLOW_QUALITY.md'],
    forbiddenOutsideSsot: [
      {
        id: 'local-green-equals-fixed',
        // Avoid matching「不等于」: lookbehind requires 等于 not preceded by 不
        pattern: /本地(?:commit|测试|冒烟).{0,24}(?<!不)等于.{0,8}(?:已修复|修复完成)/,
        note: '本地绿 ≠ Bug close；须 push + CI + §7 checklist'
      }
    ]
  },
  {
    id: 'doc-code-contract',
    title: '文档-代码结构性对齐（docs:check）',
    ssotPath: 'focus-tiger/docs/DOC_CODE_CONTRACT.md',
    ssotSection: 'DOC_CODE_CONTRACT.md',
    ssotMustContain: [
      /npm run docs:check/,
      /代码即文档/,
      /契约测试/
    ],
    topicSignals: [
      /DOC_CODE_CONTRACT/,
      /文档-代码(?:结构性)?对齐/
    ],
    mustCite: [/DOC_CODE_CONTRACT\.md/],
    restatementFingerprints: [
      /高风险契约清单/,
      /sessionUiGateContractRegistry/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: []
  },
  {
    id: 'rules-authority',
    title: '规则主题权威索引（本机制）',
    ssotPath: 'focus-tiger/docs/RULES_INDEX.md',
    ssotSection: '规则主题 → 权威来源',
    ssotMustContain: [
      /规则主题 → 权威来源/,
      /single source of truth|权威来源/,
      /rules-authority-doc-check/
    ],
    topicSignals: [
      /RULES_INDEX\.md/,
      /规则主题.*权威来源/,
      /rules-authority-registry/
    ],
    mustCite: [/RULES_INDEX\.md/],
    restatementFingerprints: [
      /git-agent-commit/,
      /git-merge-main/,
      /restatementFingerprints/
    ],
    restatementThreshold: 3,
    forbiddenOutsideSsot: [
      {
        id: 'last-mtime-wins',
        pattern: /以最后修改时间(?:更晚)?的文档为准/,
        note: '文档冲突不以 mtime 为准，而以 RULES_INDEX 指定的 SSOT 为准'
      }
    ]
  },
  {
    id: 'browser-energy',
    title: '预览浏览器与能耗（默认 Safari；内置 Browser 限时）',
    ssotPath: '.cursor/rules/focus-tiger-browser-energy.mdc',
    ssotSection: 'Focus Tiger · 预览浏览器与能耗',
    ssotMustContain: [
      /请用户用 \*\*Safari\*\* 打开/,
      /最长 10 分钟/,
      /窄屏 \/ 响应式视口/
    ],
    topicSignals: [
      /内置 Browser|Cursor 内置浏览器|browser-energy/,
      /预览浏览器与能耗/,
      /cursor-ide-browser/
    ],
    mustCite: [/focus-tiger-browser-energy\.mdc|browser-energy/],
    restatementFingerprints: [
      /最长 10 分钟/,
      /请用户用 \*\*Safari\*\* 打开/,
      /禁止.*?擅自调用 Cursor 内置 Browser/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'default-cursor-browser',
        pattern: /默认(?:使用|用)\s*Cursor\s*(?:内置\s*)?Browser/,
        note: '默认外置 Safari，不得写成默认用 Cursor 内置 Browser'
      }
    ]
  }
];

/**
 * Narrative / summary docs that may briefly mention a topic if they cite SSOT.
 * Full restatement (fingerprint threshold) is still forbidden outside ssotPath.
 */
export const RULE_AUTHORITY_PRINCIPLE = {
  summary:
    '每个规则主题只有一份权威来源；其它文档只引用不复述；冲突以 SSOT 为准，不以 mtime 为准。',
  checkCommand: 'npm run docs:check',
  syncCommand: 'npm run rules:doc-sync'
};
