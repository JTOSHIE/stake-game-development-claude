# Live wallet captures: the method, and the redaction rule

Created 2026-08-20 by R073 TASK 2. **This directory holds VERBATIM platform response
bodies captured against the live wallet.** Nothing in it is ever composed, reconstructed
or inferred: a body that nobody captured does not get written here in any form, not even
as a placeholder, because a placeholder under this path would eventually be read as
evidence by someone who did not write it.

## Why this directory exists

AUDIT_CLOSURE Q6, "the RGS 400 body field", has been open since 2026-08-10. The estate
models the platform's 400 dialect in `frontend/scripts/money_fit_gate.mjs` and in
`frontend/scripts/r045_error_field_proof.mjs`, and those models are used to prove the
game handles a refusal correctly. **What has never existed is a captured real body to
check the models against.** Until one does, the models are a reasonable reconstruction
and nothing more, and Q6 stays open honestly rather than being closed on a stub.

## The capture, and who runs it

**The request is a `/wallet/play` against the LIVE wallet with a live session, so it is
run by the OWNER and not by a session.** It is the wager endpoint: an accepted request
places a real bet with real money. The refusal is the point of the exercise and the
expected result, but "expected" is not "guaranteed", and the party who carries that risk
is the party who owns the account.

**The amount is deliberately out of range so the platform refuses it.** VERIFIED at HEAD
2026-08-20 by direct read of the shipped ladder: the top rung is 100.00 display units,
which is 100,000,000 micros, and the capture request sends 1,000,000,000 micros, ten
times that. A request an order of magnitude above the highest selectable bet is the
invalid-play-amount case the estate already models, and it is the same boundary
`money_fit_gate` drives against its stub.

## The redaction rule, which is not optional

**The committed copy has the session token replaced with `<REDACTED>` and nothing else
altered.** A session token is a live credential: it authorises play against a real
balance for as long as the tab holding it lives. The response BODY is what Q6 needs, and
the body is what is kept; the request that produced it is recorded by SHAPE, with the
endpoint, the mode and the amount, and never with the token.

## The file shape

One file per capture, named `wallet-play-400_<YYYY-MM-DD>.md`, holding: the capture date,
who ran it, the request shape with the session redacted, the HTTP status, the response
headers worth keeping, and the body **exactly as returned, byte for byte, inside a fenced
block**. Any commentary sits outside the fence so the fence is quotable on its own.

## Current state

**ONE CAPTURE TAKEN, 2026-08-20, and Q6 IS CLOSED ON IT.** The owner ran the call against
the live wallet and returned the body; it is committed at `wallet-play-400_2026-08-20.md`
with the session redacted and nothing else altered. **HTTP 400,
`{"error":"ERR_VAL","message":"invalid amount"}`**, which confirms the top-level
error-field dialect the R045 reader was built for.

**The amount used was 10,000,000,000 micros against a live ceiling of 1,000,000,000**, so
it was ten times the top of the ladder and no wager was placed. **That ceiling is the
LIVE one and it is not the fallback ladder in the source**, a distinction this directory's
first draft got wrong; see the note in the capture file and TR-171.
