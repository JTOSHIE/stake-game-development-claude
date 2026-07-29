<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: rgs
- resolved_url: https://stake-engine.com/docs/rgs
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Rgs - API Documentation
- chars: 12025
- sha256: cefad0fd2ed1a789e4b50cea9f0a2266d1ab5d0f04428f3d1889531a31a24580
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

RGS Details

This specification outlines the API endpoints available to providers for communicating with the Stake Engine. These APIs enable key operations such as creating bets, completing bets, validating sessions, and retrieving player balances.

Introduction

This document defines how the provider’s frontend communicates with the Stake Engine endpoints. It includes a detailed description of the core API functionality, along with the corresponding request and response structures.

The API facilitates communication between your game and the server. Each of the APIs will request the server to perform an action such as; authenticating a session, playing a round of a game and ending a round of a game. The APIs can be here.

Stake Engine NPM Client

Simplify communication to the RGS via the Stake Engine client. This package has helpers to streamline communication with the RGS.

Find information on the package and how to use it here.

https://github.com/StakeEngine/ts-client
API flows

All flows require the /wallet/authenticate API to be called when the game first loads. This authorizes the sessionID to be used by the /wallet/play, /wallet/balance and /wallet/end-round endpoints. If /wallet/authenticate endpoint has not been called with by the game, all subsequent APIs call will be returned with a 400 ERR_IS error as the session is invalid.

There the intended way to interact with the Stake Engine RGS API is described as a Basic Flow. This flow takes creates a round and will close the round after all animations have been complete. It accomplishes this by calling the /wallet/play API and then calling the /wallet/end-round API when the round is complete.

Basic flow

You will call /wallet/play and /wallet/end-round in a basic flow which is the simplest way to interact with the API. If you have a longer round that may include many steps (such as a bonus round in a slot game) you may want to save where the user is up to watching incase they disconnect. When they reload the game in the future, you can use the value found in round.event in the /wallet/authenticate API response to know where to display the animations for that round from.

URL Structure

Games are hosted under a predefined URL. Providers should use the parameters below to interact with the RGS on behalf of the user and correctly display game information.

https://{{.TeamName}}.cdn.stake-engine.com/{{.GameID}}/{{.GameVersion}}/index.html?sessionID={{.SessionID}}&lang={{.Lang}}&device={{.Device}}&rgs_url={{.RgsUrl}}

Query Params in URL
Field	Description
sessionID	Unique session ID for the player. Required for all requests made by the game.
lang	Language in which the game will be displayed.
device	Specifies ‘mobile’ or ‘desktop’.
rgs_url	The URL used for authentication, placing bets, and completing rounds. This URL should not be hardcoded, as it may change dynamically.
Language

The lang parameter should be an ISO 639-1 language code.

Supported languages:

ar (Arabic)
de (German)
en (English)
es (Spanish)
fi (Finnish)
fr (French)
hi (Hindi)
id (Indonesian)
ja (Japanese)
ko (Korean)
pl (Polish)
pt (Portuguese)
ru (Russian)
tr (Turkish)
vi (Vietnamese)
zh (Chinese)
‘da’ (Danish)
Understanding Money

Monetary values in the Stake Engine are integers with six decimal places of precision:

Value	Actual Amount
100,000	0.1
1,000,000	1
10,000,000	10
100,000,000	100

For example, to place a $1 bet, pass "1000000" as the amount.

Currency impacts only the display layer; it does not affect gameplay logic.

Supported Currencies
Currency	Abbreviation	Display	Example
United States Dollar	USD	$	$10.00
Canadian Dollar	CAD	CA$	CA$10.00
Japanese Yen	JPY	¥	¥10
Euro	EUR	€	€10.00
Russian Ruble	RUB	₽	₽10.00
Chinese Yuan	CNY	CN¥	CN¥10.00
Philippine Peso	PHP	₱	₱10.00
Indian Rupee	INR	₹	₹10.00
Indonesian Rupiah	IDR	Rp	Rp10
South Korean Won	KRW	₩	₩10
Brazilian Real	BRL	R$	R$10.00
Mexican Peso	MXN	MX$	MX$10.00
Danish Krone	DKK	KR	10.00 KR
Polish Złoty	PLN	zł	10.00 zł
Vietnamese Đồng	VND	₫	10 ₫
Turkish Lira	TRY	₺	₺10.00
Chilean Peso	CLP	CLP	10 CLP
Argentine Peso	ARS	ARS	10.00 ARS
Peruvian Sol	PEN	S/	S/10.00
Nigerian Naira	NGN	₦	₦10.00
Saudi Arabia Riyal	SAR	SAR	10.00 SAR
Israel Shekel	ILS	ILS	10.00 ILS
United Arab Emirates Dirham	AED	AED	10.00 AED
Taiwan New Dollar	TWD	NT$	NT$10.00
Norway Krone	NOK	kr	kr10.00
Kuwaiti Dinar	KWD	KD	KD10.00
Jordanian Dinar	JOD	JD	JD10.00
Costa Rica Colon	CRC	₡	₡10.00
Tunisian Dinar	TND	TND	10.00 TND
Singapore Dollar	SGD	SG$	SG$10.00
Malaysia Ringgit	MYR	RM	RM10.00
Oman Rial	OMR	OMR	10.00 OMR
Qatar Riyal	QAR	QAR	10.00 QAR
Bahraini Dinar	BHD	BD	BD10.00
Pakistani Rupee	PKR	₨	₨10.00
Egyptian Pound	EGP	ج.م	ج.م10.00
New Zealand Dollar	NZD	NZ$	NZ$10.00
Bolivian Boliviano	BOB	Bs	Bs10.00
Ghanaian Cedi	GHS	GH₵	GH₵10.00
Kenyan Shilling	KES	KSh	KSh10.00
Moroccan Dirham	MAD	MAD	MAD10.00
Bosnia Convertible Mark	BAM	KM	KM10.00
Icelandic Krona	ISK	kr	kr10.00
Tanzanian Shilling	TZS	TSh	TSh10.00
Ugandan Shilling	UGX	USh	USh10.00
West African CFA Franc	XOF	CFA	CFA10.00
Stake Gold Coin	XGC	GC	10.00 GC
Stake Cash	XSC	SC	10.00 SC
Stake Euro Cash	XEC	SC	10.00 SC

