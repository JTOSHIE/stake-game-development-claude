#!/usr/bin/env bash
#
# capture_rgs_400.sh - settle Q6 of FABLE COMMS 040 with evidence instead of a guess.
#
# THE QUESTION. `rgsService.ts` maps a platform error to a player-facing message
# by reading a field of the 400 response body:
#
#     _post()            on !res.ok does `throw json`, the parsed body verbatim
#     handleRGSError()   reads the TOP-LEVEL `code` and matches it against
#                        ERR_VAL / ERR_IPB / ERR_IS / ERR_ATE / ERR_GLE /
#                        ERR_LOC / ERR_GEN / ERR_MAINTENANCE
#
# If a real RGS nests its identifier (`error.code`, `errorCode`, `status.code`),
# the match never fires, every platform error falls through to the generic
# branch, and a player whose session expired is told something else. Nothing in
# docs/stake-engine-live/ states which field is used, so the mapping is recorded
# as UNKNOWN under protocol rule 16 rather than assumed. ONE captured body
# settles it.
#
# WHY THIS SCRIPT EXISTS RATHER THAN A CURL PASTED INTO A SESSION REPORT. The
# capture has to be reproducible by someone who is not this session, and it has
# to be safe to run against a live session, which means the safety argument
# belongs in the file next to the requests rather than in a chat message.
#
# SAFETY, and each point is a deliberate choice, not a precaution in general:
#   - Call 1 and call 3 use a DELIBERATELY INVALID sessionID, so neither can
#     authenticate and call 3 therefore cannot place a bet. The bet amount is
#     sent because the endpoint requires the shape, not because it can be taken.
#   - Call 2 is `authenticate` with the REAL session. That is the same call the
#     game makes at every launch and it settles no round and moves no funds. It
#     is the control: without a 200 beside the 400s, a malformed request and a
#     rejected session look identical.
#   - NO RETRIES anywhere. A retry against a wallet is exactly what
#     walletTimeout.ts exists to prevent.
#   - Nothing is deleted and nothing is overwritten: the capture files refuse to
#     clobber, per convention (h.1).
#
# USAGE. The launch URL is the owner's to supply; this script never invents one.
#
#   tools/capture_rgs_400.sh 'https://.../index.html?sessionID=...&rgs_url=...&lang=en'
#
# Writes to docs/stake-engine-live/captures/<capture date>_wallet_400_<n>.json.
# The date was hardcoded 2026-08-10 until 2026-08-11, which is convention (s)'s
# changing-value-in-an-instruction class caught on the script's first real run:
# it now stamps the day the capture actually happened.
#
# 2026-08-10, Fable ruling block R041 TASK 7.

set -euo pipefail

LAUNCH_URL="${1:-}"
if [ -z "$LAUNCH_URL" ]; then
  cat >&2 <<'USAGE'
capture_rgs_400.sh: the launch URL is required and is never invented.

  tools/capture_rgs_400.sh '<full launch URL with sessionID and rgs_url>'

Until a real URL is supplied, the 400 body shape stays UNKNOWN in the record.
That is the correct state, not a failure of this script.
USAGE
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/docs/stake-engine-live/captures"
mkdir -p "$OUT_DIR"

# ── Parse the launch parameters ──────────────────────────────────────────────
# `sessionID` with a `session` fallback, matching parseSessionParams in
# rgsService.ts, which accepts both. Reading the query string rather than the
# whole URL so a path containing "rgs_url=" cannot be mistaken for the param.
query="${LAUNCH_URL#*\?}"
if [ "$query" = "$LAUNCH_URL" ]; then
  echo "capture_rgs_400.sh: no query string in the URL given" >&2
  exit 2
fi

param() {
  local want="$1" pair key
  local IFS='&'
  for pair in $query; do
    key="${pair%%=*}"
    if [ "$key" = "$want" ]; then
      printf '%s' "${pair#*=}"
      return 0
    fi
  done
  return 1
}

SESSION_ID="$(param sessionID || param session || true)"
RGS_RAW="$(param rgs_url || true)"
LANG_PARAM="$(param lang || true)"
: "${LANG_PARAM:=en}"

[ -n "$SESSION_ID" ] || { echo "capture_rgs_400.sh: no sessionID in the URL" >&2; exit 2; }
[ -n "$RGS_RAW" ]    || { echo "capture_rgs_400.sh: no rgs_url in the URL" >&2; exit 2; }

