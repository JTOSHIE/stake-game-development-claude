FABLE BRIEF R053: PORTAL REPLAY BOARD, CAPTURE FIRST (2026-08-12)
Owner report with screenshots: on the published portal build, Bet Replay
shows correct multiplier, win, banner and cost line, but the grid stays on
the startup symbol set. Live play renders boards correctly, so the round
data exists and the fault is the replay fetch-and-apply path. Judgement
tier, one session, Australian English, no em or en dashes. Save and commit
verbatim. START APPROVAL IS HELD until the owner confirms the fix live.
TASK 1, CAPTURE. Using the owner-pasted launch URL and Event ID, fetch the
real replay payload exactly as replayService.fetchReplay constructs it
(GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}) and commit the
body verbatim under docs/stake-engine-live/captures/ with the session
redacted. Diff the envelope against the reader's expectation
(response.state.events as RawEvent[], with the state.board fallback) and
name the mismatch precisely. The silent Array.isArray empty fallback is
recorded as the mechanism that hid it.
TASK 2, FIX, unlocked code only. Make the reader accept the real envelope
(tolerant of both shapes where sane, R045 pattern), so the replay applies
the round's actual boards and reel presentation per the replay
requirements. A shape it cannot read must surface an error state, never a
silent startup grid.
TASK 3, PROOF against reality. The replay proof gains a fixture of the
captured real payload and asserts the rendered board state equals the
round's book boards after replay start, frames committed; seeded per (p),
the old stub-only reader must go red against the real fixture.
TASK 4, RESTAGE. Rebuild from the tip; the bundle manifest gate from the
stood-down R052 lands here (bundle equals dist by name, bytes and sha,
seeded); print the bundle path for the owner's delta sync, publish and
stamp check.
CLOSE. Fold the outstanding record notes in the same comms entry: the bgm
silence resolved with no code change (TR-102 scratch-settling window, both
encodes present, loop audible, owner mix ACCEPTED, mix slot closed), the
75-file sync header recorded as observed, and an optional post-approval
polish row for audio element retry on transient load failure. Session
report set, tracker row for the replay finding, CI green, tree clean.
FOR THE NEXT SESSION: nothing; the owner confirms the replay live, then
blurb, trademark line, and Start Approval on the owner's word.
