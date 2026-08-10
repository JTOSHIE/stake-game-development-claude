FABLE RULING BLOCK R041 (2026-08-10)
Verified against main ab2f3a2fa4dfbc261cff7412e478c26f2f833737. Answers FABLE COMMS 040
(docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md). Owner paste of this block is
ratification of all wordings herein. Australian English, no em or en dashes anywhere.

BUDGET: one session, Sonnet High. Escalate to Opus after two gate failures per v7.
PLAN OF RECORD: TASK 0 disposition, TASKS 1-4 strings and rewires, TASK 5 gate and
baseline, TASK 6 Q5 record, TASK 7 Q6 capture scaffold (armed only by an owner-pasted
launch URL), TASK 8 board item. Strings land before gate extensions; capture last.
DEGRADATION ORDER if constrained: 1,2,3 (maths-disclosure text) then 4 then 5 then 6,8;
7 waits for the owner URL regardless.
LOCKS: no locked path is touched. rgsService.ts, gameStore.ts, games/future_spinner/
and .claude/settings.json are read-only this pass. No exception is requested.

TASK 0. v6 REQUEST DISPOSITION (no file is created)
The owner's request to commit CLAUDE_PROJECT_INSTRUCTIONS_v6.md was overtaken: v7
(2026-07-25) is on main and v6 is archived under reports/archive/superseded/. Record in
reports/SESSION_REPORT.md and in the COMMS-ACK: v6 sync request received 2026-08-10,
not actioned, v7 remains current, owner is re-pinning v7 project-side. Do not create,
move or edit any instructions file.

TASK 1. Q1 CAP WORDING: replace rulesMaxWin in the standard table of every locale.
Keep the figure exactly "5,000×" in every locale this pass. Escape apostrophes per each
file's existing convention; typographic apostrophes below are intentional.
en (frontend/src/lib/i18n/prose.ts):
  rulesMaxWin: Maximum win per game round is capped at 5,000× your total bet. A game round includes the triggering spin and any free spins it awards.
ar: أقصى فوز في جولة اللعب الواحدة محدود بـ 5,000× من إجمالي رهانك. وتشمل جولة اللعب اللفّة المُشغِّلة وأي دورات مجانية تمنحها.
de: Der Maximalgewinn pro Spielrunde ist auf 5,000× deinen Gesamteinsatz begrenzt. Eine Spielrunde umfasst die auslösende Drehung und alle dadurch gewährten Freispiele.
es: La ganancia máxima por ronda de juego está limitada a 5,000× tu apuesta total. Una ronda de juego incluye el giro que la activa y todos los giros gratis que otorga.
fi: Maksimivoitto pelikierrosta kohden on 5,000× kokonaispanoksesi. Pelikierros sisältää sen käynnistäneen pyöräytyksen ja kaikki sen myöntämät ilmaiskierrokset.
fr: Le gain maximum par tour de jeu est plafonné à 5,000× votre mise totale. Un tour de jeu comprend le tour déclencheur et tous les tours gratuits qu’il accorde.
hi: प्रति गेम राउंड अधिकतम जीत आपके कुल दांव के 5,000× तक सीमित है। एक गेम राउंड में उसे शुरू करने वाला स्पिन और उससे मिलने वाले सभी फ्री स्पिन शामिल हैं।
id: Kemenangan maksimum per ronde permainan dibatasi 5,000× total taruhan Anda. Satu ronde permainan mencakup putaran pemicunya dan semua putaran gratis yang diberikannya.
ja: 1ゲームラウンドあたりの最大配当は合計ベットの5,000×が上限です。ゲームラウンドには、その契機となるスピンと、そこで獲得したすべてのフリースピンが含まれます。
ko: 게임 라운드당 최대 당첨금은 총 베팅액의 5,000×로 제한됩니다. 게임 라운드에는 이를 발동한 스핀과 그로 인해 획득한 모든 프리 스핀이 포함됩니다.
pl: Maksymalna wygrana na rundę gry jest ograniczona do 5,000× całkowitej stawki. Runda gry obejmuje obrót, który ją rozpoczyna, oraz wszystkie przyznane w niej darmowe spiny.
pt: O ganho máximo por rodada de jogo é limitado a 5,000× a sua aposta total. Uma rodada de jogo inclui o giro que a aciona e todos os giros grátis concedidos por ela.
ru: Максимальный выигрыш за игровой раунд ограничен 5,000× от общей ставки. Игровой раунд включает запустивший его спин и все полученные в нём фриспины.
tr: Oyun turu başına maksimum kazanç, toplam bahsinizin 5,000× katı ile sınırlıdır. Bir oyun turu, onu başlatan dönüşü ve bu dönüşün kazandırdığı tüm ücretsiz dönüşleri kapsar.
vi: Mức thắng tối đa mỗi vòng chơi được giới hạn ở 5,000× tổng cược. Một vòng chơi bao gồm lượt quay kích hoạt và tất cả các lượt quay miễn phí mà nó trao.
zh: 每个游戏回合的最高赢额上限为总投注的 5,000×。一个游戏回合包括触发它的那次旋转以及由此获得的所有免费旋转。
PROSE_SOCIAL (en only; social sessions are pinned to locale en):
  rulesMaxWin: Maximum prize per game round is capped at 5,000× your total play. A game round includes the triggering spin and any free spins it awards.

