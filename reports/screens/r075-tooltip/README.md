# R075 tooltip frames (2026-08-20)

The speed control hovered in en and de on the R075 tree, the title attribute
read off the live DOM and asserted equal to the localised a11yCycleSpeed
string the adjacent aria-label already used. A title tooltip itself renders
as native browser chrome, which a headless frame cannot show, so the DOM
attribute is the evidence and the frame shows the hovered control.

- en: title attribute reads "Cycle speed (Normal / Turbo / Super Turbo)" (asserted equal to the a11yCycleSpeed en string); aria-label reads "Cycle speed (Normal / Turbo / Super Turbo)"
- de: title attribute reads "Geschwindigkeit wechseln (Normal / Turbo / Super Turbo)" (asserted equal to the a11yCycleSpeed de string); aria-label reads "Geschwindigkeit wechseln (Normal / Turbo / Super Turbo)"

Held permanently by hardcoded_string_gate.mjs rule 2b (R075), whose seeded
self-test plants the exact pre-R075 ternary and whose red run against the
pre-fix tree is quoted in the R075 session report.
