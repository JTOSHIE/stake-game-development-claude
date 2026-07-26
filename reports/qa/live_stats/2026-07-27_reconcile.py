"""Between-frame money reconciliation, duty 4, 2026-07-27 intake.

Run: python3 reports/qa/live_stats/2026-07-27_reconcile.py
Prints the tables that are inlined into 2026-07-27_money_timeline.md and
rewrites 2026-07-27_bets_rows_and_reconciliation.json beside itself.

Integer micros throughout, per the CLAUDE.md integer micros rule. Costs come
from frontend/src/lib/config/fsModes.ts MODE_COST, expressed here as
numerator/denominator so no float multiply touches money.
"""
from fractions import Fraction as F
from pathlib import Path
import json

SCALE = 1_000_000
COST = {'base': F(1), 'cruise': F(1), 'antelite': F(5, 4), 'bonus': F(100), 'super': F(400)}

def micros(s):           # "1,250.00" -> 1250000000
    return int(round(float(s.replace(',', '')) * SCALE))

def money(m):            # 1250000000 -> "1,250.00"
    neg = m < 0
    m = abs(m)
    return ('-' if neg else '') + f'{m // SCALE:,}.{m % SCALE // 10_000:02d}'

SESSIONS = [
  dict(id='S1', label='live-round2-2026-07-26, 20:14:23 to 20:22:12',
       close_frame='reports/screens/live-round2-2026-07-26/05_DEFECT_mobile_portrait_reels_small_in_pane.png',
       closing_balance='512.29',
       rows=[('20:14:23','antelite','20.00','0.00'), ('20:14:35','antelite','20.00','0.00'),
             ('20:19:06','bonus','7.00','288.54'),  ('20:20:54','antelite','7.00','0.00'),
             ('20:20:57','antelite','7.00','0.00'), ('20:21:04','antelite','7.00','0.00')]),
  dict(id='S2', label='screenshot-analyst-2026-07-27 frame 01, 02:22:18 to 02:23:39',
       close_frame='reports/screens/screenshot-analyst-2026-07-27/01_dtt_bonus_row_275430_cost_column_reads_bet_level_1000.png',
       closing_balance='1167050.00',
       rows=[('02:22:18','base','1000.00','410.00'),   ('02:22:21','base','1000.00','0.00'),
             ('02:22:25','base','1000.00','550.00'),   ('02:22:37','base','1000.00','0.00'),
             ('02:22:39','base','1000.00','100.00'),   ('02:22:42','base','1000.00','0.00'),
             ('02:22:50','bonus','1000.00','275430.00'),
             ('02:23:33','antelite','1000.00','0.00'), ('02:23:35','antelite','1000.00','310.00'),
             ('02:23:39','antelite','1000.00','0.00')]),
  dict(id='S3', label='screenshot-analyst-2026-07-27 frame 02, 02:26:06 to 02:26:53',
       close_frame='reports/screens/screenshot-analyst-2026-07-27/02_play_response_antelite_amount_1000000000_is_bet_level_hud_1250.png',
       closing_balance='501870.00',
       rows=[('02:26:06','base','1000.00','910.00'),   ('02:26:14','base','1000.00','610.00'),
             ('02:26:18','base','1000.00','0.00'),     ('02:26:19','base','1000.00','0.00'),
             ('02:26:20','base','1000.00','0.00'),     ('02:26:21','base','1000.00','0.00'),
             ('02:26:22','base','1000.00','0.00'),     ('02:26:24','base','1000.00','870.00'),
             ('02:26:48','antelite','1000.00','10750.00'),
             ('02:26:51','antelite','1000.00','480.00'),
             ('02:26:53','antelite','1000.00','0.00')]),
]

out = {'generated_for': 'track/screenshot-analyst, 2026-07-27 intake', 'sessions': []}
lines = []
for s in SESSIONS:
    true_debit = 0
    cost_col_debit = 0
    credit = 0
    per_mode = {}
    for t, mode, cost_cell, payout in s['rows']:
        level = micros(cost_cell)
        d = int(level * COST[mode])
        true_debit += d
        cost_col_debit += level
        credit += micros(payout)
        key = (mode, level)
        per_mode.setdefault(key, {'rounds': 0, 'level_micros': level, 'debit_micros': 0})
        per_mode[key]['rounds'] += 1
        per_mode[key]['debit_micros'] += d
    close = micros(s['closing_balance'])
    open_true = close - credit + true_debit
    open_cost = close - credit + cost_col_debit
    lines.append(f"### {s['id']}  {s['label']}")
    lines.append('')
    lines.append(f"Rounds {len(s['rows'])}. Closing BALANCE in frame: EUR {money(close)}.")
    lines.append('')
    lines.append('| mode | rounds | bet level | true cost per round | true debit |')
    lines.append('| --- | --- | --- | --- | --- |')
    for (m, lvl), v in sorted(per_mode.items()):
        lines.append(f"| `{m}` | {v['rounds']} | EUR {money(lvl)} | "
                     f"EUR {money(int(lvl * COST[m]))} | EUR {money(v['debit_micros'])} |")
    lines.append('')
    lines.append(f"Total true debits EUR {money(true_debit)}, credits EUR {money(credit)}, "
                 f"net EUR {money(credit - true_debit)}.")
    lines.append('')
    lines.append(f"**Implied opening balance, true per-mode costs: EUR {money(open_true)}.**")
    lines.append(f"Implied opening balance if the COST column were the debit: EUR {money(open_cost)}.")
    lines.append('')
    out['sessions'].append({
        'id': s['id'], 'label': s['label'], 'closing_frame': s['close_frame'],
        'rounds': len(s['rows']),
        'closing_balance_micros': close,
        'true_debit_micros': true_debit, 'credit_micros': credit,
        'cost_column_debit_micros': cost_col_debit,
        'implied_opening_true_costs_micros': open_true,
        'implied_opening_cost_column_micros': open_cost,
        'residual_micros': 0,
        'rows': [{'time': t, 'mode': m, 'cost_column_micros': micros(c),
                  'true_debit_micros': int(micros(c) * COST[m]),
                  'payout_micros': micros(p),
                  'mult_vs_level': float(F(micros(p), micros(c))) if micros(c) else None,
                  'mult_vs_true_cost': float(F(micros(p), int(micros(c) * COST[m]))) if micros(c) else None}
                 for t, m, c, p in s['rows']],
    })

print('\n'.join(lines))
OUT = Path(__file__).with_name('2026-07-27_bets_rows_and_reconciliation.json')
json.dump(out, OUT.open('w'), indent=2)
