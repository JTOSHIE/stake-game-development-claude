/**
 * translations.ts — i18n strings for Future Spinner
 *
 * 16 locales: en ar de es fi fr hi id ja ko pl pt ru tr vi zh
 * Social casino mode remaps: spin→play, win→prize, balance→coins
 */

export type Locale =
  | 'en' | 'ar' | 'de' | 'es' | 'fi' | 'fr'
  | 'hi' | 'id' | 'ja' | 'ko' | 'pl' | 'pt'
  | 'ru' | 'tr' | 'vi' | 'zh'

export type GameMode = 'real' | 'social'

export interface Translations {
  // ── Controls ──────────────────────────────────────────────────────────────
  spin:                 string
  stop:                 string
  endRound:             string
  autoPlay:             string
  // ── Betting ───────────────────────────────────────────────────────────────
  bet:                  string
  betMin:               string
  betMax:               string
  /** @deprecated use betMax */ maxBet: string
  /** @deprecated use betMin */ minBet: string
  // ── HUD labels ────────────────────────────────────────────────────────────
  balance:              string
  win:                  string
  loading:              string
  // ── Bonus / scatter ───────────────────────────────────────────────────────
  buyBonus:             string
  buyBonusDesc:         string
  scatter3:             string
  scatter4:             string
  scatter5:             string
  wincap:               string
  // ── Win celebrations ──────────────────────────────────────────────────────
  bigWin:               string
  hugeWin:              string
  megaWin:              string
  // ── Error / status messages ───────────────────────────────────────────────
  error:                string
  insufficientBalance:  string
  sessionExpired:       string
  maintenanceMode:      string
  locationRestricted:   string
  gamblingLimitReached: string
  // ── UI navigation ─────────────────────────────────────────────────────────
  rules:                string
  paytable:             string
  close:                string
  settings:             string
  // ── Replay mode ───────────────────────────────────────────────────────────
  replayDisclaimer:     string
  // ── Overdrive Free Spins feature (optional: served from featureI18n via t) ──
  overdrive?:              string
  overdriveFreeSpins?:     string
  freeSpins?:              string
  totalWin?:               string
  featureComplete?:        string
  buyFeature?:             string
  buyConfirmTitle?:        string
  buyConfirmBody?:         string
  buyPrice?:               string
  buyConfirm?:             string
  buyCancel?:              string
  rulesOverdriveTitle?:    string
  rulesOverdriveTrigger?:  string
  rulesOverdriveMeter?:    string
  rulesOverdriveRetrigger?: string
  rulesOverdriveBuy?:      string
  rulesOverdriveModes?:    string
}

// Feature strings live in a dedicated per-locale layer so the 16 base locale
// objects stay unchanged. Every locale provides all keys (required here).
export type FeatureKey =
  | 'overdrive' | 'overdriveFreeSpins' | 'freeSpins' | 'totalWin' | 'featureComplete'
  | 'buyFeature' | 'buyConfirmTitle' | 'buyConfirmBody' | 'buyPrice' | 'buyConfirm' | 'buyCancel'
  | 'rulesOverdriveTitle' | 'rulesOverdriveTrigger' | 'rulesOverdriveMeter'
  | 'rulesOverdriveRetrigger' | 'rulesOverdriveBuy' | 'rulesOverdriveModes'
export type FeatureStrings = Record<FeatureKey, string>

// ── English ───────────────────────────────────────────────────────────────────
const en: Translations = {
  spin:                 'SPIN',
  stop:                 'STOP',
  endRound:             'END ROUND',
  autoPlay:             'AUTO',
  bet:                  'BET',
  betMin:               'MIN BET',
  betMax:               'MAX BET',
  maxBet:               'MAX BET',
  minBet:               'MIN BET',
  balance:              'BALANCE',
  win:                  'WIN',
  loading:              'Loading…',
  buyBonus:             'BUY BONUS',
  buyBonusDesc:         'Guaranteed scatter spin — 100× bet',
  scatter3:             '3 SCATTERS — 1× MULTIPLIER',
  scatter4:             '4 SCATTERS — 3× MULTIPLIER',
  scatter5:             '5 SCATTERS — 10× MULTIPLIER!',
  wincap:               '🏆 MAXIMUM WIN — 5,000×!',
  bigWin:               'BIG WIN!',
  hugeWin:              'HUGE WIN!!',
  megaWin:              'MEGA WIN!!!',
  error:                'Connection error. Please try again.',
  insufficientBalance:  'Insufficient balance. Please add funds.',
  sessionExpired:       'Session expired. Please relaunch the game.',
  maintenanceMode:      'Server under maintenance. Please try again shortly.',
  locationRestricted:   'This game is not available in your region.',
  gamblingLimitReached: 'Gambling limit reached.',
  rules:                'RULES',
  paytable:             'PAYTABLE',
  close:                'CLOSE',
  settings:             'SETTINGS',
  replayDisclaimer:     'This is a replay of a previously completed bet, shown for verification only. No funds are wagered and the outcome cannot be changed.',
}

// ── Arabic ────────────────────────────────────────────────────────────────────
const ar: Translations = {
  spin:                 'دوران',
  stop:                 'توقف',
  endRound:             'إنهاء الجولة',
  autoPlay:             'تلقائي',
  bet:                  'رهان',
  betMin:               'أدنى رهان',
  betMax:               'أقصى رهان',
  maxBet:               'أقصى رهان',
  minBet:               'أدنى رهان',
  balance:              'الرصيد',
  win:                  'ربح',
  loading:              'جاري التحميل…',
  buyBonus:             'شراء المكافأة',
  buyBonusDesc:         'ضمان دوران متناثر — 100× الرهان',
  scatter3:             '3 متناثر — مضاعف 1×',
  scatter4:             '4 متناثر — مضاعف 3×',
  scatter5:             '5 متناثر — مضاعف 10×!',
  wincap:               '🏆 الفوز الأقصى — 5,000×!',
  bigWin:               'فوز كبير!',
  hugeWin:              'فوز ضخم!!',
  megaWin:              'فوز ميجا!!!',
  error:                'خطأ في الاتصال. حاول مرة أخرى.',
  insufficientBalance:  'رصيد غير كافٍ. يرجى إضافة أموال.',
  sessionExpired:       'انتهت الجلسة. يرجى إعادة تشغيل اللعبة.',
  maintenanceMode:      'الخادم في وضع الصيانة. حاول لاحقاً.',
  locationRestricted:   'هذه اللعبة غير متاحة في منطقتك.',
  gamblingLimitReached: 'تم الوصول إلى حد المراهنة.',
  rules:                'القواعد',
  paytable:             'جدول الدفع',
  close:                'إغلاق',
  settings:             'الإعدادات',
  replayDisclaimer:     'هذه إعادة لرهان مكتمل سابقاً، تُعرض للتحقق فقط. لا تتم المراهنة بأي أموال ولا يمكن تغيير النتيجة.',
}

