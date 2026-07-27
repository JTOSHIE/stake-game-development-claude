# Live portal capture pack, 2026-07-28

Eighteen frames from the owner's portal visit on game entry **`future-spinner-2`**, plus the
trademark and payments frames taken in the same sitting. Committed per convention (h) so an
independent verifier reviews rendering and wallet behaviour from the repository.

Catalogued in the analyst pattern: what the frame SHOWS, then what it PROVES, kept apart.
Frames marked *not individually catalogued* were copied for completeness and have not been
read closely; that is stated rather than covered with a guess.

**The build under test, read off the frames rather than assumed.** The boot line at `071805`
reads `Future Spinner build e0c30611 built 2026-07-27T20:52:53.924Z`, which is exactly the kit
V8 commit, and the bundle hash `index-pDIjyKAp.js` at `071943` matches the JS filename in
`FS_UPLOAD_KIT_V8/02_frontend_upload/assets/`. **Kit V8 is what was uploaded and what these
frames exercise.**

---

## The wallet, and the money

### `072445` and `072516`, Arabic, Cruise: THE FIFTH MODE'S WALLET PROOF

| Frame | Bets settled | Balance shown |
|---|---|---|
| `072445` | 1 (07:24:36, cost EUR 1.00, payout EUR 0.00) | **EUR 999.00** |
| `072516` | 5 (last 07:25:11, cost EUR 1.00, payout **+EUR 0.84**, mult 0.84x) | **EUR 995.84** |

**The arithmetic, and it closes at exactly 1x.**

- The launch URL at `071805` carries `balance=1000000000`, integer micros, so the session
  opened at **EUR 1000.00**. That is an INDEPENDENT input from the frames themselves.
- `072445`: one settled Cruise bet at cost 1.00, payout 0.00. 1000.00 minus 1.00 = **999.00**,
  which is what the frame shows.
- `072516`: five settled Cruise bets, each COST EUR 1.00, payouts 0.00, 0.00, 0.00, 0.00 and
  0.84. 1000.00 minus 5.00 plus 0.84 = **995.84**, which is what the frame shows.

**Both differences resolve exactly, and the platform's own COST column reads EUR 1.00 on every
Cruise bet against a EUR 1.00 stake, which is 1.00x.** That is the wallet proof Cruise never
had. **TR-075 closes.**

Convention (l.4) is satisfied rather than assumed: the starting balance comes from the launch
URL parameter, the per-bet cost comes from the platform's Bets table, and the closing balance
comes from the HUD. Three inputs, not one restated three ways.

### `071943`, the wallet call log: EVERY CALL IS 200

Network panel filtered to `wallet`. Eight entries, and **all eight are status 200**:
`authenticate` preflight, `authenticate` fetch, `authenticate` fetch, `play` preflight,
`play` fetch, `play` fetch, `end-round` fetch, `end-round` preflight.

**No red authenticate appears anywhere in this capture set.** The brief anticipated one; these
frames do not contain it, and it is not recorded as observed here on the strength of a frame
that does not show it. What IS visible is the TR-081 pattern without its error: **two
`authenticate` fetches in one session** where two production call sites can explain at most
that many per boot, so the multiple-authenticate observation stands and the red one does not.

### `072018`, one authenticate in detail

`POST https://rgsd.stake-engine.com/wallet/authenticate`, **200 OK**, origin
`https://we-roll-spinners.live.stake-engine.com`, cloudflare, 2026-07-27 21:15:00 GMT.

---

## The 403, and what it was not

### `071805`, Danish launch, the frame the brief was written about

Shows, in one frame: the launch URL with `language=da` and `balance=1000000000`; the boot line
naming build `e0c30611`; `GET .../approvals/future-spinner-2` **404 (Not Found)**; and three
**403 (Forbidden)** on

```
/api/file/game/we-roll-spinners/future-spinner-2/scratch/front/assets/themes/future-spinner/backgrounds/bg-1.jpg
                                                 ^^^^^^^^^^^^
```

and the same for `bg_base.jpg` and `bg_overdrive.jpg`.

**What it proves:** the failing path is under `scratch/front/`, the platform's unpublished
staging area. **What it does not prove, and what measurement refutes:** that the files are
missing. All three are in the current dist and all three are in the uploaded V8 kit. Full
reasoning in **TR-102**; the dangling-reference defect the investigation uncovered is
**TR-103**.

The approvals 404 is **expected** until Start Approval is pressed, per the owner's ruling, and
is recorded as expected rather than as a fault.

### `072445` and `072516`, six minutes later: THE BACKGROUNDS RENDER

The city, the car and the rain are all present on the same entry. Whatever the scratch-path
state was, it cleared without a code change.

---

## The locale pass, live

### `072135`, the language menu

The platform's Language submenu, showing our sixteen shipped locales (ar, de, en, es, fi, fr,
hi, id, ja, ko, pl, pt, ru, tr, vi, zh) plus **da (Danish)** highlighted as the current
selection. Danish is NOT one of the sixteen, which is exactly the TR-082 fallback case.

### `072445`, `072459`, `072516`, Arabic in play

Arabic rendering right to left on a live round: the balance, win and bet labels, the SPIN
control and the MAX chip all in Arabic, with the Cruise badge and the mode name in place.
**This is the locale pass visible on the platform rather than in a headless capture.**

### `072236`, the screen-preset menu

The DTT Screen menu open over an Arabic frame: Desktop 1200x675, Laptop 1024x576, Popout S
400x225, Popout L 800x450, Mobile L 425x812, Mobile M 375x667, Mobile S 320x568. These are the
seven presets `layout_fit_gate.mjs` measures, confirmed against the platform's own menu.

---

## The owner checklist frames

### `082429` and `082546`, USPTO trademark search

- `082429`: wordmark **"Future Spinner"**, 14,407 results, Live 4,339, Dead 10,068. The two
  visible marks are both `SPINNER`, IC 028, both **DEAD / CANCELLED**.
- `082546`: wordmark **"future spin"**, 16,693 results, Live 4,923, Dead 11,770. First result
  is **FUTURE SPIN**, Serial **88852459**, **Class 041, entertainment services, online games**,
  owner **LIGHT & WONDER, INC. (CORPORATION: NEVADA)**, status **DEAD / ABANDONED**.

**Recorded as evidence, NOT as a clearance.** A near-identical wordmark in our own class, once
held by a major supplier and now abandoned, is exactly the fact the checklist's USPTO item
exists to surface. Whether it clears our use is a legal question for the owner's adviser. The
builder does not rule on it, and nothing here should be read as a view either way.

### `082628`, Payments

Team Payments page. **Profit Share is the selected method**, marked with a tick, 10% GGR,
against Guaranteed at 7.5% return. No payments yet, US$0 on both. The page states: *"For new
publishers: The chosen payment method applies immediately. This option is only avaliable if no
games have been set active."* (The spelling is the platform's own and is quoted verbatim per
convention (l.7).)

---

## Not individually catalogued

`071744` is the owner's LOCAL preview at `192.168.4.92:5173` showing build `6f4be54b` with
uncommitted changes, built 2026-07-26. That is the stale local preview which the owner-preview
rule (rule 12) was written to end, and it is kept as the before-frame for that rule.

`071924`, `072054`, `072202`, `072213`, `072459` were copied for completeness and are not
individually catalogued in this pass.
