FABLE RULING BLOCK R042 BRIEF B: AUTOPLAY EXPLICIT CONFIRM (blocker B8)
Verified against main 96a80e4. Owner paste is ratification. Sonnet High, one session.
The prior Fable read cited in check_autoplay_confirm_gate.mjs (one tap on a spin count
is the confirmation) is REVERSED against the platform sentence quoted in
COMPLIANCE_WATCH.md: that same click places consecutive bets. Two-step required.
DESIGN: tapping a spin count (including infinity) only SELECTS and shows the selection
with its stop conditions; a separate Start control dispatches autoplay and the first
spin. Infinity is never pre-selected. Spacebar and every other input path must not
reach Start implicitly. startAuto splits into selectAuto and confirmAuto; the RG clamp
and stop-condition wiring are unchanged. New key autoplayStartCta, en then ar, de, es,
fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh:
Start autoplay | بدء اللعب التلقائي | Autoplay starten | Iniciar juego automático | Aloita automaattipeli | Démarrer le jeu automatique | ऑटोप्ले शुरू करें | Mulai putar otomatis | オートプレイを開始 | 자동 플레이 시작 | Rozpocznij grę automatyczną | Iniciar jogo automático | Запустить автоигру | Otomatik oynatmayı başlat | Bắt đầu quay tự động | 开始自动旋转
GATE: rewrite check_autoplay_confirm_gate.mjs to assert isAutoPlay.set(true) is
reachable only from the confirm handler and that no selection handler sets it; seed a
one-click violation per (p) and prove it fires. Refresh autoplay_menu_proof frames.
The responsiblePlayBody paragraph remains true under this design; assert it in the
proof. COMMITS explicit: HudOverlay.svelte, translations.ts, the two scripts,
reports/screens/r042b/, session report set, FABLE_COMMS ack line. DONE MEANS: gates
green including the seeded violation demonstration, before and after frames committed,
one-click start impossible by construction.
