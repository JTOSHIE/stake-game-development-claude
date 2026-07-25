<!-- Stake Engine payments page snapshot -->
- topic: payments
- resolved_url: https://stake-engine.com/docs/payments
- fetched: 2026-07-25
- rendered_via: headless Chrome (Claude Browser pane). A plain fetch returns only
  "Loading...", because the docs site is client-rendered.
- looks_real: true
- source_note: page announced in the platform Discord on 2026-07-25 and recorded in
  reports/briefs/FS_PlatformDiscordDump_2026-07-25.md.
- capture_note: body below is a VERBATIM upstream capture.

# Payments

Quoted: "Stake Engine offers two ways to get paid for your games. You pick your payment
model per team and can switch between them at any time from the Payments page — a change
takes effect from the following month."

| In the app | Payment model | Rate |
|---|---|---|
| Profit Share | 10% GGR (Revenue Share) | 10% of actual GGR |
| Guaranteed | 7.5% Guaranteed Payment | 7.5% of expected GGR |

Quoted definition: **"GGR = Total Bets − Total Wins Paid to Players"**

## Option 1: 10% GGR (Revenue Share)

Quoted: "If players get lucky and your game has negative GGR, you do not owe Stake any
money. Instead, a negative balance (debt) is recorded and carried forward."

Key points, quoted:
- "You never pay Stake money out of pocket."
- "A negative balance carries forward indefinitely until future positive earnings offset it."
- "You don't receive payouts until the debt has been cleared."
- "There is no time limit on carrying the balance forward."

## Option 2: 7.5% Guaranteed Payment

Quoted: "you earn 7.5%, but it's calculated using your game's **expected RTP** rather than
the actual results", and "There is no negative balance and no debt — Stake takes on all of
the volatility."

Quoted note: "If you carried a negative balance (debt) from a previous 10% GGR period when
you switch to 7.5%, that existing debt still needs to be earned off first."

## How and when you're paid

Quoted:
- "Add a wallet on your team settings — one wallet per team."
- "Payouts run on the 1st of every month. A paid invoice appears first, then funds are sent
  within 12 hours."
- "We pay out any amount above $0.00 — even $0.10."

## What this means for us

**No build work is owed.** This page is commercial terms, not a technical requirement: it
places no obligation on the game code, the maths package or the submission artefacts.

**It is an owner decision, and it is not urgent but it is not trivial either.** The choice
between 10% of actual GGR and 7.5% of expected GGR is a variance question, and this project
has the unusual advantage of knowing its own variance precisely: base-mode weighted SD is
17.28x, and `super` carries a 1-in-250 wincap. A high-variance five-mode package makes the
carry-forward risk under option 1 real rather than theoretical, since a single wincap-heavy
month can produce negative GGR. Recorded for the owner; no recommendation is made here,
because it is a commercial call and not a compliance one.
