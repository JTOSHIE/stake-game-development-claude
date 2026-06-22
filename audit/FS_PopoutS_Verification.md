# Future Spinner, N7 Popout S Live Verification

**Date:** 22 June 2026
**Branch:** `claude/math-sdk-replay-disclaimer-5l617m`
**Commit under test:** `af1e2cb` (freshly rebuilt dist, index matched to assets)
**Method:** headless Chromium (Playwright) against the built `dist/`, single page resized across the six required viewport sizes, measuring layout via `getBoundingClientRect` and document scroll metrics (evaluate-only, no locator waits).

This is the live verification of N7 from the final review (the transform-scale responsive concern), which was deferred to a live pass.

## Result: FAIL at Popout S and at the mobile widths. PASS at Popout L and Desktop.

| Viewport | Horizontal scroll | Vertical scroll | Spin button fully in viewport | Win pod overflow | Verdict |
|----------|-------------------|-----------------|-------------------------------|------------------|---------|
| Mobile S 320x568 | YES (content 696 vs 320) | YES (600 vs 568) | NO | YES | FAIL |
| Mobile M 375x667 | YES (696 vs 375) | YES (699 vs 667) | NO | YES | FAIL |
| Mobile L 425x812 | YES (696 vs 425) | YES (844 vs 812) | yes | YES | FAIL (overflow) |
| Popout S 400x225 | YES (696 vs 400) | YES (326 vs 225) | NO | YES | FAIL |
| Popout L 800x450 | no (800 vs 800) | minor (482 vs 450) | yes | no | PASS (minor 32px vertical) |
| Desktop 1200x675 | no (1200 vs 1200) | minor (707 vs 675) | yes | no | PASS (minor 32px vertical) |

### What this means in plain terms

- The page content is a fixed width of about **696px** regardless of viewport, so any viewport narrower than that (Mobile S, M, L and Popout S) gets a **horizontal scrollbar**.
- At **Popout S (400x225)** the document is 696 wide by 326 tall against a 400x225 viewport. The **spin button is pushed below the visible area and is not reachable without scrolling**, the **win pod overflows**, and the "FUTURE SPINNER" logo is clipped off the right edge (see the screenshot).
- Popout L (800x450) and Desktop (1200x675) are fine apart from a negligible 32px vertical scroll.

### Root cause (confirmed)

`App.svelte` (lines 525 to 551) shrinks only the `.grid-wrapper` with `transform: scale(0.75 / 0.58 / 0.55)`. A CSS transform changes the visual size but **not the layout box**, so the grid still reserves its full 616x412 footprint in flow. On top of that, the logo, header, HUD, and control bar are not scaled at all, and the control bar plus its padding sit at roughly 696px wide. The net effect is a document that does not shrink to fit small viewports, which is exactly the failure predicted in the review.

### Severity

For Stake approval this is a real defect at the required Popout S size (technical performance and functionality pillars): a player in a 400x225 popout cannot see or reach the spin control without scrolling, and the layout overflows. It is not a blocker for the maths or compliance, but it would very likely be flagged in the Stake review of the popout viewports.

### Recommended fix (not applied here; this was a verification pass)

Replace the visual-only `transform: scale` with an approach that also reduces the layout footprint, so the whole game shrinks to fit. Options, in rough order of robustness:

1. Wrap the entire game (`.game-wrapper`, not just `.grid-wrapper`) in a scaling container whose own width and height are set to the scaled dimensions, so the layout box shrinks with the visual scale. For example, apply the scale to a wrapper and set that wrapper's `width`/`height` to the scaled values (or use `zoom` where supported), so siblings reflow against the reduced size.
2. Make the layout genuinely fluid: give the grid a `max-width: 100%` with `aspect-ratio`, scale the logo and control bar with relative units or `min()` widths, and use a column layout that fits the viewport height at landscape popout sizes.
3. Add a dedicated Popout S rule (max-height around 250px and landscape) that scales the whole wrapper down and removes or compacts the header so the grid, win pod, and spin button all fit within 400x225.

After any fix, re-run this same six-size sweep and confirm no horizontal scroll at or above 320px wide, the spin button fully in the viewport at every size, and no win pod or banner overflow.

### Note on test environment

The earlier multi-context viewport probes hung (three strikes) and a blank-screen run was traced to a stale `dist/index.html` (restored by an earlier `git checkout`) that referenced asset hashes which had since been rebuilt, causing 404s and a non-mounting app. Rebuilding so `index.html` matched the assets, and using a single resized page with evaluate-only measurements, produced this clean run. The currency presentation (Q2) was also confirmed at every size (balance "$100.00", bet "$1.00").