TASK 2. Q2 SCATTER WORDING: replace rulesScatterMult in the standard table of every locale.
en: 3, 4, or 5 SCATTERs anywhere award an instant win of 1×, 3×, or 10× your total bet, added to any other wins.
ar: ظهور 3 أو 4 أو 5 رموز SCATTER في أي مكان يمنح فوزًا فوريًا بقيمة 1× أو 3× أو 10× من إجمالي رهانك، يُضاف إلى أي فوز آخر.
de: 3, 4 oder 5 SCATTER an beliebiger Position vergeben einen Sofortgewinn von 1×, 3× oder 10× deines Gesamteinsatzes, zusätzlich zu allen anderen Gewinnen.
es: 3, 4 o 5 SCATTER en cualquier posición otorgan una ganancia instantánea de 1×, 3× o 10× tu apuesta total, que se suma a cualquier otra ganancia.
fi: 3, 4 tai 5 SCATTER-symbolia missä tahansa kohdassa myöntää välittömän voiton, joka on 1×, 3× tai 10× kokonaispanoksesi ja maksetaan muiden voittojen lisäksi.
fr: 3, 4 ou 5 symboles SCATTER n’importe où sur les rouleaux accordent un gain instantané de 1×, 3× ou 10× votre mise totale, ajouté à tout autre gain.
hi: रीलों पर कहीं भी आने वाले 3, 4, या 5 SCATTER आपके कुल बेट के 1×, 3×, या 10× की तुरंत जीत देते हैं, जो किसी भी अन्य जीत के अतिरिक्त होती है।
id: 3, 4, atau 5 SCATTER di posisi mana pun pada gulungan memberikan kemenangan instan sebesar 1×, 3×, atau 10× total taruhan Anda, yang ditambahkan ke kemenangan lain mana pun.
ja: SCATTERがリール上のどこかに3個、4個、または5個停止すると、それぞれ合計ベット額の1×、3×、または10×の即時配当が、他の配当とは別に加算されます。
ko: SCATTER가 위치에 상관없이 3개, 4개 또는 5개 나오면 총 베팅액의 각각 1×, 3× 또는 10×에 해당하는 즉시 당첨금이 지급되며, 다른 당첨금에 추가로 더해집니다.
pl: 3, 4 lub 5 symboli SCATTER w dowolnym miejscu przyznaje natychmiastową wygraną w wysokości 1×, 3× lub 10× całkowitej stawki, doliczaną do wszelkich innych wygranych.
pt: 3, 4 ou 5 símbolos SCATTER em qualquer posição concedem um ganho instantâneo de 1×, 3× ou 10× a sua aposta total, somado a quaisquer outros ganhos.
ru: 3, 4 или 5 символов SCATTER в любом месте приносят мгновенный выигрыш в размере 1×, 3× или 10× от общей ставки, который добавляется к любым другим выигрышам.
tr: Herhangi bir yerde 3, 4 veya 5 SCATTER, toplam bahsinizin 1×, 3× veya 10× katı tutarında anında kazanç verir; bu kazanç diğer tüm kazançlara eklenir.
vi: 3, 4 hoặc 5 biểu tượng SCATTER ở bất kỳ vị trí nào sẽ trao khoản thắng tức thì bằng 1×, 3× hoặc 10× tổng cược, được cộng thêm vào mọi khoản thắng khác.
zh: 任意位置出现 3、4 或 5 个 SCATTER，将分别奖励总投注 1×、3× 或 10× 的即时赢额，并与其他任何赢额叠加。
PROSE_SOCIAL (en only):
  rulesScatterMult: 3, 4, or 5 SCATTERs anywhere award an instant prize of 1×, 3×, or 10× your total play, added to any other prizes.