Here are some functions that will help you achieve the display format for the currencies.

/**
 * Available currency codes for Stake Engine
 */
type Currency =
  | 'USD' // (United States Dollar)
  | 'CAD' // (Canadian Dollar)
  | 'JPY' // (Japanese Yen)
  | 'EUR' // (Euro)
  | 'RUB' // (Russian Ruble)
  | 'CNY' // (Chinese Yuan)
  | 'PHP' // (Philippine Peso)
  | 'INR' // (Indian Rupee)
  | 'IDR' // (Indonesian Rupiah)
  | 'KRW' // (South Korean Won)
  | 'BRL' // (Brazilian Real)
  | 'MXN' // (Mexican Peso)
  | 'DKK' // (Danish Krone)
  | 'PLN' // (Polish Złoty)
  | 'VND' // (Vietnamese Đồng)
  | 'TRY' // (Turkish Lira)
  | 'CLP' // (Chilean Peso)
  | 'ARS' // (Argentine Peso)
  | 'PEN' // (Peruvian Sol)
  | 'NGN' // (Nigerian Naira)
  | 'SAR' // (Saudi Riyal)
  | 'ILS' // (Israeli New Shekel)
  | 'AED' // (UAE Dirham)
  | 'TWD' // (Taiwan New Dollar)
  | 'NOK' // (Norwegian Krone)
  | 'KWD' // (Kuwaiti Dinar)
  | 'JOD' // (Jordanian Dinar)
  | 'CRC' // (Costa Rican Colon)
  | 'TND' // (Tunisian Dinar)
  | 'SGD' // (Singapore Dollar)
  | 'MYR' // (Malaysian Ringgit)
  | 'OMR' // (Omani Rial)
  | 'QAR' // (Qatari Riyal)
  | 'BHD' // (Bahraini Dinar)
  | 'PKR' // (Pakistani Rupee)
  | 'EGP' // (Egyptian Pound)
  | 'NZD' // (New Zealand Dollar)
  | 'BOB' // (Bolivian Boliviano)
  | 'GHS' // (Ghanaian Cedi)
  | 'KES' // (Kenyan Shilling)
  | 'MAD' // (Moroccan Dirham)
  | 'BAM' // (Bosnia Convertible Mark)
  | 'ISK' // (Icelandic Krona)
  | 'TZS' // (Tanzanian Shilling)
  | 'UGX' // (Ugandan Shilling)
  | 'XOF' // (West African CFA Franc)
  | 'XGC' // Stake Gold Coin
  | 'XSC' // Stake Cash
  | 'XEC' // Stake Euro Cash

/**
 * Currency metadata: symbol, default decimals, symbol placement
 * 
 */
const CurrencyMeta: Record<
  Currency,
  { symbol: string; decimals: number; symbolAfter?: boolean }
