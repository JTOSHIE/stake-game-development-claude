FABLE MEGA-BRIEF R043: FULL AUTONOMOUS CLOSE-OUT AND CLOSURE AUDIT (2026-08-10)
Verified against main 7f79148598e55d465265dcd5ca53c3fafcd1fa1a and PR #117 head
a5b515675972b81589c65fda30f353b85f987ca4. Owner paste is ratification of every
ruling, wording and sanction in this brief. Run at Opus. Australian English, no
em or en dashes anywhere. Save and commit this brief verbatim before Phase 1.

EXECUTION RULES FOR THE WHOLE RUN
One phase at a time, in order, with one explicit-path commit (or one small
commit series) per phase and CI verified green before the next phase starts.
Stop-on-red: a phase that cannot go green is reverted cleanly, recorded, and the
run continues with the next phase; nothing is left half-applied. Every new or
changed gate ships a seeded violation proven to fire per convention (p), with
seeds anchored on structure, never prose. Derive before measuring: every number
and claim carries a file and line citation. No locked path is written outside
the single conditional sanction in Phase 4. Phase 7 always runs, even if earlier
phases were reverted, and reports the truth of whatever state exists.
DEGRADATION ORDER if constrained: 1, 2, 4, 3, 5, 6, with 7 always last.

PHASE 0. PRECONDITIONS
Confirm clean tree. If PR #117 is open: poll its CI up to 60 minutes; on green,
merge it per the Fable approval block already ratified in FABLE_COMMS, append
the COMMS-ACK 045 closure line, and rebase this run on the result. If its CI is
red, stop the run and report. Record the base SHA in the session report.