// ── German ────────────────────────────────────────────────────────────────────
const de: Translations = {
  spin:                 'DREHEN',
  stop:                 'STOPP',
  endRound:             'RUNDE BEENDEN',
  autoPlay:             'AUTO',
  bet:                  'EINSATZ',
  betMin:               'MIN EINSATZ',
  betMax:               'MAX EINSATZ',
  maxBet:               'MAX EINSATZ',
  minBet:               'MIN EINSATZ',
  balance:              'GUTHABEN',
  win:                  'GEWINN',
  loading:              'Laden…',
  buyBonus:             'BONUS KAUFEN',
  buyBonusDesc:         'Garantierter Scatter-Spin — 100× Einsatz',
  scatter3:             '3 SCATTER — 1-FACH',
  scatter4:             '4 SCATTER — 3-FACH',
  scatter5:             '5 SCATTER — 10-FACH!',
  wincap:               '🏆 MAXIMALER GEWINN — 5.000×!',
  bigWin:               'GROSSER GEWINN!',
  hugeWin:              'RIESIGER GEWINN!!',
  megaWin:              'MEGA-GEWINN!!!',
  error:                'Verbindungsfehler. Bitte versuche es erneut.',
  insufficientBalance:  'Guthaben unzureichend. Bitte aufladen.',
  sessionExpired:       'Sitzung abgelaufen. Bitte Spiel neu starten.',
  maintenanceMode:      'Server in Wartung. Bitte versuche es später.',
  locationRestricted:   'Dieses Spiel ist in deiner Region nicht verfügbar.',
  gamblingLimitReached: 'Spiellimit erreicht.',
  rules:                'REGELN',
  paytable:             'GEWINNTABELLE',
  close:                'SCHLIESSEN',
  settings:             'EINSTELLUNGEN',
  replayDisclaimer:     'Dies ist die Wiederholung eines bereits abgeschlossenen Einsatzes und dient nur zur Überprüfung. Es wird kein Geld eingesetzt und das Ergebnis kann nicht geändert werden.',
}

// ── Spanish ───────────────────────────────────────────────────────────────────
const es: Translations = {
  spin:                 'GIRAR',
  stop:                 'PARAR',
  endRound:             'FIN DE RONDA',
  autoPlay:             'AUTO',
  bet:                  'APUESTA',
  betMin:               'APUESTA MÍN',
  betMax:               'APUESTA MÁX',
  maxBet:               'APUESTA MÁX',
  minBet:               'APUESTA MÍN',
  balance:              'SALDO',
  win:                  'GANANCIA',
  loading:              'Cargando…',
  buyBonus:             'COMPRAR BONUS',
  buyBonusDesc:         'Giro scatter garantizado — 100× apuesta',
  scatter3:             '3 SCATTER — MULTIPLICADOR 1×',
  scatter4:             '4 SCATTER — MULTIPLICADOR 3×',
  scatter5:             '5 SCATTER — ¡MULTIPLICADOR 10×!',
  wincap:               '🏆 ¡GANANCIA MÁXIMA — 5.000×!',
  bigWin:               '¡GRAN GANANCIA!',
  hugeWin:              '¡¡ENORME GANANCIA!!',
  megaWin:              '¡¡¡MEGA GANANCIA!!!',
  error:                'Error de conexión. Inténtalo de nuevo.',
  insufficientBalance:  'Saldo insuficiente. Por favor añade fondos.',
  sessionExpired:       'Sesión caducada. Por favor relanza el juego.',
  maintenanceMode:      'Servidor en mantenimiento. Inténtalo de nuevo pronto.',
  locationRestricted:   'Este juego no está disponible en tu región.',
  gamblingLimitReached: 'Límite de apuestas alcanzado.',
  rules:                'REGLAS',
  paytable:             'TABLA DE PAGOS',
  close:                'CERRAR',
  settings:             'CONFIGURACIÓN',
  replayDisclaimer:     'Esta es la repetición de una apuesta ya completada, mostrada solo con fines de verificación. No se apuesta dinero y el resultado no se puede cambiar.',
}

// ── Finnish ───────────────────────────────────────────────────────────────────
const fi: Translations = {
  spin:                 'PYÖRITÄ',
  stop:                 'PYSÄYTÄ',
  endRound:             'LOPETA KIERROS',
  autoPlay:             'AUTO',
  bet:                  'PANOS',
  betMin:               'MINIMIPANOS',
  betMax:               'MAKSIMIPANOS',
  maxBet:               'MAKSIMIPANOS',
  minBet:               'MINIMIPANOS',
  balance:              'SALDO',
  win:                  'VOITTO',
  loading:              'Ladataan…',
  buyBonus:             'OSTA BONUS',
  buyBonusDesc:         'Taattu scatter-pyöritys — 100× panos',
  scatter3:             '3 SCATTER — 1× KERROIN',
  scatter4:             '4 SCATTER — 3× KERROIN',
  scatter5:             '5 SCATTER — 10× KERROIN!',
  wincap:               '🏆 MAKSIMIVOITTO — 5 000×!',
  bigWin:               'ISO VOITTO!',
  hugeWin:              'VALTAVA VOITTO!!',
  megaWin:              'MEGA VOITTO!!!',
  error:                'Yhteysvirhe. Yritä uudelleen.',
  insufficientBalance:  'Saldo riittämätön. Lisää varoja.',
  sessionExpired:       'Istunto vanhentunut. Käynnistä peli uudelleen.',
  maintenanceMode:      'Palvelin huollossa. Yritä myöhemmin.',
  locationRestricted:   'Tämä peli ei ole saatavilla alueellasi.',
  gamblingLimitReached: 'Pelirajasi on saavutettu.',
  rules:                'SÄÄNNÖT',
  paytable:             'MAKSUTAULUKKO',
  close:                'SULJE',
  settings:             'ASETUKSET',
  replayDisclaimer:     'Tämä on aiemmin pelatun panoksen toisto, joka näytetään vain vahvistusta varten. Rahaa ei panosteta eikä lopputulosta voi muuttaa.',
}

// ── French ────────────────────────────────────────────────────────────────────
const fr: Translations = {
  spin:                 'TOURNER',
  stop:                 'ARRÊTER',
  endRound:             'FIN DE TOUR',
  autoPlay:             'AUTO',
  bet:                  'MISE',
  betMin:               'MISE MIN',
  betMax:               'MISE MAX',
  maxBet:               'MISE MAX',
  minBet:               'MISE MIN',
  balance:              'SOLDE',
  win:                  'GAIN',
  loading:              'Chargement…',
  buyBonus:             'ACHETER BONUS',
  buyBonusDesc:         'Spin scatter garanti — 100× mise',
  scatter3:             '3 SCATTER — MULTIPLICATEUR 1×',
  scatter4:             '4 SCATTER — MULTIPLICATEUR 3×',
  scatter5:             '5 SCATTER — MULTIPLICATEUR 10×!',
  wincap:               '🏆 GAIN MAXIMUM — 5 000×!',
  bigWin:               'GRAND GAIN!',
  hugeWin:              'ÉNORME GAIN!!',
  megaWin:              'MÉGA GAIN!!!',
  error:                'Erreur de connexion. Veuillez réessayer.',
  insufficientBalance:  'Solde insuffisant. Veuillez ajouter des fonds.',
  sessionExpired:       'Session expirée. Veuillez relancer le jeu.',
  maintenanceMode:      'Serveur en maintenance. Réessayez plus tard.',
  locationRestricted:   "Ce jeu n'est pas disponible dans votre région.",
  gamblingLimitReached: 'Limite de jeu atteinte.',
  rules:                'RÈGLES',
  paytable:             'TABLE DE PAIEMENT',
  close:                'FERMER',
  settings:             'PARAMÈTRES',
  replayDisclaimer:     "Ceci est la relecture d'une mise déjà terminée, affichée à des fins de vérification uniquement. Aucun fonds n'est misé et le résultat ne peut pas être modifié.",
}

