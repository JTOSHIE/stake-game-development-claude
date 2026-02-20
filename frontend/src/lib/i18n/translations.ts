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
}

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
}

// ── Locale map ────────────────────────────────────────────────────────────────

export const locales: Record<Locale, Translations> = {
  en, ar, de, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh,
}

// ── Social casino overrides ───────────────────────────────────────────────────
// In social (free-to-play) mode, remap three labels to non-gambling language.

export const SOCIAL_OVERRIDES: Partial<Record<keyof Translations, string>> = {
  spin:    'PLAY',
  win:     'PRIZE',
  balance: 'COINS',
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
  return locales[locale]?.[key] ?? locales.en[key]
}
