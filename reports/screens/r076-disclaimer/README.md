# R076 disclaimer frames (2026-08-21)

The rules disclaimer as a player meets it, in en, de and social, on the R076
tree: the platform's mandated text verbatim plus the one trademark sentence,
identical in every variant because sixteen locales and both modes now share
the single source in disclaimer.ts. Each frame's rendered text was read off
the live DOM and asserted equal to the joined DISCLAIMER_VERBATIM, which is
the one place the joined form exists (the kit ships the two literals and the
join happens at render).

- en: the rendered p.fs-disc text equals the mandated block plus the trademark sentence, 544 characters, asserted byte-equal after whitespace normalisation
- de: the rendered p.fs-disc text equals the mandated block plus the trademark sentence, 544 characters, asserted byte-equal after whitespace normalisation
- social: the rendered p.fs-disc text equals the mandated block plus the trademark sentence, 544 characters, asserted byte-equal after whitespace normalisation

Held permanently by disclaimer_conformance.test.ts (source, byte-identity
against the constant, mirror re-read every run) and kit_basis_gate.mjs half 5
(kit, both literals present, superseded paraphrase family absent).
