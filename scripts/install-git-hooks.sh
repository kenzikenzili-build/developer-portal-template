#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-git-hooks.sh — 安裝本專案的 git hooks（冪等，可重複執行）
#
# .git/hooks/ 不會進版控，所以 hook 本體放在 scripts/git-hooks/ 並用本腳本
# 安裝；新機器 clone 後執行一次即可。既有 hook 會先備份為 *.bak-<timestamp>。
#
# 用法: scripts/install-git-hooks.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_SRC="$SCRIPT_DIR/git-hooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

[[ -d "$HOOKS_DST" ]] || { echo "找不到 $HOOKS_DST，請確認這是一個 git 儲存庫。" >&2; exit 2; }

for src in "$HOOKS_SRC"/*; do
  [[ -f "$src" ]] || continue
  name="$(basename "$src")"
  dst="$HOOKS_DST/$name"
  if [[ -f "$dst" ]] && ! cmp -s "$src" "$dst"; then
    backup="$dst.bak-$(date +%Y%m%d%H%M%S)"
    cp -p "$dst" "$backup"
    echo "  [backup] 既有 $name → $(basename "$backup")"
  fi
  install -m 0755 "$src" "$dst"
  echo "  [ok] 已安裝 hook: $name"
done

echo
echo "已安裝的 hooks："
ls -l "$HOOKS_DST" | grep -v '^total' | grep -v '\.sample'