// ── Hindi ─────────────────────────────────────────────────────────────────────
const hi: Translations = {
  spin:                 'स्पिन',
  stop:                 'रोकें',
  endRound:             'राउंड समाप्त करें',
  autoPlay:             'ऑटो',
  bet:                  'दांव',
  betMin:               'न्यूनतम दांव',
  betMax:               'अधिकतम दांव',
  maxBet:               'अधिकतम दांव',
  minBet:               'न्यूनतम दांव',
  balance:              'बैलेंस',
  win:                  'जीत',
  loading:              'लोड हो रहा है…',
  buyBonus:             'बोनस खरीदें',
  buyBonusDesc:         'गारंटीड स्कैटर स्पिन — 100× दांव',
  scatter3:             '3 स्कैटर — 1× गुणक',
  scatter4:             '4 स्कैटर — 3× गुणक',
  scatter5:             '5 स्कैटर — 10× गुणक!',
  wincap:               '🏆 अधिकतम जीत — 5,000×!',
  bigWin:               'बड़ी जीत!',
  hugeWin:              'विशाल जीत!!',
  megaWin:              'मेगा जीत!!!',
  error:                'कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।',
  insufficientBalance:  'अपर्याप्त बैलेंस। कृपया फंड जोड़ें।',
  sessionExpired:       'सत्र समाप्त हो गया। कृपया गेम पुनः लॉन्च करें।',
  maintenanceMode:      'सर्वर रखरखाव में है। बाद में पुनः प्रयास करें।',
  locationRestricted:   'यह गेम आपके क्षेत्र में उपलब्ध नहीं है।',
  gamblingLimitReached: 'जुए की सीमा पहुंच गई।',
  rules:                'नियम',
  paytable:             'पे टेबल',
  close:                'बंद करें',
  settings:             'सेटिंग',
  replayDisclaimer:     'यह पहले पूर्ण किए गए दांव का रीप्ले है, जो केवल सत्यापन के लिए दिखाया गया है। कोई धनराशि दांव पर नहीं लगाई जाती और परिणाम बदला नहीं जा सकता।',
}

// ── Indonesian ────────────────────────────────────────────────────────────────
const id: Translations = {
  spin:                 'PUTAR',
  stop:                 'BERHENTI',
  endRound:             'AKHIRI RONDE',
  autoPlay:             'AUTO',
  bet:                  'TARUHAN',
  betMin:               'TARUHAN MIN',
  betMax:               'TARUHAN MAKS',
  maxBet:               'TARUHAN MAKS',
  minBet:               'TARUHAN MIN',
  balance:              'SALDO',
  win:                  'MENANG',
  loading:              'Memuat…',
  buyBonus:             'BELI BONUS',
  buyBonusDesc:         'Putar scatter dijamin — 100× taruhan',
  scatter3:             '3 SCATTER — PENGGANDA 1×',
  scatter4:             '4 SCATTER — PENGGANDA 3×',
  scatter5:             '5 SCATTER — PENGGANDA 10×!',
  wincap:               '🏆 KEMENANGAN MAKS — 5.000×!',
  bigWin:               'MENANG BESAR!',
  hugeWin:              'MENANG LUAR BIASA!!',
  megaWin:              'MEGA WIN!!!',
  error:                'Kesalahan koneksi. Coba lagi.',
  insufficientBalance:  'Saldo tidak cukup. Tambahkan dana.',
  sessionExpired:       'Sesi habis. Luncurkan ulang game.',
  maintenanceMode:      'Server dalam pemeliharaan. Coba lagi nanti.',
  locationRestricted:   'Game ini tidak tersedia di wilayah Anda.',
  gamblingLimitReached: 'Batas perjudian tercapai.',
  rules:                'ATURAN',
  paytable:             'TABEL BAYAR',
  close:                'TUTUP',
  settings:             'PENGATURAN',
  replayDisclaimer:     'Ini adalah tayangan ulang taruhan yang sudah selesai, ditampilkan hanya untuk verifikasi. Tidak ada dana yang dipertaruhkan dan hasilnya tidak dapat diubah.',
}

// ── Japanese ──────────────────────────────────────────────────────────────────
const ja: Translations = {
  spin:                 'スピン',
  stop:                 'ストップ',
  endRound:             'ラウンド終了',
  autoPlay:             'オート',
  bet:                  'ベット',
  betMin:               'MIN BET',
  betMax:               'MAX BET',
  maxBet:               'MAX BET',
  minBet:               'MIN BET',
  balance:              '残高',
  win:                  '勝利',
  loading:              '読み込み中…',
  buyBonus:             'ボーナス購入',
  buyBonusDesc:         'スキャッタースピン確定 — ベット×100',
  scatter3:             '3スキャッター — 1倍',
  scatter4:             '4スキャッター — 3倍',
  scatter5:             '5スキャッター — 10倍！',
  wincap:               '🏆 最大勝利 — 5,000倍！',
  bigWin:               'ビッグウィン！',
  hugeWin:              '大当たり！！',
  megaWin:              'メガウィン！！！',
  error:                '接続エラー。再試行してください。',
  insufficientBalance:  '残高不足。資金を追加してください。',
  sessionExpired:       'セッションが期限切れです。ゲームを再起動してください。',
  maintenanceMode:      'サーバーがメンテナンス中です。後でもう一度お試しください。',
  locationRestricted:   'このゲームはお住まいの地域では利用できません。',
  gamblingLimitReached: 'ギャンブル制限に達しました。',
  rules:                'ルール',
  paytable:             '配当表',
  close:                '閉じる',
  settings:             '設定',
  replayDisclaimer:     'これは完了済みのベットのリプレイで、確認のみを目的として表示されています。資金は賭けられておらず、結果を変更することはできません。',
}

// ── Korean ────────────────────────────────────────────────────────────────────
const ko: Translations = {
  spin:                 '스핀',
  stop:                 '정지',
  endRound:             '라운드 종료',
  autoPlay:             '자동',
  bet:                  '베팅',
  betMin:               '최소 베팅',
  betMax:               '최대 베팅',
  maxBet:               '최대 베팅',
  minBet:               '최소 베팅',
  balance:              '잔액',
  win:                  '당첨',
  loading:              '로딩 중…',
  buyBonus:             '보너스 구매',
  buyBonusDesc:         '스캐터 스핀 보장 — 베팅 100×',
  scatter3:             '3 스캐터 — 1× 배수',
  scatter4:             '4 스캐터 — 3× 배수',
  scatter5:             '5 스캐터 — 10× 배수!',
  wincap:               '🏆 최대 당첨 — 5,000×!',
  bigWin:               '빅 윈!',
  hugeWin:              '엄청난 당첨!!',
  megaWin:              '메가 윈!!!',
  error:                '연결 오류. 다시 시도해 주세요.',
  insufficientBalance:  '잔액 부족. 자금을 추가해 주세요.',
  sessionExpired:       '세션이 만료되었습니다. 게임을 다시 실행해 주세요.',
  maintenanceMode:      '서버 점검 중. 나중에 다시 시도해 주세요.',
  locationRestricted:   '이 게임은 귀하의 지역에서 사용할 수 없습니다.',
  gamblingLimitReached: '도박 한도에 도달했습니다.',
  rules:                '규칙',
  paytable:             '배당표',
  close:                '닫기',
  settings:             '설정',
  replayDisclaimer:     '이것은 이미 완료된 베팅의 리플레이이며 확인용으로만 표시됩니다. 자금이 베팅되지 않으며 결과를 변경할 수 없습니다.',
}

// ── Polish ────────────────────────────────────────────────────────────────────
const pl: Translations = {
  spin:                 'OBRÓĆ',
  stop:                 'ZATRZYMAJ',
  endRound:             'ZAKOŃCZ RUNDĘ',
  autoPlay:             'AUTO',
  bet:                  'ZAKŁAD',
  betMin:               'MIN. ZAKŁAD',
  betMax:               'MAKS. ZAKŁAD',
  maxBet:               'MAKS. ZAKŁAD',
  minBet:               'MIN. ZAKŁAD',
  balance:              'SALDO',
  win:                  'WYGRANA',
  loading:              'Ładowanie…',
  buyBonus:             'KUP BONUS',
  buyBonusDesc:         'Gwarantowany spin z scatter — 100× zakład',
  scatter3:             '3 SCATTER — MNOŻNIK 1×',
  scatter4:             '4 SCATTER — MNOŻNIK 3×',
  scatter5:             '5 SCATTER — MNOŻNIK 10×!',
  wincap:               '🏆 MAKSYMALNA WYGRANA — 5 000×!',
  bigWin:               'DUŻA WYGRANA!',
  hugeWin:              'OGROMNA WYGRANA!!',
  megaWin:              'MEGA WYGRANA!!!',
  error:                'Błąd połączenia. Spróbuj ponownie.',
  insufficientBalance:  'Niewystarczające saldo. Doładuj konto.',
  sessionExpired:       'Sesja wygasła. Uruchom grę ponownie.',
  maintenanceMode:      'Serwer w trakcie konserwacji. Spróbuj ponownie później.',
  locationRestricted:   'Ta gra jest niedostępna w Twoim regionie.',
  gamblingLimitReached: 'Osiągnięto limit hazardu.',
  rules:                'ZASADY',
  paytable:             'TABELA WYPŁAT',
  close:                'ZAMKNIJ',
  settings:             'USTAWIENIA',
  replayDisclaimer:     'To powtórka wcześniej zakończonego zakładu, pokazana wyłącznie w celu weryfikacji. Nie stawia się żadnych środków, a wyniku nie można zmienić.',
}

