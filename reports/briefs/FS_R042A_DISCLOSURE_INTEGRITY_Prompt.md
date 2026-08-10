FABLE RULING BLOCK R042 BRIEF A: DISCLOSURE INTEGRITY PASS (2026-08-10)
Verified against main 96a80e4d4982f0ad2053fcd519a89377db784951. Answers FABLE COMMS 042
sections E, F, G, I and blockers B1-B7, B10-B11, B13-cause, B14, plus majors 3 and 5.
Owner paste is ratification. Australian English, no em or en dashes anywhere.
BUDGET: one session, Sonnet High; escalate per v7 after two gate failures.
PRECONDITION: git status must be clean before work starts; if not, stop and report.
LOCKS: no locked path touched, no exception requested.

TASK A1. FRENCH APOSTROPHE, ruling (a). Convert the typographic apostrophes in the two
R041 fr strings to the file's escaped straight form. Word content unchanged. Retire the
frozen machine_tell entry in both directions per its own design. Standing direction,
record in CLAUDE.md: player-facing fr standardises on the straight form for submission;
a font-verified typographic pass across all locales is a post-approval cosmetic
candidate, board item TYPOGRAPHIC_APOSTROPHE_PASS. All fr strings later in this block
already use the straight form.

TASK A2. NUMERAL LOCALE PASS, ruling on section F and B2/B3/B4/B6/B11. Write
frontend/scripts/numeral_locale_pass.mjs, deterministic and committed, which rewrites
the figure tokens 5,000 and 96.35 wherever they appear in prose.ts, prose.locales.ts
and any prose-fed literal (modeCruiseBlurb confirmed at every locale), to these exact
forms. en, ar, hi, ja, ko, zh: unchanged (5,000× and 96.35%). Then:
de: 5.000× and 96,35 %
es: 5.000× and 96,35 %
fi: 5 000× and 96,35 %
fr: 5 000× and 96,35 %
id: 5.000× and 96,35%
pl: 5 000× and 96,35%
pt: 5.000× and 96,35%
ru: 5 000× and 96,35 %
tr: 5.000× and %96,35   (percent sign precedes in Turkish)
vi: 5.000× and 96,35%
Grouping spaces are regular U+0020, recorded as a deliberate choice over narrow
no-break. PROSE_SOCIAL is en and unchanged. The script commits a per-locale change
report under reports/qa/ and asserts final bytes; extend the machine tell scan to fail
on an en-form figure (comma-grouped thousands or period decimal beside % or ×) in the
ten comma-decimal locales, seeded per (p).

TASK A3. BASIS CORRECTION, ruling on section I and B7. In rulesMaxWin and
rulesScatterMult only, substitute the bet-basis phrase per locale; every other word of
the R041 sentences stands, and A2's numeral forms apply on top.
en: your total bet > your base bet (both keys)
ar: من إجمالي رهانك > من رهانك الأساسي (both)
de: deinen Gesamteinsatz > deinen Basiseinsatz (rulesMaxWin); deines Gesamteinsatzes > deines Basiseinsatzes (rulesScatterMult)
es: tu apuesta total > tu apuesta base (both)
fi: kokonaispanoksesi > peruspanoksesi (both)
fr: votre mise totale > votre mise de base (both)
hi: आपके कुल दांव के > आपके बेस बेट के (rulesMaxWin); आपके कुल बेट के > आपके बेस बेट के (rulesScatterMult)
id: total taruhan Anda > taruhan dasar Anda (both)
ja: 合計ベットの > 基本ベットの (both)
ko: 총 베팅액의 > 기본 베팅액의 (both)
pl: całkowitej stawki > stawki bazowej (both)
pt: a sua aposta total > a sua aposta base (both)
ru: от общей ставки > от базовой ставки (both)
tr: toplam bahsinizin > temel bahsinizin (both)
vi: tổng cược > cược cơ bản (both)
zh: 总投注 > 基础投注 (both)
PROSE_SOCIAL replacements, whole strings:
rulesMaxWin: Maximum prize per game round is capped at 5,000× your base play. A game round includes the triggering spin and any free spins it awards.
rulesScatterMult: 3, 4, or 5 SCATTERs anywhere award an instant prize of 1×, 3×, or 10× your base play, added to any other prizes.
maxWinFootnote stays as shipped; it was already correct. Derivation recorded in
OWNER_RULINGS section I: cap constant 500,000 centibets in all five published books
against the bet parameter (BOOKS_MANIFEST.md:102-105), so modes costing 1.25x, 100x
and 400x cap at 4,000x, 50x and 12.5x of outlay; base bet is the only uniformly true
basis and matches the footnote and mode cards.

