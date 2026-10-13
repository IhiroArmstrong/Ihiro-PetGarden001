# Confide sealed blind holdout (R-0)

**Do not put sealed JSON here.** This directory is still inside the git worktree; implementation sessions can read it.

Seal outside the workspace: `~/Documents/ft-private/confide-mood-blind-zh/`.

Lab entry: `cd focus-tiger && FT_CONFIDE_BLIND_HOLDOUT_PATH=$HOME/Documents/ft-private/confide-mood-blind-zh/holdout.json npm run audit:confide-holdout`

Stdout is column counts + `interrogative_positive_pass_rate` only. Missing file → `未封存`. Never fall back to the in-repo devset.

Committed machine contract: `src/core/confide/confideEvalGate.js` (frozen no-regression **and** blind pass).
