<script lang="ts">
  // HeroIdle.svelte, the pilot at rest. R153 (2026-10-07): ONE STILL, AND NOTHING ELSE.
  //
  // The owner's brief (reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md, TASK 2) took
  // the hero off the scored path: the win unfold, the feature brace, the glance and the idle
  // strip are no longer rendered, one still remains, and the float SceneGroup puts on
  // .char-layer is the ceiling of his motion. This file draws ui/scene_character.png, the
  // owner's R145 Astra still, as one <img>. It has no state, reads no store, sets no timer and
  // emits nothing, so no part of a round can wait on it.
  //
  // WHY THIS STILL. It is the only committed single-frame raster of the pilot (680x1344). The
  // idle sheet's frame 01, which stood in for a still from R130 to R152, is one frame of a
  // six-frame strip, so drawing it still fetches and paints the strip; cutting that frame out
  // would be a raster commit and so would a new render, and the brief forbids both. Measured
  // in the 206x407 box against that frame 01 (alpha > 127): silhouette IoU 0.9565, the same
  // x extent (27..178), the crown 1 px and the feet 3 px higher (11..399 becomes 10..396).
  //
  // THE THREE ACCENTS STILL SIT, SO THEY WERE NOT RE-PINNED. SceneGroup's .antenna-light,
  // .visor-glint and .chest-lamp are percentages of the same box. The features they light
  // moved by at most 1.9 px on this still (orb centroid -0.4/-1.3 px, lamp bars -0.2/-1.9 px),
  // and the share of each glow's weight that lands on the figure is 91.3%, 99.9% and 100%,
  // against 90.8%, 100% and 100% on the frame they were pinned to. The underglow the brief
  // names is the CAR's (.underglow inside .car-layer) and the car did not change.
  //
  // REVERTING is this file at 895815b9 plus the R153 prune-list lines in vite.config.ts and
  // build_diet_verify.mjs, never a re-render.
  //
  // EVERYTHING BELOW THIS LINE AND ABOVE `export let` IS THE DATED HISTORY (R130 to R152) OF
  // THE REACTION SYSTEM THIS FILE NO LONGER CONTAINS. It is kept unedited as the record;
  // none of it describes the live component.
  //
  // HeroIdle.svelte, the crossed-arms pilot: PLANTED at rest, reacting when
  // something happens.
  //
  // R130 FROZE THE IDLE. The owner's word was "an amateur ticking clock", and
  // the ruling was that bad motion scores worse than a still. The idle is now a
  // held rest pose - no flipbook, no sway, no dissolve - and the win unfold and
  // the feature brace are the only performances this hero has.
  //
  // WHAT THE IDLE IS NOW. One element, one sheet, background-position-x: 0,
  // animation-name: none. That is the whole of it. It is achieved by DELETING
  // the idle rules, not by adding a rule that switches them off - see the
  // FREEZE BY DELETION note in the style block, which is load-bearing.
  //
  // R138 PUT A FLOAT UNDER HIM AND A DISSOLVE INSIDE THE REACTIONS, AND NEITHER
  // TOUCHES THE FROZEN POSE. The owner's ruling after the live upload was that
  // completely still is now too dead. The float is whole-layer travel on
  // SceneGroup's .char-layer, one level ABOVE this component (translateY only,
  // 3px over 5s, half the car's measured 6px), so the pose held here still
  // cannot tick: this sheet keeps frame 01 with no idle animation of its own.
  // The reactions play through a two-buffer crossfade: this sheet element holds
  // the current frame at opacity 1 while .hero-cross, mounted only for the
  // duration of a reaction, fades the NEXT frame in over it, so each adjacent-frame
  // silhouette step reads as a continuous blend instead of an 8 to 10fps cut.
  //
  // R140 REPLACED BOTH REACTION STRIPS WITH DENSE ONES: the win went 16 -> 32 frames
  // and the brace 7 -> 16, which is what the crossfade was always sized to exploit.
  // Measured at render size 206x407, alpha>127, symmetric difference over union, the
  // mean adjacent-frame step FELL 11.098% -> 6.913% on the win and 13.312% -> 8.256%
  // on the brace, about 38% on each, while the peak displacement from rest barely
  // moved (27.043% -> 24.317% and 27.988% -> 26.160%). So it is the SAME performance
  // sampled roughly twice as finely, not a different or larger one - which is exactly
  // what the owner asked for when he called the transitions a slideshow. The idle never
  // uses the dissolve: the top buffer does not exist while motion is 'idle'.
  //
  // WHERE THE "TINY LIFE" LIVES, AND IT IS NOT IN THIS FILE. The brief allowed a
  // small local accent on the resting figure. It already existed, one level up:
  // SceneGroup.svelte mounts .antenna-light (an amber orb pulsing on 2.8s) and
  // .visor-glint (a specular sweep on 6s, silent for 92% of its cycle) as
  // SIBLINGS of this component, inside the same 206x407 .char-layer box, so their
  // percentages land on this sprite 1:1. Measured live: the antenna sits at
  // x53.9..76.9 / y61..83.7 of the hero box, which is the ocular pod, and the
  // glint at x66..107 / y45.3..94.1, which is the visor's cyan half. Both are
  // local light on a static figure - no body translation, no silhouette change.
  // DO NOT ADD ANOTHER ONE HERE. A glow child of .hero-body would be cast into
  // the parent's drop-shadow (see .hero-body below), so pulsing it would pulse
  // the shadow - R129's double-shadow defect arriving by a new route.
  //
  // WHY ONE ELEMENT. Every sheet is the same figure at the same scale in the
  // same box, so the only thing that has to change to play a reaction is which
  // sheet the element is reading and how many steps it takes through it.
  //
  // WHY THE CUT DOES NOT SHOW, AND THE FREEZE MADE IT FREE. The reaction sheets
  // derive from the same immutable master as the idle, and every one of them
  // both STARTS and ENDS on the idle's rest pose. Measured at render size
  // 206x407 against idle frame 01, as silhouette change / mean absolute RGB:
  //
  //     win frame 01     0.006% / 0.004      win frame 32    0.006% / 0.004
  //     brace frame 01   0.006% / 0.004      brace frame 16  0.006% / 0.004
  //
  // R140: THOSE FOUR USED TO READ 0.000% AND THE CHANGE IS NOT A REGRESSION. The dense
  // strips derive from the stated identity master, and delivered frame 01 is
  // BYTE-IDENTICAL to it. That master differs from the one the 16-frame sheet was cut
  // from by 3,587 px at 680x1344, every one of them alpha delta <= 3 on an edge, with
  // silhouette IoU exactly 1.000000 - the same pose through a different chain. Resampled
  // into the box that reads as 0.006%, and the RESAMPLE CONTROL (the live rest frame put
  // through a 680x1344 detour and compared with itself) is 0.027%. The endpoints are
  // therefore FOUR TIMES CLOSER to rest than the floor of the instrument measuring them.
  // Both ends of both reactions are still free. That is BETTER than it was: while the
  // idle animated, a reaction could be cut into from any of six frames, up to
  // 10.242% silhouette away from rest (frame 04). Frozen on frame 01, the cut in
  // is exactly the 0.000% above. The freeze target must therefore stay frame 01,
  // which `background-position-x: 0` on .hero-idle already supplies.
  // (The RGB companion to that 10.242% is quoted as 37.312 in this session's
  // commit message and is nearer 36.967 - it moves with the mask convention where
  // the silhouette figure does not, so the silhouette number is the one to cite.)
  //
  // R130 REMOVED A FOURTH STATE, 'glance'. It was a 6-frame flipbook on a 24s
  // timer plus a body turn, and it was the last idle-state motion left after the
  // freeze. Two measurements retired it, neither of them about the tick - by the
  // tick metric the glance was innocent, at 1.255% x 283ms against the idle's
  // 18.75% x 733ms, some 46x calmer. (That 1.255% is threshold-sensitive because
  // the glance sheet has soft edges: it reads 1.378% at alpha>=64. The idle's
  // 18.75% is stable across the same range. Compare the two only at one threshold.)
  //   1. Its body animation rotated -1.3deg about the feet and HELD that off-rest
  //      for 680ms, displacing the head 8.96px at the top of the box - just over
  //      TWICE the entire peak-to-peak swing of the sway this session deleted, and
  //      about half the feature brace's own peak. The ratio is scale-invariant on
  //      the centreline and is exactly sin(1.3deg)/(2*sin(0.32deg)) = 2.03; an
  //      earlier draft of this comment said 2.12, which reproduces from no probe
  //      point on the sprite and contradicted the two numbers beside it (9.10/4.41
  //      = 2.06). Check a ratio against its own operands before writing it down.
  //      A pendulum rule cannot mean only the small pendulum, and once the sway
  //      went this was the ONLY transform left anywhere in the idle state.
  //   2. Its art alone could not carry it. Across all six glance frames the
  //      silhouette bbox is invariant and the centroid drifts 0.239px: the head
  //      turn was sold entirely by the transform, so cutting the transform alone
  //      would have left a strip nobody could see still holding the state machine
  //      - and react() refuses every reaction while it does.
  //
  // A THIRD REASON WAS OFFERED AND IT WAS WRONG, RECORDED SO IT IS NOT RE-USED.
  // Glance frame 01 sits a small but non-zero distance from idle frame 01, where
  // every win and brace endpoint is byte-identical to it - which looks like proof
  // that the glance is the one strip not landing on rest. It is not: the glance
  // sheet is authored at 475x940 a frame where the other three are 394x780, so it
  // takes a different downsample path into the 206x407 box. CONTROL: push the
  // IDLE's own frame 01 through a 475x940 detour and back, and it lands 5.220 mean
  // RGB from itself against the glance's 5.537 - both measured the same way, over
  // the intersection eroded 5px to exclude edges. So 94.3% of the gap is the
  // resampler, not the art. QUOTE BOTH SIDES OF A RATIO FROM THE SAME MASK: an
  // earlier draft paired that 94% with an un-eroded 5.825, which is a different
  // denominator (and does not itself reproduce under any single convention).
  // Measure a cross-sheet difference against a resample control before calling it
  // a pose difference.
  //
  // hero_glance_6f.png (1,655,215 B) is consequently an ORPHAN. It was left on disk
  // deliberately - reinstating it is a revert, not a re-render.
  // R140 CORRECTION: this used to say the orphan "still ships", and it does not.
  // vite.config.ts names it in build-diet's explicit prune list, so it is kept in the
  // REPOSITORY and stripped from the BUNDLE. Verified by reading the build log of this
  // session's own build: "pruned file .../hero_glance_6f.png (1.58 MB)", and the file
  // is absent from dist afterwards. Noted here rather than left, because a stale claim
  // in a file a reader trusts is the failure convention (h.1) was written about.

  export let assetBase: string
</script>

<!-- R153: the whole hero. One element, one raster, no animation of its own. -->
<img
  class="hero-still"
  data-testid="hero-still"
  src="{assetBase}/ui/scene_character.png"
  alt=""
  draggable="false"
/>

<style>
  /* The drop-shadow is the one .hero-body carried, and .char-img before it, so the figure sits
     on the scene exactly as it did. No animation, no transform and no will-change here: the
     float on SceneGroup's .char-layer is the only motion, and it moves this element with it.
     object-fit: contain lands the 680x1344 still in the 206x407 box at one scale (0.30283);
     the two aspects differ by 0.0002, so contain is a 0.03 px letterbox, not a crop. */
  .hero-still {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
  }
</style>
