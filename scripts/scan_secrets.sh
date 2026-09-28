#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scan_secrets.sh — 憑證外洩掃描器（零 API、零外送，全部在本機完成）
#
# 為什麼需要：本專案的事實卡片是從對話紀錄萃取的，而對話裡常夾帶使用者貼過的
# token / API key；另外前端 `output: 'export'` 的產物（out/）是**公開**託管的，
# 一旦把真憑證寫進元件就會直接上 CDN。這支掃描器在「進版控前」與「部署前」
# 兩道關卡攔截，避免憑證離開本機。
#
# 用法:
#   scripts/scan_secrets.sh                # 掃描「即將進版控」的所有檔案（tracked + untracked）
#   scripts/scan_secrets.sh --staged        # 只掃描 git index（pre-commit hook 用）
#   scripts/scan_secrets.sh --deep          # 額外掃描公開部署產物 out/ 與 .next/
#   scripts/scan_secrets.sh --deep out/     # 指定路徑
#
# 退出碼: 0 乾淨 · 1 發現疑似憑證 · 2 環境/用法錯誤
#
# 允許清單：明確標示為示範值的字串（DEMO / NOT-A-REAL / EXAMPLE- / REDACTED …）
# 不會被視為外洩，讓 UI 展示用的假資料可以留在程式碼裡。
#
# 附註：`--deep` 會把 conversations*.json（原始對話彙整檔）納入掃描，它們本來就
# 可能含使用者當年貼過的憑證 → 出現命中屬「預期」，重點是它們必須維持 600 權限
# 且被 .gitignore 排除（scripts/harden_local_secrets.sh 會顧到）。真正該零命中的
# 是 out/ public/ components/ scripts/ 這些會被公開或進版控的內容。
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || exit 2

# 標籤|正則（\b 前置邊界可避免 mask-image-linear-pos 這類 CSS 字串誤判）
PATTERNS=(
  'slack-bot-token|\bxox[baprs]-[A-Za-z0-9-]{8,}'
  'slack-app-token|\bxapp-[A-Za-z0-9-]{8,}'
  'openai-deepseek-key|\bsk-[A-Za-z0-9_-]{16,}'
  'aws-access-key-id|\b(AKIA|ASIA|AROA|AIDA)[0-9A-Z]{12,}'
  'github-token|\b(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{20,}'
  'github-pat|github_pat_[A-Za-z0-9_]{20,}'
  'google-api-key|\bAIza[0-9A-Za-z_-]{20,}'
  'telegram-bot-token|\b[0-9]{8,10}:[A-Za-z0-9_-]{30,}\b'
  'private-key-block|-----BEGIN [A-Z ]{0,20}PRIVATE KEY-----'
)
ALLOWLIST='DEMO|NOT-A-REAL|NOT_REAL|EXAMPLE[_-]|REDACTED|PLACEHOLDER|your-|dummy|CHANGEME'
MAX_SAMPLES="${MAX_SAMPLES:-25}"

MODE="commit"
EXTRA_PATHS=()
for arg in "$@"; do
  case "$arg" in
    --staged) MODE="staged" ;;
    --deep)   MODE="deep" ;;
    -h|--help) sed -n '3,22p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)       echo "scan_secrets: unknown option '$arg'" >&2; exit 2 ;;
    *)        EXTRA_PATHS+=("$arg") ;;
  esac
done

[[ -d .git ]] || { echo "scan_secrets: 不在 git 儲存庫內" >&2; exit 2; }

# ── 決定掃描檔案清單 ─────────────────────────────────────────────────────────
FILES=()
if [[ ${#EXTRA_PATHS[@]} -gt 0 ]]; then
  while IFS= read -r -d '' f; do FILES+=("$f"); done < <(find "${EXTRA_PATHS[@]}" -type f -print0 2>/dev/null)
elif [[ "$MODE" == "staged" ]]; then
  while IFS= read -r -d '' f; do [[ -f "$f" ]] && FILES+=("$f"); done \
    < <(git diff --cached --name-only --diff-filter=ACMR -z)
else
  while IFS= read -r -d '' f; do FILES+=("$f"); done < <(git ls-files -co --exclude-standard -z)
  if [[ "$MODE" == "deep" ]]; then
    # 公開託管的產物（out/）與其來源，加上原始對話檔；跳過 .next/cache（大量二進位快取）
    for d in out .next public; do
      [[ -e "$d" ]] || continue
      while IFS= read -r -d '' f; do FILES+=("$f"); done \
        < <(find "$d" -type f -not -path '*/.next/cache/*' -print0 2>/dev/null)
    done
    for f in conversations.json conversations_cline.json; do [[ -f "$f" ]] && FILES+=("$f"); done
    echo "[scan-secrets] 提示：lancedb_data/ 是壓縮格式、grep 掃不到，請用" >&2
    echo "               python3 scripts/scan_lancedb_secrets.py --all-tables" >&2
  fi
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "[scan-secrets] 沒有需要掃描的檔案（乾淨）"
  exit 0
fi

# ── 掃描 ─────────────────────────────────────────────────────────────────────
FINDINGS=0
SKIPPED_BY_ALLOWLIST=0
printf '[scan-secrets] mode=%s · 掃描 %s 個檔案 …\n' "$MODE" "${#FILES[@]}"

for entry in "${PATTERNS[@]}"; do
  label="${entry%%|*}"
  regex="${entry#*|}"
  # -a：把二進位也當文字（憑證可能藏在 build 產物）；-o：只取匹配片段，
  # 避免 35MB 單行 JSON 被整行載入 shell（這是先前逾時的主因）。
  while IFS= read -r hit; do
    [[ -z "$hit" ]] && continue
    file="${hit%%:*}"
    match="${hit#*:}"
    if grep -qE "$ALLOWLIST" <<<"$match"; then
      SKIPPED_BY_ALLOWLIST=$((SKIPPED_BY_ALLOWLIST + 1))
      continue
    fi
    FINDINGS=$((FINDINGS + 1))
    if [[ "$FINDINGS" -le "$MAX_SAMPLES" ]]; then
      printf '  ❌ [%s] %s → %s…(len=%s)\n' "$label" "$file" "${match:0:6}" "${#match}"
    fi
  done < <(grep -aoHE "$regex" "${FILES[@]}" 2>/dev/null)
done

echo
if [[ "$FINDINGS" -gt 0 ]]; then
  printf '\033[1;31m[scan-secrets] ❌ 發現 %s 處疑似憑證（另有 %s 處因標示為示範值而放行）\033[0m\n' \
    "$FINDINGS" "$SKIPPED_BY_ALLOWLIST"
  echo "  修正方式："
  echo "    1. 真憑證只在 .env（600）或 SSM Parameter Store，不要寫進程式碼。"
  echo "    2. 前端元件若只是展示，改用 EXAMPLE-/DEMO-NOT-A-REAL- 佔位字串。"
  echo "    3. 已外洩的金鑰請直接撤銷並輪替（撤銷比改檔更關鍵）。"
  exit 1
fi
printf '\033[1;32m[scan-secrets] ✅ 未發現憑證（放行 %s 處示範值）\033[0m\n' "$SKIPPED_BY_ALLOWLIST"
exit 0
