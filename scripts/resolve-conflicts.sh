#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this script must be run inside a git repository." >&2
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"

echo "Current branch: ${current_branch}"
echo "Target branch:  ${TARGET_BRANCH}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes before running." >&2
  exit 1
fi

echo "Fetching latest refs..."
git fetch --all --prune

echo "Rebasing ${current_branch} onto origin/${TARGET_BRANCH}..."
set +e
git rebase "origin/${TARGET_BRANCH}"
rebase_code=$?
set -e

if [[ ${rebase_code} -eq 0 ]]; then
  echo "✅ Rebase completed cleanly."
  exit 0
fi

if [[ -n "$(git diff --name-only --diff-filter=U)" ]]; then
  echo
  echo "⚠️ Merge conflicts detected in these files:"
  git diff --name-only --diff-filter=U
  echo
  echo "Next steps:"
  echo "  1) Open each conflicted file and resolve markers (<<<<<<<, =======, >>>>>>>)."
  echo "  2) Stage fixes: git add <file1> <file2> ..."
  echo "  3) Continue rebase: git rebase --continue"
  echo "  4) If needed, abort: git rebase --abort"
  exit 2
fi

echo "Rebase failed without standard conflict markers. Inspect git status for details."
exit ${rebase_code}