PHASE 1. WORDING CLOSE-OUT (sections K and J, majors 12 and 13)
1a. SECTION K, rulesOverdriveTrigger, all locales and any social sibling.
en becomes exactly: 3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an
instant 1×, 3× or 10× base bet.
Non-English: apply the ratified A3 substitution table (Basiseinsatz, apuesta
base, mise de base, 基本ベット, 기본 베팅액, stawki bazowej, aposta base, базовой
ставки, temel bahsinizin stem, cược cơ bản, 基础投注, رهانك الأساسي, taruhan
dasar, peruspanoksesi, बेस बेट) to this key. Where a locale's exact A3 source
phrase does not literally appear, apply the ruled STEM as in the ratified
Japanese precedent (合計 to 基本, suffix untouched) and record each such locale
in the session report. Social sibling, if present, moves to base play.
1b. SECTION J. Extend the committed numeral mechanism's per-locale form table
to the tokens 1.6 and 1.25: the ten comma-decimal locales (de, es, fi, fr, id,
pl, pt, ru, tr, vi) render 1,6 and 1,25; en, ar, hi, ja, ko, zh unchanged.
Apply to modeOverboostBlurb in prose and to any other occurrence the scan
finds; retire the frozen machine_tell entry in both directions.
1c. MAJOR 12, rulesOverdriveModes, whole-string replacement per locale
(locale-correct figures included; these strings supersede, do not re-run the
numeral script over them):
en: All five bet modes return 96.35% RTP. Maximum win 5,000× base bet.
ar: تعيد جميع أوضاع الرهان الخمسة RTP بنسبة 96.35%. أقصى فوز 5,000× من الرهان الأساسي.
de: Alle fünf Einsatzmodi liefern 96,35 % RTP. Maximalgewinn 5.000× Basiseinsatz.
es: Los cinco modos de apuesta devuelven un RTP del 96,35 %. Ganancia máxima: 5.000× la apuesta base.
fi: Kaikki viisi panostilaa palauttavat 96,35 % RTP. Maksimivoitto 5 000× peruspanos.
fr: Les cinq modes de mise offrent un RTP de 96,35 %. Gain maximum : 5 000× la mise de base.
hi: सभी पांच बेट मोड 96.35% RTP देते हैं। अधिकतम जीत 5,000× बेस बेट।
id: Kelima mode taruhan menghasilkan RTP 96,35%. Kemenangan maksimum 5.000× taruhan dasar.
ja: 5つのベットモードはすべてRTP 96.35%です。最大配当は基本ベットの5,000×。
ko: 다섯 가지 베팅 모드 모두 RTP 96.35%입니다. 최대 당첨금은 기본 베팅의 5,000×.
pl: Wszystkie pięć trybów zakładów zwraca RTP 96,35%. Maksymalna wygrana 5 000× stawki bazowej.
pt: Os cinco modos de aposta devolvem 96,35% de RTP. Ganho máximo de 5.000× a aposta base.
ru: Все пять режимов ставок возвращают RTP 96,35 %. Максимальный выигрыш 5 000× от базовой ставки.
tr: Beş bahis modunun tümü %96,35 RTP döndürür. Maksimum kazanç temel bahsin 5.000× katı.
vi: Cả năm chế độ cược đều có RTP 96,35%. Mức thắng tối đa 5.000× cược cơ bản.
zh: 全部五种投注模式的RTP均为96.35%。最高赢额为基础投注的5,000×。
Social (en): All five play modes return 96.35% RTP. Maximum prize 5,000× base play.
1d. MAJOR 13, rulesOverdriveMeter: insert the qualification directly after the
1× in every locale (and the social sibling), leaving every other character of
the sentence untouched:
en:  (5× when entered via NITRO OVERDRIVE)
ar:  (و5× عند الدخول عبر NITRO OVERDRIVE)
de:  (5× bei Einstieg über NITRO OVERDRIVE)
es:  (5× al entrar mediante NITRO OVERDRIVE)
fi:  (5× NITRO OVERDRIVE -tilan kautta)
fr:  (5× en cas d'entrée via NITRO OVERDRIVE)
hi:  (NITRO OVERDRIVE से प्रवेश पर 5×)
id:  (5× jika masuk melalui NITRO OVERDRIVE)
ja: （NITRO OVERDRIVE経由の場合は5×）
ko:  (NITRO OVERDRIVE로 진입 시 5×)
pl:  (5× przy wejściu przez NITRO OVERDRIVE)
pt:  (5× ao entrar via NITRO OVERDRIVE)
ru:  (5× при входе через NITRO OVERDRIVE)
tr:  (NITRO OVERDRIVE ile girişte 5×)
vi:  (5× khi vào qua NITRO OVERDRIVE)
zh: （通过 NITRO OVERDRIVE 进入时为 5×）
1e. KIT BASIS GATE. Turn the discovery method that found K into an instrument:
a gate that greps the BUILT kit per locale for every superseded basis word
(Gesamteinsatz class, per the A3 table) and every en-form figure in the ten
comma-decimal locales, asserting zero. Seeded per (p).
1f. r043_verify supersedes r042_verify (same design: reads this brief verbatim
from its committed copy, evaluates live modules, all Phase 1 strings, seeded
failure proven); r042_verify retires to the archive with a supersession note.

PHASE 2. REPLAY AUDIO (blocker B9)
Wire the replay event stream onto the existing soundService cue map used by
live play: spin start and stop, win presentation and count-up, scatter lands,
feature trigger, wincap. No new assets, no new mixing; the replay surface calls
the same cues the live surface calls for the same events. Global mute and the
music and SFX volume stores are honoured; audio begins only after the user's
replay-start gesture. Proof script drives a social and a real-money replay
against the shipped bundle and asserts cue invocations greater than zero, zero
under mute, and no cue after replay end. Frames and trace committed.

PHASE 3. HYGIENE CLUSTER (register majors, bounded and mechanical)
3a. Documentation currency, derived from the maths package as source of truth
with citations: correct the pre-Overdrive claims in games documentation that
are OUTSIDE the locked package where they contradict game_config.py (register
majors 8 to 11 as applicable; anything inside games/future_spinner/ is locked
and is instead recorded in CLAUDE.md LOCKED_FILE_DEBTS as stale-doc debt riding
the next sanctioned pass); fix the compliance self-assessment rows that
contradict closed tracker rows (majors 17 and 18); record doc_currency's
structural limit finding (major 19) as a tracker row with its predicate gap
named. 3b. Evidence ratchet: migrate all 32 frozen writers to untracked
reports/qa/tmp/ and ratchet to zero; plain runs leave the tree clean, seeded.
3c. Locale instrument wiring: add the prose conformance gate to CI, make its
PART 3 open the paytable, and correct prose.ts's guard attribution comment
(majors 1, 2, 6). 3d. dead_wiring_scan liveness precision (major 7).

PHASE 4. LIVE SETTLE FAILURE (blocker B12, section H). THE MONEY PHASE.
Design, unlocked-first, fail-closed on money. On any live spin rejection, the
optimistic debit is NEVER handed back on assumption. Instead App resyncs from
server truth using the existing recovery machinery: authenticate with the
current session, set the displayed balance from the authoritative response,
then check for an open round. Open round found: engage the settle-failed guard,
show errRoundIncomplete, betting disabled, reload path settles via idempotent
end-round exactly as the recovery leg already does. No open round and balance
confirms the stake was not taken: clear to play. Probe itself fails: guard
engaged, fail closed. Pre-wallet client-side validation failures (never sent)
may refund locally and must be explicitly enumerated. Derive the mid-session
authenticate semantics from the pinned official client before building; if the
pinned client evidences that mid-session authenticate abandons or corrupts an
open round, record the citation and use the sanction below instead.
CONDITIONAL OWNER SANCTION, granted by the owner's paste of this brief, usable
only if the citation above is recorded: lift .claude/settings.json deny lines
8 and 9 (Edit and Write on frontend/src/lib/services/rgsService.ts) for one
minimal change: inside _rgsSpinReal, separate the settle leg so an endRound
failure after a successful play throws an error carrying string code
ERR_SETTLE_FAILED with retryable false, and nothing else changes in the file.
settings.json is restored to a verified empty diff before any commit; the
locked-file diff is quoted in full in the session report.
PROOF, either path: extend the stub RGS to accept play and fail end-round;
assert no refund, guard engaged, banner rendered in German, SPIN blocked at
every route, reload plus recovery settles the round, and per-mode debit
integrity holds at exact integer micros throughout. Seed the superseded
refund-on-rejection behaviour as the negative control and prove the new gate
catches it. The existing stall and recovery proofs must still pass unchanged.

PHASE 5. Q6 CAPTURE, CONDITIONAL
If the owner has pasted a Stake Engine launch URL into this chat before or
during the run, execute tools/capture_rgs_400.sh with it, commit the captured
bodies under docs/stake-engine-live/captures/, and report which top-level field
carries the error identifier against the string code read at rgsService.ts:381.
If no URL exists, the scaffold stays armed and this phase records SKIPPED,
OWNER-GATED.

PHASE 6. MIRROR REFRESH
Re-run the stake-engine live docs mirror tool, diff against the 2026-08-09
capture, log any delta in COMPLIANCE_WATCH.md. Any delta touching a shipped
behaviour is a STOP for owner and Fable, recorded, not actioned.

PHASE 7. CLOSURE AUDIT, ALWAYS RUNS
Full rebuild from HEAD; run every gate and every headless proof including
r043_verify, the kit basis gate, popout, social DOM, replay contract, autoplay,
stall and settle proofs; record kit byte count from build-info.json. Update
REVIEW_TRACKER.md rows for every item this run touched, with dispositions.
Produce reports/audit/AUDIT_CLOSURE_2026-08-10.md: the end-state register
mapping every audit item (blockers, sections E to L, majors actioned here,
AF-1 to AF-4) to CLOSED, OPEN or SKIPPED with evidence citations; the platform
requirements matrix updated; the honest list of everything still open (owner
items, any reverted phase, remaining subjective majors, Q6 if skipped). Session
report appended and archived, this brief committed verbatim, FABLE_COMMS entry
appended, FOR THE NEXT SESSION names the Fable verification round against the
submission candidate as next.

DONE MEANS: every phase either green with CI verified or cleanly reverted and
recorded; no locked write outside the Phase 4 sanction conditions; the closure
report exists and tells the truth; tree clean; all proofs and frames committed.

=== https://stake-engine.com/teams/we-roll-spinners/games/future-spinner/files?launch=true&team=we-roll-spinners&game=future-spinner&currency=USD&language=en&deviceType=desktop&balance=50000000000000&social=false&math=1&front=7&checklist=false&replay=false&amount=1000000 or https://stake-engine.com/teams/we-roll-spinners/games/future-spinner ==  that then gives you the links which you can use via the browser setup. You can utilize my browser ==  complete the prompt: Autonomous workflow, etc
