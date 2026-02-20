# Future Spinner — Stake Engine Submission Checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | **Math SDK** — Stateless book-based RNG engine integrated | ✅ PASS | `games/future_spinner/library/publish_files/` contains compressed books (`.jsonl.zst`) and lookup tables |
| 2 | **Stateless** — No server-side session state; all round outcomes deterministic from book | ✅ PASS | `game_metadata.json → stateless: true`; RGS resolves each spin from pre-computed book |
| 3 | **RTP 96.35%** — Verified against Python simulation (≥ 10 M rounds) | ✅ PASS | PAR sheet Section 7: base 71.35% + scatter 20.00% + wincap 5.00% = 96.35%; wincap hard-capped at 5,000× |
| 4 | **Frontend complete** — Vite + Svelte SPA, PixiJS 5×4 grid, full spin flow | ✅ PASS | `frontend/dist/` production build present; ES2020 target; chunked (pixi / svelte / index) |
| 5 | **16 languages** — i18n with 30 keys per locale | ✅ PASS | `translations.ts`: en, ar, de, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh; social-casino mode override |
| 6 | **Mobile responsive** — Adapts to portrait/landscape, ≥ 320 px wide | ✅ PASS | `dvh` units, `clamp()` typography, `@media (max-width: 480px)` portrait background swap |
| 7 | **Error codes handled** — RGS error responses surface to player | ✅ PASS | `errorMessage` store; `error-banner` rendered in `App.svelte`; session expiry + maintenance keys in translations |
| 8 | **High-res assets** — 512 px+ symbol PNGs, UI art | ⏳ PENDING | Placeholder PNG set integrated; final production renders from art team required before submission |
| 9 | **PAR sheet** — Full probability and RTP breakdown document | ✅ PASS | `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`: hit rate 33.57%, win distribution, symbol pay table |
| 10 | **Promo blurb** — 100–200 word storefront description | ✅ PASS | `PROMO_BLURB.md`: 160 words, cyberpunk theme, 5×4 grid, 1,024 ways, Scatter Multiplier (up to 50×) |

---

**Overall status:** 9/10 PASS · 1 PENDING (high-res art assets)

**Build artefact:** `frontend/dist/` — deploy as a static directory; load `index.html` in the RGS iframe with `?session=<token>` query parameter.

**SDK entry point:** `games/future_spinner/run.py` — exposes `play(mode, bet_micros, session_token)` returning a stateless `SpinResult`.