TASK 3. Q4 NEW BANNER KEY errRoundIncomplete in translations.ts, all sixteen locales.
Wiring: liveGuard reasons settle-failed and wallet-stalled render errRoundIncomplete;
auth-failed and missing-params keep errSessionUnavailable. No other call site changes.
en: Game unavailable. Your last round could not be completed. Please reload or contact support.
ar: اللعبة غير متاحة. تعذر إكمال جولتك الأخيرة. يرجى إعادة التحميل أو الاتصال بالدعم.
de: Spiel nicht verfügbar. Ihre letzte Runde konnte nicht abgeschlossen werden. Bitte neu laden oder den Support kontaktieren.
es: Juego no disponible. No se ha podido completar tu última ronda. Vuelve a cargar o contacta con soporte.
fi: Peli ei ole käytettävissä. Viimeisintä kierrostasi ei voitu suorittaa loppuun. Lataa sivu uudelleen tai ota yhteyttä tukeen.
fr: Jeu indisponible. Votre dernier tour n’a pas pu être terminé. Veuillez recharger ou contacter le support.
hi: गेम अनुपलब्ध है। आपका पिछला राउंड पूरा नहीं हो सका। कृपया पुनः लोड करें या सहायता से संपर्क करें।
id: Permainan tidak tersedia. Ronde terakhir Anda tidak dapat diselesaikan. Silakan muat ulang atau hubungi dukungan.
ja: ゲームを利用できません。直前のラウンドを完了できませんでした。再読み込みするか、サポートにお問い合わせください。
ko: 게임을 이용할 수 없습니다. 마지막 라운드를 완료하지 못했습니다. 새로 고침하거나 고객지원에 문의하세요.
pl: Gra niedostępna. Nie udało się dokończyć Twojej ostatniej rundy. Odśwież stronę lub skontaktuj się z pomocą techniczną.
pt: Jogo indisponível. Não foi possível concluir a sua última rodada. Recarregue a página ou contacte o suporte.
ru: Игра недоступна. Не удалось завершить ваш последний раунд. Перезагрузите страницу или обратитесь в поддержку.
tr: Oyun kullanılamıyor. Son turunuz tamamlanamadı. Lütfen sayfayı yenileyin veya destek ile iletişime geçin.
vi: Trò chơi không khả dụng. Không thể hoàn tất vòng chơi gần nhất của bạn. Vui lòng tải lại hoặc liên hệ hỗ trợ.
zh: 游戏不可用。您的上一回合未能完成。请重新加载或联系客服。