# ── normaliseRgsUrl, transcribed from rgsService.ts:498 ──────────────────────
# Trim, strip every trailing slash, and add https:// unless a scheme is already
# there. Kept identical on purpose: a capture made against a different host than
# the game uses would answer a different question than the one asked.
normalise_rgs_url() {
  local trimmed="$1"
  trimmed="${trimmed#"${trimmed%%[![:space:]]*}"}"
  trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
  while [ "${trimmed%/}" != "$trimmed" ]; do trimmed="${trimmed%/}"; done
  case "$trimmed" in
    http://*|https://*) printf '%s' "$trimmed" ;;
    *)                  printf 'https://%s' "$trimmed" ;;
  esac
}
RGS_URL="$(normalise_rgs_url "$RGS_RAW")"

INVALID_SESSION="fable-invalid-$(date +%s)"

echo "capture_rgs_400.sh"
echo "  rgs_url        $RGS_URL"
echo "  real session   ${SESSION_ID:0:6}... (not written to any capture file)"
echo "  invalid session $INVALID_SESSION"
echo

# ── One call, captured verbatim ──────────────────────────────────────────────
# --no-buffer and a separated status keep the body EXACTLY as sent: no jq, no
# reformatting. The whole value of this capture is that the bytes are the
# platform's own, so a later reader can see field names we did not anticipate.
capture() {
  local n="$1" label="$2" endpoint="$3" body="$4"
  local out="$OUT_DIR/$(date +%F)_wallet_400_${n}.json"
  if [ -e "$out" ]; then
    echo "  refusing to overwrite $out (convention h.1)" >&2
    return 1
  fi

  local tmp_body tmp_status
  tmp_body="$(mktemp)"; tmp_status="$(mktemp)"
  # No --retry, and a hard timeout so a stalled wallet cannot hang the capture.
  curl -sS -o "$tmp_body" -w '%{http_code}' \
    --max-time 20 \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -X POST "$RGS_URL$endpoint" \
    -d "$body" > "$tmp_status" || true

  local status; status="$(cat "$tmp_status")"
  echo "  [$n] $label -> HTTP ${status:-<none>}"

  # The request body is recorded with the REAL session id redacted; the response
  # is recorded byte for byte, which is the entire point.
  python3 - "$out" "$label" "$endpoint" "$status" "$tmp_body" "$body" "$SESSION_ID" <<'PY'
import json, sys
out, label, endpoint, status, body_path, req, real = sys.argv[1:8]
raw = open(body_path, encoding='utf-8', errors='replace').read()
try:
    parsed = json.loads(raw)
    top = sorted(parsed) if isinstance(parsed, dict) else None
except Exception:
    parsed, top = None, None
json.dump({
    '_what': 'Raw platform response, captured for Q6 of FABLE COMMS 040 (R041 TASK 7).',
    '_reads': 'rgsService.handleRGSError reads the TOP-LEVEL `code`. If `top_level_fields` '
              'below has no `code`, the mapping never fires and every platform error falls '
              'through to the generic branch.',
    'label': label,
    'endpoint': endpoint,
    'http_status': int(status) if status.isdigit() else status,
    'request_body': json.loads(req.replace(real, '<REAL_SESSION_REDACTED>')),
    'response_body_raw': raw,
    'response_body_parsed': parsed,
    'top_level_fields': top,
    'has_top_level_code': isinstance(parsed, dict) and 'code' in parsed,
}, open(out, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('        written', out)
PY
  rm -f "$tmp_body" "$tmp_status"
}

capture 1 'authenticate, INVALID session (expect 400)' /wallet/authenticate \
  "$(printf '{"sessionID":"%s","language":"%s"}' "$INVALID_SESSION" "$LANG_PARAM")"

capture 2 'authenticate, REAL session (control, expect 200)' /wallet/authenticate \
  "$(printf '{"sessionID":"%s","language":"%s"}' "$SESSION_ID" "$LANG_PARAM")"

# amount is 1000000 micros, i.e. 1.00 in display units, and `mode` matches the
# sanctioned additive in rgsService.play. The invalid session guarantees this is
# rejected before any wallet write.
capture 3 'play, INVALID session (expect 400, cannot bet)' /wallet/play \
  "$(printf '{"sessionID":"%s","mode":"base","amount":1000000}' "$INVALID_SESSION")"

echo
echo "Captured. Next: read top_level_fields in each file and report whether the"
echo "error identifier is a top-level 'code'. Until that is done and committed,"
echo "the mapping stays UNKNOWN in OWNER_RULINGS_PRESUBMISSION.md section C."