// ── Portuguese ────────────────────────────────────────────────────────────────
const pt: Translations = {
  spin:                 'GIRAR',
  stop:                 'PARAR',
  endRound:             'FIM DE RODADA',
  autoPlay:             'AUTO',
  bet:                  'APOSTA',
  betMin:               'APOSTA MÍN',
  betMax:               'APOSTA MÁX',
  maxBet:               'APOSTA MÁX',
  minBet:               'APOSTA MÍN',
  balance:              'SALDO',
  win:                  'GANHO',
  loading:              'Carregando…',
  buyBonus:             'COMPRAR BÔNUS',
  buyBonusDesc:         'Giro scatter garantido — 100× aposta',
  scatter3:             '3 SCATTER — MULTIPLICADOR 1×',
  scatter4:             '4 SCATTER — MULTIPLICADOR 3×',
  scatter5:             '5 SCATTER — MULTIPLICADOR 10×!',
  wincap:               '🏆 GANHO MÁXIMO — 5.000×!',
  bigWin:               'GRANDE GANHO!',
  hugeWin:              'ENORME GANHO!!',
  megaWin:              'MEGA GANHO!!!',
  error:                'Erro de conexão. Tente novamente.',
  insufficientBalance:  'Saldo insuficiente. Adicione fundos.',
  sessionExpired:       'Sessão expirada. Relance o jogo.',
  maintenanceMode:      'Servidor em manutenção. Tente mais tarde.',
  locationRestricted:   'Este jogo não está disponível na sua região.',
  gamblingLimitReached: 'Limite de apostas atingido.',
  rules:                'REGRAS',
  paytable:             'TABELA DE PRÊMIOS',
  close:                'FECHAR',
  settings:             'CONFIGURAÇÕES',
  replayDisclaimer:     'Esta é a repetição de uma aposta já concluída, exibida apenas para verificação. Nenhum valor é apostado e o resultado não pode ser alterado.',
}

// ── Russian ───────────────────────────────────────────────────────────────────
const ru: Translations = {
  spin:                 'КРУТИТЬ',
  stop:                 'СТОП',
  endRound:             'ЗАВЕРШИТЬ РАУНД',
  autoPlay:             'АВТО',
  bet:                  'СТАВКА',
  betMin:               'МИН. СТАВКА',
  betMax:               'МАКС. СТАВКА',
  maxBet:               'МАКС. СТАВКА',
  minBet:               'МИН. СТАВКА',
  balance:              'БАЛАНС',
  win:                  'ВЫИГРЫШ',
  loading:              'Загрузка…',
  buyBonus:             'КУПИТЬ БОНУС',
  buyBonusDesc:         'Гарантированный спин со скаттером — 100× ставка',
  scatter3:             '3 СКАТТЕРА — МНОЖИТЕЛЬ 1×',
  scatter4:             '4 СКАТТЕРА — МНОЖИТЕЛЬ 3×',
  scatter5:             '5 СКАТТЕРОВ — МНОЖИТЕЛЬ 10×!',
  wincap:               '🏆 МАКСИМАЛЬНЫЙ ВЫИГРЫШ — 5 000×!',
  bigWin:               'КРУПНЫЙ ВЫИГРЫШ!',
  hugeWin:              'ОГРОМНЫЙ ВЫИГРЫШ!!',
  megaWin:              'МЕГА-ВЫИГРЫШ!!!',
  error:                'Ошибка соединения. Попробуйте снова.',
  insufficientBalance:  'Недостаточно средств. Пополните баланс.',
  sessionExpired:       'Сессия истекла. Перезапустите игру.',
  maintenanceMode:      'Сервер на техническом обслуживании. Повторите позже.',
  locationRestricted:   'Игра недоступна в вашем регионе.',
  gamblingLimitReached: 'Достигнут лимит ставок.',
  rules:                'ПРАВИЛА',
  paytable:             'ТАБЛИЦА ВЫПЛАТ',
  close:                'ЗАКРЫТЬ',
  settings:             'НАСТРОЙКИ',
  replayDisclaimer:     'Это повтор ранее завершённой ставки, показанный только для проверки. Средства не ставятся, и результат изменить нельзя.',
}

// ── Turkish ───────────────────────────────────────────────────────────────────
const tr: Translations = {
  spin:                 'ÇEVİR',
  stop:                 'DURDUR',
  endRound:             'TURU BİTİR',
  autoPlay:             'OTO',
  bet:                  'BAHİS',
  betMin:               'MİN BAHİS',
  betMax:               'MAKS BAHİS',
  maxBet:               'MAKS BAHİS',
  minBet:               'MİN BAHİS',
  balance:              'BAKİYE',
  win:                  'KAZANÇ',
  loading:              'Yükleniyor…',
  buyBonus:             'BONUS SATIN AL',
  buyBonusDesc:         'Garantili scatter spini — 100× bahis',
  scatter3:             '3 SCATTER — 1× ÇARPAN',
  scatter4:             '4 SCATTER — 3× ÇARPAN',
  scatter5:             '5 SCATTER — 10× ÇARPAN!',
  wincap:               '🏆 MAKSİMUM KAZANÇ — 5.000×!',
  bigWin:               'BÜYÜK KAZANÇ!',
  hugeWin:              'DEV KAZANÇ!!',
  megaWin:              'MEGA KAZANÇ!!!',
  error:                'Bağlantı hatası. Lütfen tekrar deneyin.',
  insufficientBalance:  'Yetersiz bakiye. Lütfen fon ekleyin.',
  sessionExpired:       'Oturum süresi doldu. Lütfen oyunu yeniden başlatın.',
  maintenanceMode:      'Sunucu bakımda. Daha sonra tekrar deneyin.',
  locationRestricted:   'Bu oyun bölgenizde mevcut değil.',
  gamblingLimitReached: 'Kumar limitine ulaşıldı.',
  rules:                'KURALLAR',
  paytable:             'ÖDEME TABLOSU',
  close:                'KAPAT',
  settings:             'AYARLAR',
  replayDisclaimer:     'Bu, daha önce tamamlanmış bir bahsin yalnızca doğrulama amacıyla gösterilen tekrarıdır. Hiçbir para yatırılmaz ve sonuç değiştirilemez.',
}

