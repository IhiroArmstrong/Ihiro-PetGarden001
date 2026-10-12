# chore/committed-git-hooks

| A22 提交钩子指向已进 git 的 .husky（新工作目录不再静默跳过） | 纯后端 | 仅单元测试覆盖 | 不是产品功能。`node --test scripts/check-worktree-occupancy.test.js`：钩子目录缺失、仍指向 .husky/_、未设置 hooksPath、或缺 pre-commit 时 evaluateGitHooksPresence 失败；指向 .husky 且文件在则通过。本机 `git config core.hooksPath` 应为 .husky。不覆盖 App 画面。 | — | — | — | .husky/pre-commit · scripts/git-hooks-presence.js · check-worktree-occupancy.js · WORKFLOW.md | 2026-10-12 |
