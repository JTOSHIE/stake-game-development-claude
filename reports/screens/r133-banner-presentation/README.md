# R133 before and after, the win banner

Every frame here is captured at **2600ms after the banner appears**, which is inside the
SILENT TAIL: the stretch that measured 61% (big), 67% (mega) and 72% (epic) of the banner's
life, during which nothing on it moved at all. That is the moment the owner's "correct and
readable, but still basic" verdict is about, so it is the moment worth comparing.

Both sides were served by two dev servers running from two checkouts, verified one variable
apart by curling each component's STYLE module and grepping. Note that curling the plain
`.svelte` URL returns only compiled JS with no CSS in it, so a grep there always reads zero
and means nothing; that cost one false alarm before it was understood.

- `big-before-band.png` / `big-after-band.png`     BIG, ?mockCategory=base_win_large, 16.20x
- `mega-before-band.png` / `mega-after-band.png`   MEGA, ?mockCategory=high_meter, 88.75x
- `epic-before-band.png` / `epic-after-band.png`   EPIC, ?mockCategory=trigger_5, 213.67x
- `big-before-full.png` / `big-after-full.png`     the same BIG frames, whole 1280x720 stage

WHAT TO LOOK FOR IN THE BEFORE FRAMES: the tier burst erupts above and below the band and
puts nothing inside it. That is not an impression, it is measured: burst_big contributed
ZERO of 86,400 pixels inside the BIG band against a 99.937% positive control. The band is a
flat dark strip with two hard rules running off both edges of the screen.

Band geometry is byte-identical across every pair: 1280x111 at y254.5, 1280x140 at y240 and
1280x172 at y224. Nothing here is the banner getting bigger.
