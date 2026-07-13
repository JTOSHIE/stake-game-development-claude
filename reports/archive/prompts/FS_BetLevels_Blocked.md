# Bet Levels Exposure, Blocked

**Game:** Future Spinner, We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Date:** 22 June 2026
**Prompt:** FS_Fix_BetLevels_Currency_Prompt
**Outcome:** Escape hatch triggered for the bet levels. The currency-code change (Task 3) was completed because the currency code is independently readable from a non-locked store.

---

## Summary

The RGS-configured bet levels (`auth.betLevels`) cannot be observed from any non-locked file without either modifying a locked file or re-authenticating the wallet a second time. Both are forbidden by this task. The bet-levels fix is therefore left for a follow-up that is allowed to make a minimal, RTP-neutral change to the locked service. The live currency code fix went ahead and is committed separately.

---

## Investigation (Task 0), what was tried and why each hook does not work

### Hook 1, capture the auth response where `initRGS` is invoked in App.svelte
- **Status:** does not work.
- **Evidence:** `export async function initRGS(...): Promise<void>` at `frontend/src/lib/services/rgsService.ts:393`. It authenticates internally (`:399`), syncs `balance` and `currencyCode` into the game store (`:402-403`), and only logs the bet levels (`:406`). It returns `void`.
- **Why it fails:** App.svelte calls `await initRGS(gameId, token)` (`frontend/src/App.svelte:55`) and receives nothing. There is no return value to capture, so the non-locked caller cannot read `auth.betLevels`.

### Hook 2, call the exported `authenticate` from a non-locked file
- **Status:** available but forbidden.
- **Evidence:** `export async function authenticate(params): Promise<AuthResponse>` at `frontend/src/lib/services/rgsService.ts:300`, and `export function parseSessionParams()` at `:273`. `AuthResponse.betLevels` exists (`:56` interface). A non-locked file could call `authenticate(parseSessionParams())` and read `betLevels` from the result.
- **Why it fails:** this re-authenticates the wallet a second time at boot. The escape hatch explicitly forbids this ("do NOT re-authenticate the wallet a second time as a workaround"). A second authenticate call risks resetting balance, double session handling, or other RGS side effects, so it is not a safe substitute.

### Hook 3, read an existing store that already holds the auth data
- **Status:** works for currency, does not work for bet levels.
- **Evidence:**
  - Currency code is exposed: `export const currencyCode = writable<string>('USD')` at `frontend/src/lib/stores/gameStore.ts:40`, and `initRGS` writes it from the auth response (`rgsService.ts:403`). Any non-locked component can subscribe to `currencyCode`.
  - Bet levels are not exposed anywhere: a repository search for `betLevels` outside `rgsService.ts` returns no matches. `initRGS` does not write the bet levels to any store; it only passes them to `_devLog` (`rgsService.ts:406`). There is no module-level getter or cached auth object exported from the service.
- **Why it fails for bet levels:** the data is fetched and then dropped (logged only). No non-locked store or export carries it.

### Conclusion
`auth.betLevels` is fetched once inside the locked `initRGS`, used only for a debug log, and never returned or stored. The only non-locked paths to it are a second `authenticate` call (forbidden) or a locked-file change (forbidden). The escape hatch applies.

---

## Viable options for a follow-up (for review)

### Option A (recommended), minimal read-only passthrough in the locked service
Add a tiny, RTP-neutral change inside `rgsService.ts` that stores the already-fetched bet levels and currency in a store, without changing any money maths.
- In `initRGS`, after the existing `balance.set` / `currencyCode.set`, add `rgsBetLevels.set(auth.betLevels)` where `rgsBetLevels` is a new writable in a non-locked store (for example `betConfigStore.ts`), imported into the service.
- This does not alter the authenticate call, the micros scale, the 100x book scale, or any payout calculation. It only surfaces data that is already fetched.
- Requires unlocking `rgsService.ts` for this one additive line, or having the math or service owner apply it.
- Lowest risk, single line, no second network call.

### Option B, separate non-locked fetch of the bet configuration
If the RGS exposes a public bet-config or game-config endpoint that does not consume a session, a non-locked service could fetch the bet levels independently of `authenticate`.
- Requires confirming such an endpoint exists in the Stake Engine RGS contract.
- Adds a second network request, but avoids touching the locked wallet flow.
- Risk: the config endpoint may not exist, or may not match the per-session bet levels returned by `authenticate`.

### Option C, have `initRGS` return the auth response
Change the signature of `initRGS` from `Promise<void>` to `Promise<AuthResponse | null>` and return the auth object, so App.svelte can populate `betConfigStore` at the call site.
- Cleanest architecture, but it modifies the locked `rgsService.ts` (signature change), so it needs the lock owner's approval.
- No second network call, no maths change.

**Suggested path:** Option A. It is the smallest change, keeps the wallet flow untouched, and does not affect RTP or the micros arithmetic. Whoever owns the lock on `rgsService.ts` can add the single passthrough line, after which the non-locked `betConfigStore` and selector wiring (Tasks 1 and 2) can be completed exactly as specified.

---

## What was completed under this prompt

- **Task 3, live currency code:** done. `BalanceDisplay.svelte` and `ControlBar.svelte` now render `$currencyCode` (falling back to `USD` only when no code is present) instead of a hardcoded `USD` literal. The value comes from the existing `currencyCode` store that `initRGS` already populates, so no locked file was touched.
- **Tasks 1 and 2, bet levels:** not done, blocked as described above. No locked file was modified and the wallet was not re-authenticated.