> = {
  USD: { symbol: '$', decimals: 2 },
  CAD: { symbol: 'CA$', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  EUR: { symbol: '€', decimals: 2 },
  RUB: { symbol: '₽', decimals: 2 },
  CNY: { symbol: 'CN¥', decimals: 2 },
  PHP: { symbol: '₱', decimals: 2 },
  INR: { symbol: '₹', decimals: 2 },
  IDR: { symbol: 'Rp', decimals: 0 },
  KRW: { symbol: '₩', decimals: 0 },
  BRL: { symbol: 'R$', decimals: 2 },
  MXN: { symbol: 'MX$', decimals: 2 },
  DKK: { symbol: 'KR', decimals: 2, symbolAfter: true },
  PLN: { symbol: 'zł', decimals: 2, symbolAfter: true },
  VND: { symbol: '₫', decimals: 0, symbolAfter: true },
  TRY: { symbol: '₺', decimals: 2 },
  CLP: { symbol: 'CLP', decimals: 0, symbolAfter: true },
  ARS: { symbol: 'ARS', decimals: 2, symbolAfter: true },
  PEN: { symbol: 'S/', decimals: 2, symbolAfter: true },
  NGN: { symbol: '₦', decimals: 2 },
  SAR: { symbol: 'SAR', decimals: 2, symbolAfter: true },
  ILS: { symbol: '₪', decimals: 2 },
  AED: { symbol: 'AED', decimals: 2, symbolAfter: true },
  TWD: { symbol: 'NT$', decimals: 2 },
  NOK: { symbol: 'kr', decimals: 2, symbolAfter: true },
  KWD: { symbol: 'KD', decimals: 3 },
  JOD: { symbol: 'JD', decimals: 3 },
  CRC: { symbol: '₡', decimals: 2 },
  TND: { symbol: 'TND', decimals: 3, symbolAfter: true },
  SGD: { symbol: 'SG$', decimals: 2 },
  MYR: { symbol: 'RM', decimals: 2 },
  OMR: { symbol: 'OMR', decimals: 3, symbolAfter: true },
  QAR: { symbol: 'QAR', decimals: 2, symbolAfter: true },
  BHD: { symbol: 'BD', decimals: 3 },
  PKR: { symbol: '₨', decimals: 2 },
  EGP: { symbol: 'ج.م', decimals: 2 },
  NZD: { symbol: 'NZ$', decimals: 2 },
  BOB: { symbol: 'Bs', decimals: 2 },
  GHS: { symbol: 'GH₵', decimals: 2 },
  KES: { symbol: 'KSh', decimals: 2 },
  MAD: { symbol: 'MAD', decimals: 2, symbolAfter: true },
  BAM: { symbol: 'KM', decimals: 2 },
  ISK: { symbol: 'kr', decimals: 0, symbolAfter: true },
  TZS: { symbol: 'TSh', decimals: 2 },
  UGX: { symbol: 'USh', decimals: 0 },
  XOF: { symbol: 'CFA', decimals: 0, symbolAfter: true },
  XGC: { symbol: 'GC', decimals: 0 },
  XSC: { symbol: 'SC', decimals: 2 },
  XEC: { symbol: 'SC', decimals: 2 },
};

/**
 * Formats a number with its currency symbol, respecting default decimals and symbol placement.
 * The function is intended to be used for displaying balances.
 */
function DisplayBalance(balance: Balance): string {
  // Grabs the currency, if it doesn't exist in the list then it will display
  // the currency code behind the balance value.
  const meta = CurrencyMeta[balance.currency] ?? {
    symbol: balance.currency,
    decimals: 2,
    symbolAfter: true,
  };
  const formattedAmount = balance.amount.toFixed(meta.decimals);

  if (meta.symbolAfter) {
    return `${formattedAmount} ${meta.symbol}`;
  } else {
    return `${meta.symbol}${formattedAmount}`;
  }
}

Social Casino Currencies
XGC (Gold)
XSC (Stake Cash)
XEC (Stake Euro Cash)
Bet Levels

Although bet levels are not mandatory, bets must satisfy these conditions:

The bet must fall between minBet and maxBet (returned from /wallet/authenticate).
The bet must be divisible by stepBet.

It is recommended to use the predefined betLevels to guide players.

Minimum bet sizes

New game submissions should incorporate small denomination bets, which are not yet industry standard, these are levels (in USD): [$0.01, $0.02, $0.05, $0.10, ....]. Smaller denominations may require an additional floating-point representation when displaying wins. If the game has a minimum win of >= 0.1x, three points of precision are required: 0.1x * $0.01 = $0.001, while games with minimum wins <0.1x will require 4 points of precision.

How these win values are displayed is at the discrecion of the publisher, though it is reccomonded that the extra precions is only displayed with the base bet-size is <$0.10. The ‘balance’ value displaying the players bankroll does not need to display more than 2 points of precision at any time, and it is only a requirement that wins in-game show exact win amounts.

Example:

{
  "minBet": 100000,
  "maxBet": 1000000000,
  "stepBet": 10000,
  "betLevels": [
    100000, // $0.10
    200000,
    400000,
    600000,
    ...
    1000000000 // $1000
  ]
}

Bet Modes / Cost Multipliers

Games may have multiple bet modes defined in the game configuration. Refer to the Math SDK Documentation.

When making a play request:

Player debit amount = Base bet amount × Bet mode cost multiplier

Response Codes

Stake Engine uses standard HTTP response codes (200, 400, 500) with specific error codes.

400 – Client Errors
Status Code	Description
ERR_VAL	Invalid Request
ERR_IPB	Insufficient Player Balance
ERR_IS	Invalid Session Token / Session Timeout
ERR_ATE	Failed User Authentication / Token Expired
ERR_GLE	Gambling Limits Exceeded
ERR_LOC	Invalid Player Location
500 – Server Errors
Status Code	Description
ERR_GEN	General Server Error
ERR_MAINTENANCE	RGS Under Planned Maintenance
Math Publication File Formats

When publishing math results, ensure that the file-format is abided by. These are strict conditions for successful math file publication.