// ── Vietnamese ────────────────────────────────────────────────────────────────
const vi: Translations = {
  spin:                 'QUAY',
  stop:                 'DỪNG',
  endRound:             'KẾT THÚC VÒNG',
  autoPlay:             'TỰ ĐỘNG',
  bet:                  'CƯỢC',
  betMin:               'CƯỢC TỐI THIỂU',
  betMax:               'CƯỢC TỐI ĐA',
  maxBet:               'CƯỢC TỐI ĐA',
  minBet:               'CƯỢC TỐI THIỂU',
  balance:              'SỐ DƯ',
  win:                  'THẮNG',
  loading:              'Đang tải…',
  buyBonus:             'MUA BONUS',
  buyBonusDesc:         'Đảm bảo vòng quay scatter — 100× cược',
  scatter3:             '3 SCATTER — HỆ SỐ 1×',
  scatter4:             '4 SCATTER — HỆ SỐ 3×',
  scatter5:             '5 SCATTER — HỆ SỐ 10×!',
  wincap:               '🏆 THẮNG TỐI ĐA — 5.000×!',
  bigWin:               'THẮNG LỚN!',
  hugeWin:              'THẮNG KHỔNG LỒ!!',
  megaWin:              'MEGA WIN!!!',
  error:                'Lỗi kết nối. Vui lòng thử lại.',
  insufficientBalance:  'Số dư không đủ. Vui lòng nạp tiền.',
  sessionExpired:       'Phiên đã hết hạn. Vui lòng khởi động lại trò chơi.',
  maintenanceMode:      'Máy chủ đang bảo trì. Vui lòng thử lại sau.',
  locationRestricted:   'Trò chơi này không có sẵn ở khu vực của bạn.',
  gamblingLimitReached: 'Đã đạt giới hạn cờ bạc.',
  rules:                'LUẬT',
  paytable:             'BẢNG THƯỞNG',
  close:                'ĐÓNG',
  settings:             'CÀI ĐẶT',
  replayDisclaimer:     'Đây là bản phát lại của một lượt cược đã hoàn tất, chỉ hiển thị để xác minh. Không có khoản tiền nào được đặt cược và kết quả không thể thay đổi.',
}

// ── Chinese (Simplified) ──────────────────────────────────────────────────────
const zh: Translations = {
  spin:                 '旋转',
  stop:                 '停止',
  endRound:             '结束回合',
  autoPlay:             '自动',
  bet:                  '投注',
  betMin:               '最小投注',
  betMax:               '最大投注',
  maxBet:               '最大投注',
  minBet:               '最小投注',
  balance:              '余额',
  win:                  '赢奖',
  loading:              '加载中…',
  buyBonus:             '购买奖励',
  buyBonusDesc:         '保证散野旋转 — 投注100倍',
  scatter3:             '3个散野 — 1倍乘数',
  scatter4:             '4个散野 — 3倍乘数',
  scatter5:             '5个散野 — 10倍乘数！',
  wincap:               '🏆 最大赢奖 — 5,000倍！',
  bigWin:               '大奖!',
  hugeWin:              '超大奖!!',
  megaWin:              '特大奖!!!',
  error:                '连接错误，请重试。',
  insufficientBalance:  '余额不足，请充值。',
  sessionExpired:       '会话已过期，请重新启动游戏。',
  maintenanceMode:      '服务器正在维护，请稍后重试。',
  locationRestricted:   '该游戏在您所在地区不可用。',
  gamblingLimitReached: '已达到赌博限额。',
  rules:                '规则',
  paytable:             '赔付表',
  close:                '关闭',
  settings:             '设置',
  replayDisclaimer:     '这是先前已完成投注的回放，仅用于验证。不会下注任何资金，且结果无法更改。',
}

// ── Locale map ────────────────────────────────────────────────────────────────

