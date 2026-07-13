FS_AssetWiring_Fix_Prompt.md. Save this brief verbatim and commit it with this session per convention.

On branch claude/asset-wiring-fix from up-to-date main, under the autonomy posture:

1. DIAGNOSE: map every place the running game resolves visual asset URLs (reel symbol textures in GameGrid and the Pixi preloader, the frame image, the paytable symbol images, any splash or UI art). Identify each reference that resolves to the legacy roots /assets/symbols/ or /assets/frames/ instead of the active theme's paths from themeStore (/assets/themes/future-spinner/...).

2. UNIFY: point every runtime consumer at the themeStore-resolved paths so the AssetForge exports are what actually renders: the ten vector symbols (with their _1x variants where a smaller texture is appropriate), the tile plate sprite with plates.json tinting if already wired, the frame per LAYOUT_SPEC, and the paytable images. Do not delete the legacy directories (Build Diet prunes later); just remove every code reference to them. Locked files remain locked; if a locked file holds one of these references, STOP and report the exact line instead of lifting anything.

3. PROVE IT SERVED: with the dev server running, fetch http://localhost:5173/assets/themes/future-spinner/symbols/h1.png and confirm its bytes hash-match the file on disk; then load the game headless, wait for the reels, and screenshot; the check FAILS unless a crop of a reel cell differs from the same crop taken against the legacy h1 texture (proving the new art is what renders). Also confirm the frame region matches the LAYOUT_SPEC frame asset.

4. npx tsc --noEmit clean, npm run build clean, exact-total test still 44/44. Session report plus archive, commit explicit paths, push, PR into main via gh titled "Asset wiring: runtime unified to theme exports" with the report as description, stating every reference that was moved.
