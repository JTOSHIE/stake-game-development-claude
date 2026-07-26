# The adopted background, BG: V1, 2026-07-27

Convention (h) evidence for what the background ruling actually shipped.

These fill a real gap rather than duplicating the eye-call sheets. The previous
session was briefed to capture the shipped background against candidate **v2**,
and the owner chose **v1** after seeing it live through the local session. So
until these, nothing in the repository showed the adopted art in frame at the
platform's presets.

Captured against the PRODUCTION build through `vite preview`, with the RGS
stubbed the same way `smallscreen_composition_gate.mjs` stubs it. That matters:
the production build has no `?mock=1`, so an unstubbed capture boots into the
"session could not be verified" banner and puts an error bar across the art.

| File | What it shows |
|---|---|
| `desktop_1200x675.png` | DTT Desktop, the view where the background reads most |
| `mobile_portrait_375x667.png` | DTT Mobile M portrait |
| `popout_s_400x225.png` | DTT Popout S, also showing the TITLE: DROP composition from JOB 1 |
| `desktop_overdrive_off.png` | base layer alone |
| `desktop_overdrive_on.png` | the derived Overdrive variant crossfaded in |

## The Overdrive pair is the one to check

`bg_overdrive.jpg` is derived from the adopted base by
`scripts/assets/background_overdrive_derive.py`, not supplied with it. The
last two captures are the pair, and what they should show is **one city under
two lights**: same skyline, same star, same road, the Overdrive frame hotter,
more magenta and more heavily vignetted.

If a future adoption ever shows two different skylines here, that is the failure
this derivation exists to prevent, and nothing in the build will report it.

## Verified rather than asserted

`reports/qa/background_adopted_proof.json` records, per preset, the background
`src` the page actually served, that both the base and the Overdrive layer
decoded, and that no `candidates/` path survives anywhere in the shipped build.
Three of three presets pass.