TASK 4. Q3 UNTRANSLATED STRINGS: ten new keys in translations.ts, all sixteen locales,
plus these exact rewires. Values are listed en, ar, de, es, fi, fr, hi, id, ja, ko, pl,
pt, ru, tr, vi, zh in that order, pipe-separated.
ctrlMute: Mute | كتم الصوت | Stummschalten | Silenciar | Mykistä | Couper le son | म्यूट करें | Bisukan | ミュート | 음소거 | Wycisz | Silenciar | Отключить звук | Sesi kapat | Tắt tiếng | 静音
ctrlUnmute: Unmute | إلغاء كتم الصوت | Stummschaltung aufheben | Activar sonido | Poista mykistys | Réactiver le son | अनम्यूट करें | Bunyikan | ミュート解除 | 음소거 해제 | Wyłącz wyciszenie | Ativar som | Включить звук | Sesi aç | Bật tiếng | 取消静音
colScatters: Scatters | رموز SCATTER | Scatter | Scatters | Scatter | Scatters | SCATTER | Scatter | SCATTER | SCATTER | Scattery | Scatters | SCATTER | Scatter | Scatter | SCATTER
replayBetLabel: Bet | الرهان | Einsatz | Apuesta | Panos | Mise | बेट | Taruhan | ベット | 베팅 | Zakład | Aposta | Ставка | Bahis | Cược | 投注
replayCurrencyLabel: Currency | العملة | Währung | Moneda | Valuutta | Devise | मुद्रा | Mata uang | 通貨 | 통화 | Waluta | Moeda | Валюта | Para birimi | Tiền tệ | 货币
replayModeLabel: Mode: | الوضع: | Modus: | Modo: | Tila: | Mode : | मोड: | Mode: | モード: | 모드: | Tryb: | Modo: | Режим: | Mod: | Chế độ: | 模式：
waysCount ({n} placeholder): {n} ways | {n} طريقة | {n} Gewinnwege | {n} formas | {n} voittotapaa | {n} façons | {n} तरीके | {n} cara | {n}ウェイ | {n} 웨이즈 | {n} sposobów | {n} formas | {n} способов | {n} yol | {n} cách | {n} 路
betUnit: bet | رهان | Einsatz | apuesta | panos | mise | बेट | taruhan | ベット | 베팅 | stawki | aposta | ставки | bahis | cược | 投注
perSpinWhileOn: per spin while ON | لكل لفّة أثناء التفعيل | pro Drehung, solange AN | por giro mientras esté ACTIVADO | per pyöräytys, kun PÄÄLLÄ | par tour tant qu’ACTIVÉ | चालू रहने पर प्रति स्पिन | per putaran selama AKTIF | ON中、スピンごと | ON 상태에서 스핀당 | za obrót, gdy WŁ. | por giro enquanto ATIVADO | за спин, пока ВКЛ. | AÇIK olduğunda dönüş başına | mỗi lượt quay khi BẬT | 开启时每次旋转
baseBetUnit: base bet | الرهان الأساسي | Basiseinsatz | apuesta base | peruspanos | mise de base | बेस बेट | taruhan dasar | 基本ベット | 기본 베팅 | stawki bazowej | aposta base | базовой ставки | temel bahis | cược cơ bản | 基础投注
Recorded decisions: waysCount templates are number-invariant per locale and the n=1
plural edge in de, pl and ru is accepted, matching the shipped en behaviour of "1 ways".
betUnit and baseBetUnit use the genitive in pl and ru because they follow "N×".
Rewires, exact:
  HudOverlay.svelte both audio panels: {$isMuted ? $tr('ctrlUnmute') : $tr('ctrlMute')}
  FeatureMenu.svelte:385 and :440: replace {$isSocial ? 'per spin' : 'bet'} with
    {sv($tr('betUnit'), $isSocial)}  (social is locale en, so sv rewrites bet to play)
  FeatureMenu.svelte:435: replace the literal per spin while ON with
    {sv($tr('perSpinWhileOn'), $isSocial)}
  PaytableModal.svelte:269: <th>{$tr('colScatters')}</th>
  ReplayMode.svelte:394: {$tr('replayModeLabel')} <strong>{params.mode}</strong>
  ReplayMode.svelte:428: {mode === 'social' ? 'Play' : $tr('replayBetLabel')}
  ReplayMode.svelte:444: {mode === 'social' ? 'Token' : $tr('replayCurrencyLabel')}
    (Token and the social branch literals stay by design: social is en-only and
    currency is NOT_SUBSTITUTED, proven by replay_contract_gate.mjs)
  FreeSpinsPresentation.svelte:454: aria-label={$tr('overdriveFreeSpins')}  (reuse,
    zero new translations; uppercase announcement accepted)
  fsModes.ts maxWinVsBaseBetLabel: real-money branch takes the baseBetUnit translation
    for the passed locale; social branch keeps the literal base play.
If $tr or sv is not in scope at a site, import per the file's existing pattern.

TASK 5. GATE AND BASELINE
Extend hardcoded_string_gate.mjs detection so the FeatureMenu.svelte:435 class (an
English literal adjacent to an interpolation) is caught; prove with a seeded violation
(p) that fails before the fix and passes after, per the seeded-violation convention.
Regenerate hardcoded_string_baseline.json to record the fixes only; frozen_count must
reflect reality. If the detector still sees the deliberate social-branch literals
(Play, Token, base play), whitelist them with a one-line reason citing
vocabulary.ts NOT_SUBSTITUTED and the en-pinned social locale.