TASK A4. RESPONSIBLE PLAY PARAGRAPH, ruling on section G and B1/B10. New prose key
responsiblePlayBody; move the PaytableModal literal to it; en value is the shipped
paragraph verbatim. Fifteen translations:
ar: يمكن ضبط اللعب التلقائي بحيث يتوقف تلقائيًا عند أي فوز، أو عند تفعيل ميزة Overdrive، أو عند بلوغ حد الخسارة الذي تختاره، ويمكن إيقافه يدويًا في أي وقت. ويتوفر ملخص الجلسة (مدة اللعب، عدد اللفّات، صافي النتيجة) من القائمة.
de: Autoplay kann so eingestellt werden, dass es bei jedem Gewinn, beim Auslösen der Overdrive-Funktion oder beim Erreichen eines von dir gewählten Verlustlimits automatisch stoppt, und kann jederzeit manuell beendet werden. Eine Sitzungsübersicht (Spielzeit, Drehungen, Nettoergebnis) ist über das Menü verfügbar.
es: El juego automático puede configurarse para detenerse automáticamente con cualquier ganancia, cuando se activa la función Overdrive o al alcanzar un límite de pérdida que tú elijas, y siempre puede detenerse manualmente en cualquier momento. Un resumen de la sesión (tiempo jugado, giros, resultado neto) está disponible en el menú.
fi: Automaattipeli voidaan asettaa pysähtymään automaattisesti mihin tahansa voittoon, Overdrive-ominaisuuden käynnistyessä tai valitsemasi tappiorajan täyttyessä, ja sen voi aina pysäyttää manuaalisesti milloin tahansa. Istunnon yhteenveto (peliaika, pyöräytykset, nettotulos) on saatavilla valikosta.
fr: Le jeu automatique peut être réglé pour s'arrêter automatiquement à chaque gain, lorsque la fonction Overdrive se déclenche ou dès qu'une limite de perte que vous choisissez est atteinte, et peut toujours être arrêté manuellement à tout moment. Un résumé de session (temps de jeu, tours, résultat net) est disponible depuis le menu.
hi: ऑटोप्ले को इस तरह सेट किया जा सकता है कि वह किसी भी जीत पर, Overdrive फीचर के ट्रिगर होने पर, या आपकी चुनी हुई हानि सीमा पूरी होने पर अपने आप रुक जाए, और इसे किसी भी समय मैन्युअल रूप से रोका जा सकता है। सत्र का सारांश (खेला गया समय, स्पिन, कुल परिणाम) मेनू से उपलब्ध है।
id: Putar otomatis dapat diatur untuk berhenti secara otomatis pada kemenangan apa pun, saat fitur Overdrive terpicu, atau saat batas kerugian yang Anda pilih tercapai, dan selalu dapat dihentikan secara manual kapan saja. Ringkasan sesi (waktu bermain, jumlah putaran, hasil bersih) tersedia dari menu.
ja: オートプレイは、配当が発生したとき、Overdrive機能が発動したとき、または設定した損失上限に達したときに自動停止するよう設定でき、いつでも手動で停止できます。セッションの概要（プレイ時間、スピン数、収支）はメニューから確認できます。
ko: 자동 플레이는 당첨이 발생할 때, Overdrive 기능이 발동할 때 또는 직접 설정한 손실 한도에 도달할 때 자동으로 중지되도록 설정할 수 있으며, 언제든지 수동으로 중지할 수 있습니다. 세션 요약(플레이 시간, 스핀 수, 순손익)은 메뉴에서 확인할 수 있습니다.
pl: Grę automatyczną można ustawić tak, aby zatrzymywała się automatycznie po każdej wygranej, po uruchomieniu funkcji Overdrive lub po osiągnięciu wybranego przez Ciebie limitu strat, i zawsze można ją zatrzymać ręcznie w dowolnym momencie. Podsumowanie sesji (czas gry, obroty, wynik netto) jest dostępne w menu.
pt: O jogo automático pode ser configurado para parar automaticamente em qualquer ganho, quando a função Overdrive é acionada ou quando um limite de perda escolhido por si é atingido, e pode sempre ser interrompido manualmente a qualquer momento. Um resumo da sessão (tempo de jogo, giros, resultado líquido) está disponível no menu.
ru: Автоигру можно настроить так, чтобы она автоматически останавливалась при любом выигрыше, при срабатывании функции Overdrive или при достижении выбранного вами лимита потерь, и её всегда можно остановить вручную в любой момент. Сводка сессии (время игры, спины, чистый результат) доступна в меню.
tr: Otomatik oynatma, herhangi bir kazançta, Overdrive özelliği tetiklendiğinde veya seçtiğiniz kayıp limitine ulaşıldığında otomatik olarak duracak şekilde ayarlanabilir ve her zaman istenildiği anda manuel olarak durdurulabilir. Oturum özeti (oynama süresi, dönüş sayısı, net sonuç) menüden görülebilir.
vi: Quay tự động có thể được cài đặt để tự dừng khi có bất kỳ khoản thắng nào, khi tính năng Overdrive kích hoạt, hoặc khi đạt đến giới hạn thua do bạn chọn, và luôn có thể dừng thủ công bất cứ lúc nào. Tóm tắt phiên chơi (thời gian chơi, số lượt quay, kết quả ròng) có trong menu.
zh: 自动旋转可设置为在任意赢奖时、Overdrive 功能触发时或达到您选择的损失上限时自动停止，并且随时可以手动停止。会话摘要（游戏时长、旋转次数、净结果）可从菜单中查看。
Retire the frozen paragraph entry, correct the gate's false header claim (B10), and
keep the multi-line detection seeded.

