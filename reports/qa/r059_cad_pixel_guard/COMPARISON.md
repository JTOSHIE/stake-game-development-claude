# R059 CAD pixel guard, 2026-08-14

The real-money path the owner verified correct is guarded across the R059
social fit pass by element screenshots of the three HUD money boxes at
Desktop, Popout S and Mobile S, captured from the pre-change build
(`<name>_<box>.png`, dist at 7d92c229) and the post-change build
(`after_...`), same stub scenario (balance CA$100,000,000.00, max bet).

Result: **7 of 9 shots byte-identical**. The two divergent shots are the
Popout S balance and win boxes, both fitMoney-managed elements whose
screenshot is NOT a stable oracle: capturing the SAME post-change build
twice produced two different balance hashes (the action measures on a
double requestAnimationFrame, so the shot races a sub-pixel settle). Their
rendered TEXT is identical across builds ("BAL CA$100M"; win "$0.00"
idle), and the money fit gate's geometric assertions (no ellipsis, no
overflow, marker visible) run on the CAD leg at all three sizes as the
durable regression guard for exactly these elements.