// ── Overdrive feature strings, all 16 locales ─────────────────────────────────
export const featureI18n: Record<Locale, FeatureStrings> = {
  en: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'OVERDRIVE FREE SPINS', freeSpins: 'FREE SPINS',
    totalWin: 'TOTAL WIN', featureComplete: 'FEATURE COMPLETE',
    buyFeature: 'BUY FEATURE', buyConfirmTitle: 'BUY OVERDRIVE FREE SPINS',
    buyConfirmBody: 'Start Overdrive Free Spins now at 100× your bet?', buyPrice: 'PRICE',
    buyConfirm: 'BUY', buyCancel: 'CANCEL',
    rulesOverdriveTitle: 'OVERDRIVE FREE SPINS',
    rulesOverdriveTrigger: '3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.',
    rulesOverdriveMeter: 'The Overdrive meter starts at 1× and rises +1× after every winning free spin, multiplying all later wins. It never resets during the feature.',
    rulesOverdriveRetrigger: '3 or more Scatters during free spins award +5 free spins.',
    rulesOverdriveBuy: 'Bonus Buy: pay 100× your bet to start the feature immediately.',
    rulesOverdriveModes: 'Base game and Bonus Buy both return 96.35% RTP. Maximum win 5,000× bet.',
  },
  ar: {
    overdrive: 'أوفردرايف', overdriveFreeSpins: 'لفات أوفردرايف المجانية', freeSpins: 'لفات مجانية',
    totalWin: 'إجمالي الفوز', featureComplete: 'انتهت الميزة',
    buyFeature: 'شراء الميزة', buyConfirmTitle: 'شراء لفات أوفردرايف المجانية',
    buyConfirmBody: 'ابدأ لفات أوفردرايف المجانية الآن مقابل 100× رهانك؟', buyPrice: 'السعر',
    buyConfirm: 'شراء', buyCancel: 'إلغاء',
    rulesOverdriveTitle: 'لفات أوفردرايف المجانية',
    rulesOverdriveTrigger: '3 أو 4 أو 5 رموز سكاتر تمنح 8 أو 12 أو 16 لفة مجانية وتدفع فوراً 1× أو 3× أو 10× من إجمالي الرهان.',
    rulesOverdriveMeter: 'يبدأ عداد أوفردرايف من 1× ويرتفع 1× بعد كل لفة مجانية رابحة، مضاعفاً كل الأرباح اللاحقة. لا يعاد ضبطه خلال الميزة.',
    rulesOverdriveRetrigger: '3 رموز سكاتر أو أكثر خلال اللفات المجانية تمنح 5 لفات إضافية.',
    rulesOverdriveBuy: 'شراء البونص: ادفع 100× رهانك لبدء الميزة فوراً.',
    rulesOverdriveModes: 'اللعبة الأساسية وشراء البونص يمنحان نسبة عائد 96.35٪. أقصى فوز 5000× الرهان.',
  },
  de: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'OVERDRIVE FREISPIELE', freeSpins: 'FREISPIELE',
    totalWin: 'GESAMTGEWINN', featureComplete: 'FEATURE BEENDET',
    buyFeature: 'FEATURE KAUFEN', buyConfirmTitle: 'OVERDRIVE FREISPIELE KAUFEN',
    buyConfirmBody: 'Overdrive Freispiele jetzt für das 100-fache deines Einsatzes starten?', buyPrice: 'PREIS',
    buyConfirm: 'KAUFEN', buyCancel: 'ABBRECHEN',
    rulesOverdriveTitle: 'OVERDRIVE FREISPIELE',
    rulesOverdriveTrigger: '3, 4 oder 5 Scatter vergeben 8, 12 oder 16 Freispiele und zahlen sofort 1×, 3× oder 10× des Gesamteinsatzes.',
    rulesOverdriveMeter: 'Der Overdrive-Zähler startet bei 1× und steigt nach jedem gewonnenen Freispiel um 1×, was alle folgenden Gewinne multipliziert. Er wird während des Features nie zurückgesetzt.',
    rulesOverdriveRetrigger: '3 oder mehr Scatter während der Freispiele vergeben 5 zusätzliche Freispiele.',
    rulesOverdriveBuy: 'Bonuskauf: Zahle das 100-fache deines Einsatzes, um das Feature sofort zu starten.',
    rulesOverdriveModes: 'Basisspiel und Bonuskauf zahlen beide 96,35 % RTP. Maximalgewinn 5.000× Einsatz.',
  },
  es: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'GIROS GRATIS OVERDRIVE', freeSpins: 'GIROS GRATIS',
    totalWin: 'GANANCIA TOTAL', featureComplete: 'FUNCIÓN COMPLETA',
    buyFeature: 'COMPRAR FUNCIÓN', buyConfirmTitle: 'COMPRAR GIROS GRATIS OVERDRIVE',
    buyConfirmBody: '¿Iniciar los Giros Gratis Overdrive ahora por 100× tu apuesta?', buyPrice: 'PRECIO',
    buyConfirm: 'COMPRAR', buyCancel: 'CANCELAR',
    rulesOverdriveTitle: 'GIROS GRATIS OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 o 5 Scatters otorgan 8, 12 o 16 giros gratis y pagan al instante 1×, 3× o 10× de la apuesta total.',
    rulesOverdriveMeter: 'El medidor Overdrive empieza en 1× y sube 1× tras cada giro gratis ganador, multiplicando todas las ganancias posteriores. No se reinicia durante la función.',
    rulesOverdriveRetrigger: '3 o más Scatters durante los giros gratis otorgan 5 giros gratis adicionales.',
    rulesOverdriveBuy: 'Compra de bono: paga 100× tu apuesta para iniciar la función de inmediato.',
    rulesOverdriveModes: 'El juego base y la Compra de bono devuelven 96,35 % de RTP. Ganancia máxima 5.000× la apuesta.',
  },
  fi: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'OVERDRIVE-ILMAISKIERROKSET', freeSpins: 'ILMAISKIERROKSET',
    totalWin: 'KOKONAISVOITTO', featureComplete: 'OMINAISUUS VALMIS',
    buyFeature: 'OSTA OMINAISUUS', buyConfirmTitle: 'OSTA OVERDRIVE-ILMAISKIERROKSET',
    buyConfirmBody: 'Aloitetaanko Overdrive-ilmaiskierrokset nyt hintaan 100× panoksesi?', buyPrice: 'HINTA',
    buyConfirm: 'OSTA', buyCancel: 'PERUUTA',
    rulesOverdriveTitle: 'OVERDRIVE-ILMAISKIERROKSET',
    rulesOverdriveTrigger: '3, 4 tai 5 Scatteria antaa 8, 12 tai 16 ilmaiskierrosta ja maksaa heti 1×, 3× tai 10× kokonaispanoksesta.',
    rulesOverdriveMeter: 'Overdrive-mittari alkaa arvosta 1× ja nousee 1× jokaisen voittavan ilmaiskierroksen jälkeen kertoen kaikki myöhemmät voitot. Se ei nollaudu ominaisuuden aikana.',
    rulesOverdriveRetrigger: '3 tai useampi Scatter ilmaiskierrosten aikana antaa 5 lisäkierrosta.',
    rulesOverdriveBuy: 'Bonusosto: maksa 100× panoksesi aloittaaksesi ominaisuuden heti.',
    rulesOverdriveModes: 'Peruspeli ja Bonusosto palauttavat molemmat 96,35 % RTP. Enimmäisvoitto 5 000× panos.',
  },
  fr: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'TOURS GRATUITS OVERDRIVE', freeSpins: 'TOURS GRATUITS',
    totalWin: 'GAIN TOTAL', featureComplete: 'FONCTION TERMINÉE',
    buyFeature: 'ACHETER LA FONCTION', buyConfirmTitle: 'ACHETER LES TOURS GRATUITS OVERDRIVE',
    buyConfirmBody: 'Lancer les Tours Gratuits Overdrive maintenant pour 100× votre mise ?', buyPrice: 'PRIX',
    buyConfirm: 'ACHETER', buyCancel: 'ANNULER',
    rulesOverdriveTitle: 'TOURS GRATUITS OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 ou 5 Scatters accordent 8, 12 ou 16 tours gratuits et paient instantanément 1×, 3× ou 10× la mise totale.',
    rulesOverdriveMeter: 'Le compteur Overdrive démarre à 1× et augmente de 1× après chaque tour gratuit gagnant, multipliant tous les gains suivants. Il ne se réinitialise jamais pendant la fonction.',
    rulesOverdriveRetrigger: '3 Scatters ou plus pendant les tours gratuits accordent 5 tours gratuits supplémentaires.',
    rulesOverdriveBuy: 'Achat de bonus : payez 100× votre mise pour lancer la fonction immédiatement.',
    rulesOverdriveModes: 'Le jeu de base et l’Achat de bonus rendent tous deux 96,35 % de RTP. Gain maximum 5 000× la mise.',
  },
  hi: {
    overdrive: 'ओवरड्राइव', overdriveFreeSpins: 'ओवरड्राइव फ्री स्पिन', freeSpins: 'फ्री स्पिन',
    totalWin: 'कुल जीत', featureComplete: 'फ़ीचर समाप्त',
    buyFeature: 'फ़ीचर खरीदें', buyConfirmTitle: 'ओवरड्राइव फ्री स्पिन खरीदें',
    buyConfirmBody: 'अभी अपनी दांव राशि के 100× पर ओवरड्राइव फ्री स्पिन शुरू करें?', buyPrice: 'कीमत',
    buyConfirm: 'खरीदें', buyCancel: 'रद्द करें',
    rulesOverdriveTitle: 'ओवरड्राइव फ्री स्पिन',
    rulesOverdriveTrigger: '3, 4 या 5 स्कैटर 8, 12 या 16 फ्री स्पिन देते हैं और तुरंत कुल दांव का 1×, 3× या 10× भुगतान करते हैं।',
    rulesOverdriveMeter: 'ओवरड्राइव मीटर 1× से शुरू होता है और हर जीतने वाले फ्री स्पिन के बाद 1× बढ़ता है, बाद की सभी जीतों को गुणा करता है। फ़ीचर के दौरान यह रीसेट नहीं होता।',
    rulesOverdriveRetrigger: 'फ्री स्पिन के दौरान 3 या अधिक स्कैटर 5 अतिरिक्त फ्री स्पिन देते हैं।',
    rulesOverdriveBuy: 'बोनस खरीद: फ़ीचर तुरंत शुरू करने के लिए अपने दांव का 100× भुगतान करें।',
    rulesOverdriveModes: 'बेस गेम और बोनस खरीद दोनों 96.35% RTP देते हैं। अधिकतम जीत दांव का 5,000×।',
  },
  id: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'FREE SPIN OVERDRIVE', freeSpins: 'FREE SPIN',
    totalWin: 'TOTAL MENANG', featureComplete: 'FITUR SELESAI',
    buyFeature: 'BELI FITUR', buyConfirmTitle: 'BELI FREE SPIN OVERDRIVE',
    buyConfirmBody: 'Mulai Free Spin Overdrive sekarang seharga 100× taruhan Anda?', buyPrice: 'HARGA',
    buyConfirm: 'BELI', buyCancel: 'BATAL',
    rulesOverdriveTitle: 'FREE SPIN OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 atau 5 Scatter memberikan 8, 12 atau 16 free spin dan langsung membayar 1×, 3× atau 10× dari total taruhan.',
    rulesOverdriveMeter: 'Meter Overdrive dimulai dari 1× dan naik 1× setelah setiap free spin yang menang, mengalikan semua kemenangan berikutnya. Meter tidak pernah direset selama fitur.',
    rulesOverdriveRetrigger: '3 atau lebih Scatter selama free spin memberikan 5 free spin tambahan.',
    rulesOverdriveBuy: 'Beli Bonus: bayar 100× taruhan Anda untuk memulai fitur segera.',
    rulesOverdriveModes: 'Game dasar dan Beli Bonus keduanya memberikan RTP 96,35%. Kemenangan maksimum 5.000× taruhan.',
  },
  ja: {
    overdrive: 'オーバードライブ', overdriveFreeSpins: 'オーバードライブ フリースピン', freeSpins: 'フリースピン',
    totalWin: '合計配当', featureComplete: 'フィーチャー終了',
    buyFeature: 'フィーチャー購入', buyConfirmTitle: 'オーバードライブ フリースピン購入',
    buyConfirmBody: 'ベット額の100倍でオーバードライブ フリースピンを今すぐ開始しますか？', buyPrice: '価格',
    buyConfirm: '購入', buyCancel: 'キャンセル',
    rulesOverdriveTitle: 'オーバードライブ フリースピン',
    rulesOverdriveTrigger: 'スキャッター3・4・5個で8・12・16回のフリースピンを獲得し、合計ベットの1倍・3倍・10倍を即時に配当します。',
    rulesOverdriveMeter: 'オーバードライブメーターは1倍から始まり、勝利したフリースピンごとに1倍上昇し、以降のすべての配当に乗算されます。フィーチャー中はリセットされません。',
    rulesOverdriveRetrigger: 'フリースピン中にスキャッター3個以上でフリースピンを5回追加します。',
    rulesOverdriveBuy: 'ボーナス購入：ベット額の100倍を支払うとフィーチャーがすぐに開始します。',
    rulesOverdriveModes: 'ベースゲームとボーナス購入はどちらもRTP96.35%です。最大配当はベットの5,000倍。',
  },
  ko: {
    overdrive: '오버드라이브', overdriveFreeSpins: '오버드라이브 프리 스핀', freeSpins: '프리 스핀',
    totalWin: '총 당첨', featureComplete: '기능 종료',
    buyFeature: '기능 구매', buyConfirmTitle: '오버드라이브 프리 스핀 구매',
    buyConfirmBody: '베팅액의 100배로 지금 오버드라이브 프리 스핀을 시작하시겠습니까?', buyPrice: '가격',
    buyConfirm: '구매', buyCancel: '취소',
    rulesOverdriveTitle: '오버드라이브 프리 스핀',
    rulesOverdriveTrigger: '스캐터 3, 4 또는 5개가 8, 12 또는 16회의 프리 스핀을 지급하고 총 베팅액의 1×, 3× 또는 10×를 즉시 지급합니다.',
    rulesOverdriveMeter: '오버드라이브 미터는 1×에서 시작하여 당첨된 프리 스핀마다 1× 상승하며 이후 모든 당첨에 곱해집니다. 기능 중에는 초기화되지 않습니다.',
    rulesOverdriveRetrigger: '프리 스핀 중 스캐터 3개 이상이면 프리 스핀 5회를 추가로 지급합니다.',
    rulesOverdriveBuy: '보너스 구매: 베팅액의 100배를 지불하면 기능이 즉시 시작됩니다.',
    rulesOverdriveModes: '기본 게임과 보너스 구매 모두 RTP 96.35%입니다. 최대 당첨은 베팅액의 5,000배입니다.',
  },
  pl: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'DARMOWE SPINY OVERDRIVE', freeSpins: 'DARMOWE SPINY',
    totalWin: 'WYGRANA CAŁKOWITA', featureComplete: 'FUNKCJA ZAKOŃCZONA',
    buyFeature: 'KUP FUNKCJĘ', buyConfirmTitle: 'KUP DARMOWE SPINY OVERDRIVE',
    buyConfirmBody: 'Rozpocząć Darmowe Spiny Overdrive teraz za 100× Twojego zakładu?', buyPrice: 'CENA',
    buyConfirm: 'KUP', buyCancel: 'ANULUJ',
    rulesOverdriveTitle: 'DARMOWE SPINY OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 lub 5 symboli Scatter przyznaje 8, 12 lub 16 darmowych spinów i natychmiast wypłaca 1×, 3× lub 10× całkowitego zakładu.',
    rulesOverdriveMeter: 'Licznik Overdrive zaczyna od 1× i rośnie o 1× po każdym wygranym darmowym spinie, mnożąc wszystkie kolejne wygrane. Nie resetuje się podczas funkcji.',
    rulesOverdriveRetrigger: '3 lub więcej symboli Scatter podczas darmowych spinów przyznaje 5 dodatkowych spinów.',
    rulesOverdriveBuy: 'Zakup bonusu: zapłać 100× swojego zakładu, aby natychmiast uruchomić funkcję.',
    rulesOverdriveModes: 'Gra podstawowa i Zakup bonusu zwracają 96,35% RTP. Maksymalna wygrana 5000× zakładu.',
  },
  pt: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'GIROS GRÁTIS OVERDRIVE', freeSpins: 'GIROS GRÁTIS',
    totalWin: 'GANHO TOTAL', featureComplete: 'RECURSO CONCLUÍDO',
    buyFeature: 'COMPRAR RECURSO', buyConfirmTitle: 'COMPRAR GIROS GRÁTIS OVERDRIVE',
    buyConfirmBody: 'Iniciar os Giros Grátis Overdrive agora por 100× a sua aposta?', buyPrice: 'PREÇO',
    buyConfirm: 'COMPRAR', buyCancel: 'CANCELAR',
    rulesOverdriveTitle: 'GIROS GRÁTIS OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 ou 5 Scatters concedem 8, 12 ou 16 giros grátis e pagam instantaneamente 1×, 3× ou 10× da aposta total.',
    rulesOverdriveMeter: 'O medidor Overdrive começa em 1× e sobe 1× após cada giro grátis vencedor, multiplicando todos os ganhos seguintes. Nunca é reiniciado durante o recurso.',
    rulesOverdriveRetrigger: '3 ou mais Scatters durante os giros grátis concedem 5 giros grátis adicionais.',
    rulesOverdriveBuy: 'Compra de bônus: pague 100× a sua aposta para iniciar o recurso imediatamente.',
    rulesOverdriveModes: 'O jogo base e a Compra de bônus retornam ambos 96,35% de RTP. Ganho máximo de 5.000× a aposta.',
  },
  ru: {
    overdrive: 'ОВЕРДРАЙВ', overdriveFreeSpins: 'ФРИСПИНЫ ОВЕРДРАЙВ', freeSpins: 'ФРИСПИНЫ',
    totalWin: 'ОБЩИЙ ВЫИГРЫШ', featureComplete: 'ФУНКЦИЯ ЗАВЕРШЕНА',
    buyFeature: 'КУПИТЬ ФУНКЦИЮ', buyConfirmTitle: 'КУПИТЬ ФРИСПИНЫ ОВЕРДРАЙВ',
    buyConfirmBody: 'Запустить фриспины Овердрайв сейчас за 100× вашей ставки?', buyPrice: 'ЦЕНА',
    buyConfirm: 'КУПИТЬ', buyCancel: 'ОТМЕНА',
    rulesOverdriveTitle: 'ФРИСПИНЫ ОВЕРДРАЙВ',
    rulesOverdriveTrigger: '3, 4 или 5 скаттеров дают 8, 12 или 16 фриспинов и мгновенно выплачивают 1×, 3× или 10× от общей ставки.',
    rulesOverdriveMeter: 'Счётчик Овердрайв начинается с 1× и растёт на 1× после каждого выигрышного фриспина, умножая все последующие выигрыши. Он не сбрасывается во время функции.',
    rulesOverdriveRetrigger: '3 или более скаттеров во время фриспинов дают 5 дополнительных фриспинов.',
    rulesOverdriveBuy: 'Покупка бонуса: заплатите 100× вашей ставки, чтобы запустить функцию сразу.',
    rulesOverdriveModes: 'Базовая игра и Покупка бонуса возвращают 96,35% RTP. Максимальный выигрыш 5000× ставки.',
  },
  tr: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'OVERDRIVE BEDAVA DÖNÜŞLER', freeSpins: 'BEDAVA DÖNÜŞLER',
    totalWin: 'TOPLAM KAZANÇ', featureComplete: 'ÖZELLİK TAMAMLANDI',
    buyFeature: 'ÖZELLİĞİ SATIN AL', buyConfirmTitle: 'OVERDRIVE BEDAVA DÖNÜŞLERİ SATIN AL',
    buyConfirmBody: 'Overdrive Bedava Dönüşleri şimdi bahsinizin 100 katına başlatılsın mı?', buyPrice: 'FİYAT',
    buyConfirm: 'SATIN AL', buyCancel: 'İPTAL',
    rulesOverdriveTitle: 'OVERDRIVE BEDAVA DÖNÜŞLER',
    rulesOverdriveTrigger: '3, 4 veya 5 Scatter 8, 12 veya 16 bedava dönüş verir ve anında toplam bahsin 1×, 3× veya 10× katını öder.',
    rulesOverdriveMeter: 'Overdrive göstergesi 1× ile başlar ve kazanan her bedava dönüşün ardından 1× artarak sonraki tüm kazançları çarpar. Özellik boyunca sıfırlanmaz.',
    rulesOverdriveRetrigger: 'Bedava dönüşler sırasında 3 veya daha fazla Scatter 5 ek bedava dönüş verir.',
    rulesOverdriveBuy: 'Bonus Satın Alma: özelliği hemen başlatmak için bahsinizin 100 katını ödeyin.',
    rulesOverdriveModes: 'Temel oyun ve Bonus Satın Alma her ikisi de %96,35 RTP döndürür. Maksimum kazanç bahsin 5.000 katı.',
  },
  vi: {
    overdrive: 'OVERDRIVE', overdriveFreeSpins: 'VÒNG QUAY MIỄN PHÍ OVERDRIVE', freeSpins: 'VÒNG QUAY MIỄN PHÍ',
    totalWin: 'TỔNG THẮNG', featureComplete: 'TÍNH NĂNG HOÀN TẤT',
    buyFeature: 'MUA TÍNH NĂNG', buyConfirmTitle: 'MUA VÒNG QUAY MIỄN PHÍ OVERDRIVE',
    buyConfirmBody: 'Bắt đầu Vòng Quay Miễn Phí Overdrive ngay với 100× tiền cược của bạn?', buyPrice: 'GIÁ',
    buyConfirm: 'MUA', buyCancel: 'HỦY',
    rulesOverdriveTitle: 'VÒNG QUAY MIỄN PHÍ OVERDRIVE',
    rulesOverdriveTrigger: '3, 4 hoặc 5 biểu tượng Scatter trao 8, 12 hoặc 16 vòng quay miễn phí và trả ngay 1×, 3× hoặc 10× tổng tiền cược.',
    rulesOverdriveMeter: 'Đồng hồ Overdrive bắt đầu ở 1× và tăng 1× sau mỗi vòng quay miễn phí thắng, nhân tất cả các phần thắng sau đó. Nó không bao giờ đặt lại trong tính năng.',
    rulesOverdriveRetrigger: '3 biểu tượng Scatter trở lên trong vòng quay miễn phí trao thêm 5 vòng quay miễn phí.',
    rulesOverdriveBuy: 'Mua Thưởng: trả 100× tiền cược của bạn để bắt đầu tính năng ngay lập tức.',
    rulesOverdriveModes: 'Trò chơi cơ bản và Mua Thưởng đều trả về RTP 96,35%. Thắng tối đa 5.000× tiền cược.',
  },
  zh: {
    overdrive: '超载', overdriveFreeSpins: '超载免费旋转', freeSpins: '免费旋转',
    totalWin: '总赢额', featureComplete: '功能结束',
    buyFeature: '购买功能', buyConfirmTitle: '购买超载免费旋转',
    buyConfirmBody: '立即以 100 倍投注开始超载免费旋转？', buyPrice: '价格',
    buyConfirm: '购买', buyCancel: '取消',
    rulesOverdriveTitle: '超载免费旋转',
    rulesOverdriveTrigger: '3、4 或 5 个分散符号可获得 8、12 或 16 次免费旋转，并立即支付总投注的 1 倍、3 倍或 10 倍。',
    rulesOverdriveMeter: '超载计量表从 1 倍开始，每次赢得免费旋转后增加 1 倍，乘以之后的所有赢额。功能期间不会重置。',
    rulesOverdriveRetrigger: '免费旋转期间出现 3 个或以上分散符号可额外获得 5 次免费旋转。',
    rulesOverdriveBuy: '购买奖励：支付 100 倍投注即可立即启动功能。',
    rulesOverdriveModes: '基础游戏和购买奖励的 RTP 均为 96.35%。最高赢额为投注的 5,000 倍。',
  },
}