TASK A5 (major 3). Rewire the hardcoded cost word on the Bet Replay money line to the
existing translated costLabel key. Zero new words.

TASK A6 (majors 5 and 16). The fsModes volatility union renders raw English on the
FEATURES cards. New keys volLow, volHigh, volVeryHigh, volExtreme; cards render via
the translation layer. Values en Low | High | Very High | Extreme, then ar, de, es,
fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh:
volLow: منخفض | Niedrig | Baja | Matala | Faible | कम | Rendah | 低 | 낮음 | Niska | Baixa | Низкая | Düşük | Thấp | 低
volHigh: مرتفع | Hoch | Alta | Korkea | Élevée | उच्च | Tinggi | 高 | 높음 | Wysoka | Alta | Высокая | Yüksek | Cao | 高
volVeryHigh: مرتفع جدًا | Sehr hoch | Muy alta | Erittäin korkea | Très élevée | बहुत उच्च | Sangat tinggi | 非常に高い | 매우 높음 | Bardzo wysoka | Muito alta | Очень высокая | Çok yüksek | Rất cao | 很高
volExtreme: قصوى | Extrem | Extrema | Äärimmäinen | Extrême | अत्यधिक | Ekstrem | 極めて高い | 극도로 높음 | Ekstremalna | Extrema | Экстремальная | Ekstrem | Cực cao | 极高
Extend the hardcoded scan to .ts config surfaces, seeded per (p).

TASK A7 (B13 cause). The three gates that write into committed evidence on a plain run
write to untracked reports/qa/tmp/ instead, matching the July migrations; seeded check
that a plain run leaves git status clean.

TASK A8 (B14). Append one SESSION_REPORT section titled RECONSTRUCTED 2026-08-05 to
2026-08-10, summary level from git log only, covering the 45 unreported commits;
archive copy per convention. Reconstruction is labelled as such and invents nothing.

TASK A9. r042_verify.mjs supersedes the r041 pins: same design, reads this brief
verbatim from its committed copy, evaluates the live modules, covers A2 byte forms, A3
sentences in all locales and social, A4, A6, the A5 rewire, proven able to fail per
(p). r041_verify.mjs moves to reports/archive/ with a one-line supersession note.

COMMITS, explicit paths only: frontend/src/lib/i18n/prose.ts, prose.locales.ts,
translations.ts; frontend/src/lib/components/PaytableModal.svelte, ReplayMode.svelte;
frontend/src/lib/config/fsModes.ts; frontend/scripts/numeral_locale_pass.mjs,
machine_tell_gate.mjs, hardcoded_string_gate.mjs, hardcoded_string_baseline.json,
r042_verify.mjs; the three A7 gate files named in the session report;
docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md; reports/SESSION_REPORT.md plus
dated archive, reports/FABLE_COMMS.md, reports/briefs/<this brief verbatim>,
reports/qa/<A2 change report>, reports/screens/r042/ proofs.

DONE MEANS: build green in all sixteen locales; r042_verify PASS with its seeded
failure demonstrated; machine tell, hardcoded, locale and replay contract gates green;
a plain gate run leaves the tree clean; screenshots in reports/screens/r042/ of the de
rules block showing 5.000× and 96,35 % beside the wincap banner, the tr card showing
%96,35, the FEATURES cards in de and ja, and the fr rules block with uniform
apostrophes; dispositions appended; session report, archive and brief committed; FOR
THE NEXT SESSION names R042-D (live settle) as next.

COMMS-ACK 042 (append newest-first): Fable ruled E(a), F per locale table, G with
fifteen translations, I to base bet with book-level derivation; reversed two prior
Fable positions on the record (numeral deferral framing; one-tap autoplay read);
ranked the four blockers with live settle second; absorbed majors 3 and 5; queued
majors 12 and 13 wording for R043; order A, D, B, C, then major clusters.
