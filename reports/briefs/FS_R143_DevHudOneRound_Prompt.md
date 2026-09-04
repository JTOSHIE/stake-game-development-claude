---

**R143: MAKE DEV HUD AND WAYS FOOTER USE THE SAME ROUND**

Sole live brief. Unattended. Review lane.

### THE FENCE
- Dev / mock path only.
- No maths, hero, art, audio, or kit.
- Do not change `rgsService.ts` winCentibets math.
- Do not change production `recordSpinResult` payout formula.
- Locked files stay locked.

### PRECONDITIONS
- On main. Read R142’s record (the App.svelte override at ~1716–1726 and `lastRoundEvents` / `serveMockRound`).
- Save this brief verbatim.

### GOAL
Owner still sees footer money with HUD $0 or a different amount. R142 proved that is DEV-only. Make the local game self-consistent so a ways line and HUD WIN describe **one spin**.

---

# WORKSTREAM 1 — NAME THE TWO DRAWS

Trace, with file:line:

1. What fills `activeWins` / footer `payout`
2. What fills `winAmount` / HUD WIN on a standing local spin
3. Why they can be different rounds (`serveMockRound` vs `spin()`)

One paragraph. No new theory if R142 already has it.

---

# WORKSTREAM 2 — ONE ROUND

Change the smallest thing that makes both surfaces read the same result.

Preferred: HUD total and `activeWins` both derive from the **same** parsed play response.

Do not invent a third writer. Do not “sync” by copying the footer into the HUD if the engine total includes more than the current line.

Balance / `canAffordSpin` must still block a $100 bet on a $0 wallet. After a real win, HUD WIN must be that win, not $0, while the footer is up.

---

# WORKSTREAM 3 — FIXTURES

At bet $100 and bet $1, prove:

| spin | footer | HUD WIN | notes |
|---|---|---|---|
| ways hit | same dollars | same dollars | banner only if ≥10× |
| miss | empty / $0 | $0 | |
| $0 balance, $100 bet | cannot spin | stays $0 | no stale footer from a previous spin |

Also: `?mockCategory=base_win_mid` footer and HUD match.

Production bundle still must contain zero `serveMockRound` / `mockCategory` references.

---

# WORKSTREAM 4 — QA

- 1280 look-pass: one ways win, HUD equals footer
- reduced motion untouched
- R138 float / R140 strips untouched
- static gates before push

### CLOSE
Dev look-pass no longer contradicts itself. Stake upload still needs a new frontend kit; this change does not replace that.

---

After #143 is on the page, ignore leftover $0 HUD shots from before the pull. Then build the kit and play it on Stake.
