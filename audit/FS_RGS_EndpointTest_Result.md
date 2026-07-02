# Future Spinner, Live RGS Endpoint Test, Result

**Date:** 22 June 2026
**Branch:** `claude/math-sdk-replay-disclaimer-5l617m`

## Verdict: BLOCKED in this environment. Must be run from the deployed game in the Stake portal launch context.

The live authenticate, play, end-round test cannot be completed from this sandbox. This is not a fault in the game; it is missing external prerequisites plus a bot-protection layer.

## What was checked, with evidence

- **The game's request contract** (from `frontend/src/lib/services/rgsService.ts`, read-only): all three calls are `POST` with `Content-Type: application/json` to `{rgs_url}`:
  - `/wallet/authenticate` body `{"sessionID": ...}` returns balance, minBet, maxBet, stepBet, betLevels, currency, round (micros).
  - `/wallet/play` body `{"sessionID": ..., "amount": "<micros>"}` returns events, balance, roundId, win.
  - `/wallet/end-round` body `{"sessionID": ..., "roundId": ...}` returns balance, roundId. Called only when win is greater than zero.
- **Network reachability:** `rgs.stake-engine.com` resolves and is reachable from here. A `curl` POST to `/wallet/authenticate` returned a structured RGS validation error (HTTP 400, `ERR_VAL`), so the host and TLS path work.
- **Bot protection:** a standard scripted request (Python urllib) to the same endpoint was blocked by Cloudflare with HTTP 403, error 1010 `browser_signature_banned` ("access blocked based on your browser's signature"). The RGS is fronted by Cloudflare bot protection that rejects non-browser automation from this environment.

## Why it cannot be run here

1. **No deployed game.** The game has not yet been uploaded and submitted via the Stake portal, so there is no game instance on staging to launch against.
2. **No session.** A valid `sessionID` and the game-specific `rgs_url` are issued by the Stake portal only when the deployed game is launched. There is no `.env`, token, or staging URL in the repo or environment.
3. **Bot protection.** Even with a session, the Cloudflare layer blocks raw scripted clients from this sandbox (403 error 1010). The test is designed to run from the game in a real browser launched by the portal, where the request carries a genuine browser signature and a live session.

No further requests were sent to the production endpoint after reachability and the protection layer were confirmed (to avoid tripping rate limits or bans).

## How to run it once deployed (the real test)

The authoritative way is through the deployed game itself:
1. Deploy and submit the bundle (see the submission bundle report). The portal provides a launch URL containing `rgs_url` and `sessionID`.
2. Open the launched game in a browser and watch the network tab: confirm `/wallet/authenticate` returns the balance and bet levels, a spin triggers `/wallet/play` with the bet in micros and returns a round with events, and a winning round triggers `/wallet/end-round` and the balance updates. This is the standard Stake verification and it exercises the exact code path in `rgsService.ts`.

A scripted convenience harness is provided at `audit/rgs_endpoint_test.py` (Python standard library only). It performs the three calls in sequence with the exact request shapes above:

```bash
python3 audit/rgs_endpoint_test.py --rgs-url https://<staging-rgs-host> --session <SESSION_ID>
# or: RGS_URL=... RGS_SESSION=... python3 audit/rgs_endpoint_test.py
```

It prints each request and response and a PASS or FAIL verdict. Note: because of the Cloudflare bot protection observed above, the script may need to be run from a client whose signature is permitted (or from the browser launch context); when the protection blocks it, fall back to the in-browser network-tab verification, which is the definitive test anyway.

## Bottom line

The endpoint contract is correct and documented, the host is reachable, and the test harness is ready. The live run is gated on deploying the game to Stake staging and launching it with a portal-issued session in a browser. Run it as the final pre-approval check immediately after upload.
