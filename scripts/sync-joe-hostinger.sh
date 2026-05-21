#!/usr/bin/env bash
set -euo pipefail

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree has uncommitted changes. Commit or stash them before syncing Joe."
  git status --short
  exit 1
fi

git fetch --prune --tags --force origin '+refs/heads/*:refs/remotes/origin/*'

advertised_joe="$(git ls-remote --heads origin joe | awk '{print $1}')"
tracked_joe="$(git rev-parse origin/joe)"

if [[ -z "$advertised_joe" ]]; then
  echo "Remote branch origin/joe does not exist."
  exit 1
fi

if [[ "$advertised_joe" != "$tracked_joe" ]]; then
  echo "Fetch mismatch: GitHub advertises $advertised_joe but origin/joe is $tracked_joe."
  exit 1
fi

echo "origin/joe tip:"
git log -1 --format='%h %ci %s' origin/joe

if ! git merge-base --is-ancestor origin/joe HEAD; then
  git merge --no-edit origin/joe
fi

npm run build:hostinger