TASK 6. Q5 DISPOSITION
WALLET_TIMEOUT_MS = 15_000 stands. Append to the walletTimeout.ts comment and to
docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md: ruled 2026-08-10, R041; no
platform p99 or client deadline exists to inherit; if the platform ever publishes
either, reset to the greater of 3× the published p99 or the published deadline.

TASK 7. Q6 CAPTURE SCAFFOLD (armed only by an owner-pasted launch URL; do not invent one)
Create tools/capture_rgs_400.sh: takes the full launch URL as $1, extracts sessionID
and rgs_url, normalises the host per normaliseRgsUrl semantics, then
  1) POST /wallet/authenticate with sessionID "fable-invalid-<epoch>", language en
  2) POST /wallet/authenticate with the real sessionID (control, expected 200)
  3) POST /wallet/play with sessionID from (1) and the minimum valid body shape
and writes each raw response status and body verbatim to
docs/stake-engine-live/captures/2026-08-10_wallet_400_<n>.json. No retries, no
mutation of any real session state beyond those calls. When the owner pastes the URL,
run it, commit the captures, and report which top-level field carries the error
identifier and whether it matches the string code read at rgsService.ts:381. Until
then the mapping stays recorded as UNKNOWN. rgsService.ts is not edited this pass.

TASK 8. BOARD ITEM
Add PROSE_NUMERAL_LOCALE_PASS to the board in the current handover and
WRS_MASTER_DOCUMENT.md: prose figures are en-formatted (5,000×) in all locales while
mode cards are locale-formatted (fsModes.ts fsMaxWinLabel), the TR-037 defect class.
Next brief unless the owner strikes it.

COMMITS: explicit paths only.
  frontend/src/lib/i18n/prose.ts
  frontend/src/lib/i18n/prose.locales.ts
  frontend/src/lib/i18n/translations.ts
  frontend/src/lib/components/HudOverlay.svelte
  frontend/src/lib/components/FeatureMenu.svelte
  frontend/src/lib/components/PaytableModal.svelte
  frontend/src/lib/components/ReplayMode.svelte
  frontend/src/lib/components/FreeSpinsPresentation.svelte
  frontend/src/lib/config/fsModes.ts
  frontend/src/lib/services/walletTimeout.ts
  frontend/src/lib/stores/liveGuard.ts (only if the reason-to-key map lives there)
  frontend/scripts/hardcoded_string_gate.mjs
  frontend/scripts/hardcoded_string_baseline.json
  tools/capture_rgs_400.sh
  docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md
  reports/SESSION_REPORT.md plus dated archive copy, reports/FABLE_COMMS.md,
  reports/briefs/<this brief verbatim>, reports/screens/r041/ proofs

DONE MEANS: all sixteen locales build; disclaimer_conformance.test.ts and
vocabulary.test.ts green; hardcoded_string_gate green at the new baseline with the
seeded violation proven to fire; replay_contract_gate green; cost-integrity soak
untouched and green; screenshots committed to reports/screens/r041/ of the rules
modal in en, de, ja and zh, the replay meta line in real and social, and the HUD
audio menu in one non-en locale; OWNER_RULINGS_PRESUBMISSION.md carries a disposition
line per item; SESSION_REPORT, archive copy and the brief committed; FOR THE NEXT
SESSION block written.

COMMS-ACK 040 (append to reports/FABLE_COMMS.md, newest first):
## 041 - 2026-08-10 - COMMS-ACK 040: R041 rulings received and executed
Fable ruled all six items against main ab2f3a2. Q1 and Q2 restated in sixteen locales
(round scope, instant award). Q3 closed with ten new keys, sv() routing and a twelfth
literal found at FeatureMenu.svelte:435. Q4 closed with errRoundIncomplete. Q5: 15s
stands with an inheritance rule. Q6 stays UNKNOWN; capture scaffold armed, awaiting an
owner launch URL. Owner's stale v6 sync request not actioned; v7 remains current and
is re-pinned project-side. PROSE_NUMERAL_LOCALE_PASS queued.
