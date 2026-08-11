FABLE RULING BLOCK R045: SANCTIONED LOCKED PASS, RGS ERROR FIELD (section C fix)
Verified first-hand at main 675b2b5d against captures 1 to 3. Owner paste of
this block IS the convention (f) sanction. Opus tier. One session, this job
only. Australian English, no em or en dashes.
1. SANCTION, exact: lift .claude/settings.json deny lines 8 and 9 (Edit and
Write on frontend/src/lib/services/rgsService.ts) as a temporary working-tree
edit. The ONLY permitted change in the locked file: in handleRGSError, the
identifier read accepts a string in top-level code OR top-level error, code
winning if both exist, at both the type guard and the cast. No other line
moves. settings.json is restored to a verified empty diff before any commit,
and the full locked-file diff is quoted verbatim in the session report.
2. STRENGTHENING LEG, before the edit: one further capture against the same
scaffold using a syntactically valid but fabricated UUID sessionID, so the
RGS parses the request and answers with its invalid-session class. Commit it
as capture _4. If the observed identifier matches the documented vocabulary,
record it in OWNER_RULINGS section C and proceed; if it does not, record it,
STOP the locked edit, and escalate to Fable with the body verbatim.
3. PROOF: stub RGS returns a 400 whose body is {"error":"ERR_IS"} and the
rendered banner must be the correct session message in en and de; seeded
negative per (p): the single-field read must miss it and the gate must catch
that. The 17-assertion settle proof, the stall proof and the recovery proof
run unchanged and green. LOCKED_FILE_DEBTS in CLAUDE.md is reviewed in the
same pass: any debt this change retires is closed with a citation, none
added.
4. Explicit-path commits, remote CI verified green per rule 10, COMMS ack
folded per (t). FOR THE NEXT SESSION: the external audit refresh, on a build
whose money path now speaks the platform's actual dialect.