export const locales: Record<Locale, Translations> = {
  en, ar, de, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh,
}

// ── Social casino overrides ───────────────────────────────────────────────────
// In social (free-to-play) mode, every gambling-framed label is remapped to a
// non-gambling form so the game complies with social-casino jurisdiction rules
// (no "bet", "win", "balance", "gambling", or "wager" reaches the player).
// These apply across all sixteen locales via t(); they are intentionally a
// single shared map, consistent with the original spin/win/balance overrides.
//
//   bet/wager  -> PLAY        balance      -> COINS
//   win        -> PRIZE       gambling     -> play

export const SOCIAL_OVERRIDES: Partial<Record<keyof Translations, string>> = {
  // Core HUD labels
  spin:    'PLAY',
  win:     'PRIZE',
  balance: 'COINS',
  // Bet wording -> play wording
  bet:     'PLAY',
  betMin:  'MIN PLAY',
  betMax:  'MAX PLAY',
  maxBet:  'MAX PLAY',
  minBet:  'MIN PLAY',
  // Win wording -> prize wording
  wincap:  '🏆 MAXIMUM PRIZE — 5,000×!',
  bigWin:  'BIG PRIZE!',
  hugeWin: 'HUGE PRIZE!!',
  megaWin: 'MEGA PRIZE!!!',
  // Buy-feature wording. "buy" is a prohibited term on stake.us, so social mode
  // uses "get". No em/en dashes.
  buyBonus:     'GET FEATURE',
  buyBonusDesc: 'Guaranteed scatter play, 100× play',
  // Error / status messages that name money or gambling
  insufficientBalance:  'Insufficient coins. Please add coins.',
  gamblingLimitReached: 'Play limit reached.',
  // Replay disclaimer, social phrasing (no bet/wager framing)
  replayDisclaimer:
    'This is a replay of a previously completed play, shown for verification only. The outcome cannot be changed.',
  // ── Overdrive feature social overrides (no buy/bet/cost/win framing) ────────
  totalWin:            'TOTAL PRIZE',
  buyFeature:          'GET FEATURE',
  buyConfirmTitle:     'GET OVERDRIVE FREE SPINS',
  buyConfirmBody:      'Start Overdrive Free Spins now for 100× your play?',
  buyConfirm:          'GET',
  rulesOverdriveTrigger:
    'Land 3, 4 or 5 Scatters to get 8, 12 or 16 free spins and an instant 1×, 3× or 10× of your total play.',
  rulesOverdriveMeter:
    'The Overdrive meter starts at 1× and rises +1× after every winning free spin, multiplying all later prizes. It never resets during the feature.',
  rulesOverdriveBuy:
    'Feature Play: play 100× your total play to start the feature instantly.',
  rulesOverdriveModes:
    'Base game and Feature Play both return 96.35% RTP. Maximum prize 5,000× your play.',
}

// ── t() — translate a key ─────────────────────────────────────────────────────

/**
 * Look up a translation key for the given locale and optional game mode.
 * Falls back to English if the locale or key is missing.
 * In 'social' mode, spin/win/balance are remapped to play/prize/coins.
 */
export function t(
  locale: Locale,
  key:    keyof Translations,
  mode:   GameMode = 'real',
): string {
  if (mode === 'social' && key in SOCIAL_OVERRIDES) {
    return SOCIAL_OVERRIDES[key as keyof typeof SOCIAL_OVERRIDES]!
  }
  // Base locale strings first.
  const base = locales[locale]?.[key]
  if (base !== undefined) return base
  // Overdrive feature-string layer (all 16 locales), falling back to English.
  const fk = key as FeatureKey
  const feat = featureI18n[locale]?.[fk] ?? featureI18n.en[fk]
  if (feat !== undefined) return feat
  return locales.en[key] ?? ''
}
