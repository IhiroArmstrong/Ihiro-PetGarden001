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

/** @typedef {{ id: string, pattern: RegExp, note: string, exemptIfLineMatches?: RegExp }} ForbiddenClaim */
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
  '.cursor/rules/focus-tiger-agent-token-cost.mdc',
  '.cursor/rules/testing-strategy.mdc',
  'focus-tiger/docs/RULES_INDEX.md',
  'focus-tiger/docs/PROCESS.md',
  'focus-tiger/docs/DEV_WORKFLOW_QUALITY.md',
  'focus-tiger/docs/COLLAB.md',
  'focus-tiger/docs/TEST_TRACKER.md',
  'focus-tiger/docs/Z_INDEX.md',
  'focus-tiger/docs/DOC_CODE_CONTRACT.md',
  'focus-tiger/docs/PRINCIPLES.md',
  'focus-tiger/docs/ARCHITECTURE.md',
  'focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md'
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
      /npm run test:e2e:smoke|npm run test:e2e/,
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
    id: 'git-semver-release',
    title: '语义化版本与稳定发布点（tag，非 release 分支）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '语义化版本与稳定发布点',
    ssotMustContain: [
      /SemVer 2\.0\.0/,
      /annotated Git tag/,
      /v1\.0\.0/,
      /不.*切 `release\//
    ],
    topicSignals: [
      /语义化版本|SemVer/,
      /稳定发布点|稳定版标记/,
      /git-semver-release/,
      /release\/1\.0|release\/<major>/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /annotated Git tag/,
      /第一个交给用户的稳定版/,
      /不.*切 `release\//
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'default-cut-release-branch',
        pattern: /(?:应当|应该|须|需要|默认要)\s*(?:切|开|建)\s*`?release\//,
        note: '开发阶段默认不切 release 分支；稳定版用 annotated tag',
        exemptIfLineMatches: /禁止|主张|不建议|勿/
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
      /请安排下班前的 Git 同步/,
      /非运行时/,
      /禁止默认 flush/,
      /业务逻辑\/代码改动/
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
      },
      {
        id: 'eod-sync-flush-all',
        pattern:
          /下班前(?:的)?\s*Git\s*同步.{0,120}(?:尚未推送的本地\s*commit\s*)?全部\s*(?:`?push`?|推送|flush)/,
        // Option 1: 「全部 push/flush」前 ≤120 字内若出现否定词 → 豁免（规则说明可写禁令句）。
        // Enforced in hasForbiddenOutsideHistory via window-before-全部, not whole-line.
        exemptIfLineMatches:
          /禁止|不再|不要|勿|别再|不得|不可|不应|不能|未再|勿再|别把|不要把|禁止把|废止/,
        note: '下班前口令已收窄为只推非运行时；禁止复述肯定式「全部 push / flush」（「全部」前 120 字否定词豁免）'
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
      /禁止两 worktree 同时检出同一分支/,
      /请清理闲置 worktree/,
      /check:worktree-hygiene/
    ],
    topicSignals: [
      /并行 Cursor 会话/,
      /git worktree/,
      /并行写必须独立 worktree/,
      /请清理闲置 worktree/
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
    id: 'git-worktree-hygiene',
    title: '闲置 worktree 只读盘点 + 口令拆除（不可逆）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '并行 Cursor 会话：必须用 git worktree 隔离写操作',
    ssotMustContain: [
      /请清理闲置 worktree/,
      /check:worktree-hygiene/,
      /最后一次 commit/,
      /禁止.*静默.*worktree remove|禁止.*Agent 静默/,
      /git cherry|cherry origin\/develop/
    ],
    topicSignals: [
      /worktree-hygiene/,
      /请清理闲置 worktree/,
      /check:worktree-hygiene/,
      /闲置 worktree/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [/propose_remove/, /按清单清/],
    restatementThreshold: 2,
    restatementExemptFiles: [
      'focus-tiger/docs/RULES_INDEX.md',
      '.cursor/rules/focus-tiger-regression-lock.mdc'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'silent-worktree-remove',
        pattern:
          /(?:可以|允许|应当|默认)(?:静默|自动|自行)\s*(?:`?git\s*)?worktree\s+remove|(?:静默|自动)拆除.*worktree/,
        note: '禁止主张静默/自动 worktree remove；须口令 + 点名'
      }
    ]
  },
  {
    id: 'git-worktree-occupancy',
    title: '工作树占用检测与 `.ft-session-lock`（一树一线）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '工作树占用检测与 `.ft-session-lock`',
    ssotMustContain: [
      /\.ft-session-lock/,
      /occupancy/,
      /releasable/,
      /不以 mtime 为准/,
      /我确认要强制清除锁/,
      /check:worktree-occupancy/,
      /last_heartbeat/,
      /FT_SESSION_LOCK_STALE_MS|60 分钟/,
      /gate-session-lock-precommit|pre-commit/,
      /禁止主仓.*develop|主仓 `develop`/,
      /N14 播报|会话明显结束/,
      /git-worktree-hygiene|请清理闲置 worktree/
    ],
    topicSignals: [
      /工作树占用/,
      /\.ft-session-lock/,
      /check:worktree-occupancy/,
      /git-worktree-occupancy/,
      /occupancy.*releasable|releasable.*occupancy/,
      /last_heartbeat/,
      /会话明显结束/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /写前检查/,
      /强制清锁/,
      /开工额外检查|三条硬规则/
    ],
    restatementThreshold: 2,
    // RULES_INDEX 修订记录可点名 occupancy 枚举；完整 SOP 仍只在 WORKFLOW.md
    restatementExemptFiles: ['focus-tiger/docs/RULES_INDEX.md'],
    forbiddenOutsideSsot: [
      {
        id: 'mtime-auto-clear-lock',
        pattern:
          /(?:mtime|文件修改时间|几小时前|看起来没人).*(?:自动|自行)(?:清除|删除|清掉).*锁|(?:自动|自行)(?:清除|删除).*锁.*(?:mtime|几小时前)/,
        note: '禁止仅凭 mtime/「几小时前」清非陈旧外锁；陈旧以 last_heartbeat+阈值为准（WORKFLOW）'
      },
      {
        id: 'infer-occupancy-from-mtime',
        pattern: /(?:根据|依据|靠|用)\s*(?:mtime|修改时间|时间戳|git\s*log).*(?:判断|推断|猜测).*(?:占用|活跃|僵锁|可接管)|(?:mtime|时间戳).*(?:说明|证明).*(?:已经结束|可以接管|忘了清锁)/,
        note: '占用态只认锁内 occupancy 字段；禁止用 mtime/git log 旁证推断'
      },
      {
        id: 'silent-stash-others',
        pattern: /(?:可以|允许|应当)(?:静默|直接)\s*(?:`?git\s*)?stash(?:\s+push)?.*(?:别人|其他会话|不明).*改动/,
        note: '禁止静默 stash 别人的未提交改动'
      }
    ]
  },
  {
    id: 'git-feature-merge-preview',
    title: 'feature/fix 合入 develop 前须 worktree 预览确认',
    ssotPath: 'WORKFLOW.md',
    ssotSection: 'feature/fix 合入 develop 前：worktree 预览确认',
    ssotMustContain: [
      /先测后合/,
      /develop-integrity/,
      /occupancy:\s*"releasable"/,
      /两层验收/,
      /预览豁免（严格/,
      /focus-tiger\/src\/\*\*/,
      /comm -12/,
      /origin\/develop\.\.\.HEAD/,
      /HEAD\.\.\.origin\/develop/
    ],
    topicSignals: [
      /合入 develop 前/,
      /worktree 预览确认/,
      /git-feature-merge-preview/,
      /develop-integrity/,
      /先测后合/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /先测后合/,
      /develop-integrity/,
      /两层验收/,
      /comm -12/
    ],
    restatementThreshold: 2,
    // 交叉引用允许点名主题；完整 SOP 仍只在 WORKFLOW.md
    restatementExemptFiles: [
      'focus-tiger/docs/RULES_INDEX.md',
      'focus-tiger/docs/TEST_TRACKER.md',
      'focus-tiger/docs/COLLAB.md'
    ],
    citeExemptFiles: [
      '.github/PULL_REQUEST_TEMPLATE.md'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'merge-first-then-test-as-default',
        pattern: /(?:应当|应该|默认|常规).*(?:先合并|先合入).*develop.*(?:再测|再预览|再验收)|(?:先合进|先 merge 进)\s*`?develop`?.*(?:才|再).*(?:测|预览)/,
        note: '禁止把「先合进 develop 再测」写成默认/应当路径；合前预览见 WORKFLOW.md git-feature-merge-preview'
      }
    ]
  },
  {
    id: 'git-develop-small-pr-run-merge',
    title: 'develop 文档/小 PR：CI 绿后弹 Run 合并（默认习惯）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: 'develop 文档 / 小 PR：CI 绿后弹 Run 合并',
    ssotMustContain: [
      /CI 绿后弹 Run 合并/,
      /git-develop-small-pr-run-merge/,
      /禁止.*默认只写「请你上 GitHub 合并」/,
      /gh pr merge/,
      /--auto --merge/,
      /合进\s*`main`/
    ],
    topicSignals: [
      /git-develop-small-pr-run-merge/,
      /弹 Run 合并/,
      /文档\/小 PR/,
      /CI 绿后.*合并/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /CI 绿后弹 Run 合并/,
      /禁止.*请你上 GitHub 合并/,
      /--auto --merge/
    ],
    restatementThreshold: 2,
    restatementExemptFiles: [
      'focus-tiger/docs/RULES_INDEX.md',
      'focus-tiger/docs/PROCESS.md',
      'focus-tiger/docs/COLLAB.md',
      '.cursor/rules/focus-tiger-regression-lock.mdc',
      '.cursor/rules/focus-tiger-docs.mdc'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'default-github-hand-merge-docs',
        pattern: /(?:文档|小)\s*PR.*(?:应当|应该|默认).*(?:请你|通知你).*(?:GitHub|网页).*合并/,
        note: '文档/小 PR 合 develop 默认走 CI 绿后 Run 合并；勿写回「默认请你上 GitHub 手合」',
        exemptIfLineMatches: /不适用|运行时|main|禁止|除非/
      }
    ]
  },
  {
    id: 'git-pr-base-develop',
    title: '开 PR 须确认 `--base`（默认 develop；禁默认打 main）',
    ssotPath: 'WORKFLOW.md',
    ssotSection: '开 PR 前 · `--base` 自查',
    ssotMustContain: [
      /git-pr-base-develop/,
      /--base develop/,
      /禁止默认打到 `main`/,
      /baseRefName/
    ],
    topicSignals: [
      /git-pr-base-develop/,
      /--base develop/,
      /开 PR 前.*`--base`/
    ],
    mustCite: [/WORKFLOW\.md/],
    restatementFingerprints: [
      /--base develop/,
      /禁止默认打到 `main`/,
      /baseRefName/
    ],
    restatementThreshold: 2,
    restatementExemptFiles: [
      'focus-tiger/docs/RULES_INDEX.md',
      'focus-tiger/docs/PROCESS.md'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'omit-base-rely-on-github-default',
        pattern: /(?:可以|允许|不妨).*(?:省略|不写)\s*`?--base`?.*(?:GitHub|默认)/,
        note: '日常 PR 须显式 --base develop；勿主张省略靠 GitHub 默认',
        exemptIfLineMatches: /禁止|不得|必须|须/
      }
    ]
  },
  {
    id: 'git-branch-health',
    title: '分支健康度（即时纪律 + 双周普查；非 CI 硬拦）',
    ssotPath: 'focus-tiger/docs/PROCESS.md',
    ssotSection: '分支健康度',
    ssotMustContain: [
      /check:all-branches-health/,
      /假 ahead/,
      /Supersedes/,
      /不进 CI Required|不进 CI/
    ],
    topicSignals: [
      /分支健康度/,
      /check:all-branches-health/,
      /假 ahead/,
      /git-branch-health/
    ],
    mustCite: [/PROCESS\.md/],
    restatementFingerprints: [
      /check:all-branches-health/,
      /假 ahead/,
      /Supersedes/
    ],
    restatementThreshold: 2,
    restatementExemptFiles: ['focus-tiger/docs/COLLAB.md'],
    forbiddenOutsideSsot: [
      {
        id: 'branch-health-as-ci-required',
        pattern:
          /(?:勾成|设为|接入|写成)\s*(?:develop\s*)?Required[^。\n]{0,40}check:all-branches-health|check:all-branches-health[^。\n]{0,40}(?:勾成|设为|接入)\s*(?:develop\s*)?Required/,
        note: '分支健康度普查不得写成 CI Required / merge 硬拦'
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
    title:
      '预览浏览器与能耗（默认 Safari；硬禁 IDE Browser MCP；临时解禁有连续时长上限；进程收尾 / Cloud 独立会话提醒；用户侧 cd 路径口径）',
    ssotPath: '.cursor/rules/focus-tiger-browser-energy.mdc',
    ssotSection: 'Focus Tiger · 预览浏览器与能耗',
    ssotMustContain: [
      /请用户用 \*\*Safari\*\*/,
      /deny-ide-browser-mcp/,
      /响应式设计模式/,
      /进程收尾提醒/,
      /和本机完全独立的会话/,
      /完整绝对路径/,
      /最长连续开放 10 分钟/,
      /续开不清零/,
      /精确时间戳/
    ],
    topicSignals: [
      /内置 Browser|Cursor 内置浏览器|browser-energy/,
      /预览浏览器与能耗/,
      /cursor-ide-browser/,
      /deny-ide-browser-mcp/,
      /进程收尾/,
      /完全独立的会话/,
      /完整绝对路径/
    ],
    mustCite: [/focus-tiger-browser-energy\.mdc|browser-energy/],
    restatementFingerprints: [
      /deny-ide-browser-mcp/,
      /请用户用 \*\*Safari\*\*/,
      /禁止.*?调用 Cursor 内置 Browser/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'default-cursor-browser',
        pattern: /默认(?:使用|用)\s*Cursor\s*(?:内置\s*)?Browser/,
        note: '默认外置 Safari，不得写成默认用 Cursor 内置 Browser'
      },
      {
        id: 'allow-ide-browser-exception',
        pattern: /(?:可不事先请示|允许|可以)(?:开|调用).*?(?:内置 Browser|cursor-ide-browser)/,
        note: '2026-07-31 起已硬禁 IDE Browser；不得在非 SSOT 写可开特例'
      }
    ]
  },
  {
    id: 'qa-develop-tip',
    title: '人工验收只认 origin/develop tip',
    ssotPath: 'focus-tiger/docs/TEST_TRACKER.md',
    ssotSection: '人工验收唯一基线',
    ssotMustContain: [
      /人工验收唯一基线/,
      /只认 `origin\/develop` 当前 tip/,
      /一律无效/
    ],
    topicSignals: [
      /人工验收唯一基线/,
      /只认 `origin\/develop`/,
      /qa-develop-tip/
    ],
    mustCite: [/TEST_TRACKER\.md/],
    restatementFingerprints: [
      /人工验收唯一基线/,
      /一律无效/,
      /必须等于.*origin\/develop tip/
    ],
    restatementThreshold: 2,
    restatementExemptFiles: ['focus-tiger/docs/COLLAB.md'],
    forbiddenOutsideSsot: [
      {
        id: 'feature-branch-counts-as-acceptance',
        pattern:
          /(?:feature|fix)\s*分支上(?:的)?(?:人工)?验收(?:结论)?\s*(?:即|就算|视为|算)\s*(?:正式|关单|有效)/,
        note: 'feature/fix 试跑不得写成正式/关单验收；SSOT 在 TEST_TRACKER'
      }
    ]
  },
  {
    id: 'qa-pass-coverage-split',
    title: '标「已通过」须写清 e2e/人工各覆盖哪些场景',
    ssotPath: 'focus-tiger/docs/TEST_TRACKER.md',
    ssotSection: '标「已通过」门禁',
    ssotMustContain: [
      /标「已通过」门禁/,
      /覆盖分工明示/,
      /e2e \/ 自动化已锁/,
      /人工已覆盖/,
      /仍须人工 \/ 未测/,
      /记入 ≠ 验证到位/
    ],
    topicSignals: [
      /qa-pass-coverage-split/,
      /标「已通过」门禁/,
      /覆盖分工明示/,
      /记入 ≠ 验证到位/
    ],
    mustCite: [/TEST_TRACKER\.md/],
    restatementFingerprints: [
      /覆盖分工明示/,
      /e2e \/ 自动化已锁/,
      /仍须人工 \/ 未测/
    ],
    restatementThreshold: 2,
    restatementExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc',
      '.cursor/rules/focus-tiger-docs.mdc',
      'focus-tiger/docs/DEV_WORKFLOW_QUALITY.md'
    ],
    citeExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc',
      '.cursor/rules/focus-tiger-docs.mdc'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'e2e-green-alone-closes-tracker',
        pattern:
          /(?:仅凭|只要|凭).{0,12}(?:e2e|CI).{0,16}(?:绿|通过).{0,20}(?:即可|可以|就能).{0,12}(?:已通过|关单)/,
        note: 'e2e/CI 绿不得单独写成可标 TEST_TRACKER「已通过」；须覆盖分工 + tip 人工'
      },
      {
        id: 'vague-pass-without-coverage-split',
        pattern:
          /(?:笼统|直接).{0,8}标「已通过」.{0,24}(?:无需|不必|不用).{0,16}(?:覆盖|场景)/,
        note: '禁止主张可笼统标已通过而不写覆盖分工；SSOT 在 TEST_TRACKER'
      }
    ]
  },
  {
    id: 'branch-freshness',
    title: 'Agent 邀测 / 声称 develop 行为前须 check:branch-freshness',
    ssotPath: '.cursor/rules/focus-tiger-regression-lock.mdc',
    ssotSection: '分支新鲜度（强制 · 验收 / 声称 develop 行为之前）',
    ssotMustContain: [
      /check:branch-freshness/,
      /behind origin\/develop/,
      /behind > 0/
    ],
    topicSignals: [
      /check:branch-freshness/,
      /分支新鲜度/,
      /behind origin\/develop/
    ],
    mustCite: [
      /focus-tiger-regression-lock\.mdc|regression-lock|分支新鲜度/
    ],
    restatementFingerprints: [
      /check:branch-freshness/,
      /behind > 0/,
      /禁止用本次结果代表 develop/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: []
  },
  {
    id: 'release-blocker-ledger',
    title: '缺陷分级 / open-blockers / 发布候选清算',
    ssotPath: 'focus-tiger/docs/TEST_TRACKER.md',
    ssotSection: '缺陷分级与处理承诺',
    ssotMustContain: [
      /缺陷分级与处理承诺/,
      /release-blocker/,
      /legacy-unclassified/,
      /Fixes:/,
      /技术性补正/,
      /check:open-blockers/
    ],
    topicSignals: [
      /check:open-blockers/,
      /release-blocker/,
      /legacy-unclassified/,
      /缺陷分级与处理承诺/,
      /发布候选门禁/
    ],
    mustCite: [/TEST_TRACKER\.md/],
    restatementFingerprints: [
      /legacy-unclassified/,
      /技术性补正 vs 书面降级/,
      /open-blocker:\s*id=/
    ],
    restatementThreshold: 2,
    // Gate enforcement lives in regression-lock; format details stay in TEST_TRACKER.
    restatementExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc'
    ],
    citeExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'reset-overdue-by-commitment-edit',
        pattern: /(?:改|更新|微调)处理承诺.{0,20}(?:重置|清零).{0,12}(?:7\s*日|逾期)/,
        note: '改处理承诺不得重置 7 日逾期时钟；recorded 锁定'
      },
      {
        id: 'must-open-fix-branch-immediately',
        pattern: /发现问题(?:后)?(?:必须|须)(?:立刻|立即)(?:新开|开)独立\s*`?fix\//,
        note: '不强制发现问题立刻开独立 fix/*；强制的是分级+处理承诺'
      }
    ]
  },
  {
    id: 'z-index-registry',
    title: '产品 z-index 层叠登记',
    ssotPath: 'focus-tiger/docs/Z_INDEX.md',
    ssotSection: 'Z_INDEX.md — 产品层叠登记',
    ssotMustContain: [
      /产品层叠登记/,
      /NarrowIdleShell/,
      /常用冲突带/
    ],
    topicSignals: [
      /Z_INDEX\.md/,
      /z-index 登记|层叠登记/,
      /z-index-registry/
    ],
    mustCite: [/Z_INDEX\.md/],
    restatementFingerprints: [
      /常用冲突带/,
      /NarrowIdleShell.*30/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: []
  },
  {
    id: 'agent-token-cost',
    title: 'Agent Token Cost（禁子 Agent / 禁轮询长 CI / 禁擅自全量 e2e）',
    ssotPath: '.cursor/rules/focus-tiger-agent-token-cost.mdc',
    ssotSection: 'Focus Tiger · Agent Token Cost（控 Fast Request）',
    ssotMustContain: [
      /禁止 Task \/ 子 Agent/,
      /禁止轮询长 CI/,
      /禁止擅自触发全量 e2e/,
      /deny-subagent-start\.sh/
    ],
    topicSignals: [
      /agent-token-cost/,
      /Fast Request/,
      /禁止轮询长 CI/,
      /deny-subagent-start/
    ],
    mustCite: [/focus-tiger-agent-token-cost\.mdc|agent-token-cost/],
    restatementFingerprints: [
      /禁止 Task \/ 子 Agent/,
      /禁止轮询长 CI/,
      /禁止擅自触发全量 e2e/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'default-spawn-subagents',
        pattern: /默认(?:使用|用|开)\s*(?:并行\s*)?(?:子\s*Agent|Task\s*explore)/,
        note: '默认禁止子 Agent；不得写成默认可并行 explore'
      }
    ]
  },
  {
    id: 'e2e-local-budget',
    title:
      '本地 e2e 硬顶（≤1 spec/次；全量/visibility/多文件禁本地；RUN_E2E_LOCAL 逃生口）',
    ssotPath: '.cursor/rules/testing-strategy.mdc',
    ssotSection: '本地 e2e 硬顶（e2e-local-budget · 可执行）',
    ssotMustContain: [
      /e2e-local-budget/,
      /只允许 1 个/,
      /RUN_E2E_LOCAL=true/,
      /gate-local-heavy-e2e\.sh/,
      /run-e2e-changed\.js/
    ],
    topicSignals: [
      /e2e-local-budget/,
      /test:e2e:changed/,
      /本地 e2e 硬顶/,
      /gate-local-heavy-e2e/
    ],
    mustCite: [/testing-strategy\.mdc|e2e-local-budget/],
    restatementFingerprints: [
      /只允许 1 个/,
      /gate-local-heavy-e2e\.sh/,
      /⚠️ 已绕过本地 e2e 硬顶/
    ],
    restatementThreshold: 2,
    // Enforcement + gate checklists may cite the hard cap without full restatement.
    restatementExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc',
      '.cursor/rules/focus-tiger-agent-token-cost.mdc',
      'WORKFLOW.md',
      'focus-tiger/docs/PROCESS.md'
    ],
    citeExemptFiles: [
      '.cursor/rules/focus-tiger-regression-lock.mdc',
      '.cursor/rules/focus-tiger-agent-token-cost.mdc',
      'WORKFLOW.md',
      'focus-tiger/docs/PROCESS.md'
    ],
    forbiddenOutsideSsot: [
      {
        id: 'local-changed-max-two',
        pattern:
          /test:e2e:changed[^。\n]{0,60}最多(?:允许\s*)?2\s*次|最多(?:允许\s*)?2\s*次[^。\n]{0,60}test:e2e:changed/,
        note: '本地 changed 硬顶为 1 个 spec；禁止写回「最多 2 次」平行数字'
      },
      {
        id: 'default-local-full-e2e',
        pattern:
          /(?:可接受|临时接受|应(?:当|该)?|须)\s*(?:\*\*)?本机(?:\*\*)?[^。\n]{0,80}npm run test:e2e/,
        note: '禁止主张默认可本机全量 test:e2e；全量仅 CI 或 RUN_E2E_LOCAL（历史「临时接受」须标已废止）'
      }
    ]
  },
  {
    id: 'risk-mitigation-playbook',
    title: '中高风险任务落地降险 Playbook',
    ssotPath: 'focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md',
    ssotSection: '触发条件',
    ssotMustContain: [
      /切片切的是交付节奏和验证范围，不是切掉项目已有的架构纪律/,
      /资产与逻辑解耦/,
      /功能切片/,
      /优先级门闩/,
      /Feature Flag/,
      /单点硬调/,
      /先接产品钩子/,
      /简化兜底/
    ],
    topicSignals: [
      /risk-mitigation-playbook/,
      /中高风险(?:任务|功能)落地/,
      /降险(?:四件套|Playbook|playbook)/,
      /切片切的是交付节奏/
    ],
    mustCite: [/RISK_MITIGATION_PLAYBOOK\.md|risk-mitigation-playbook/],
    restatementFingerprints: [
      /切片切的是交付节奏和验证范围，不是切掉项目已有的架构纪律/,
      /单点硬调、跳过中央调度/,
      /先接产品钩子、后补动画/,
      /未命中新分支就走/
    ],
    restatementThreshold: 2,
    forbiddenOutsideSsot: [
      {
        id: 'slice-skips-dispatcher',
        pattern: /(?:为了降险|先降险|切片).{0,40}(?:可以|允许|先).{0,20}(?:不碰|跳过|绕开)\s*(?:Dispatcher|中央调度)/,
        note: '降险切片不得写成可跳过 Dispatcher；见 RISK_MITIGATION_PLAYBOOK 架构红线'
      }
    ],
    citeExemptFiles: [
      'focus-tiger/docs/FLOWER_BLOW_WELCOME_DESIGN.md'
    ],
    restatementExemptFiles: [
      'focus-tiger/docs/FLOWER_BLOW_WELCOME_DESIGN.md'
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
