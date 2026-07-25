// greenscreen_to_sprite.mjs - convert a green-screen render into a drop-in sprite.
//
// The enhanced art arrives on a green field at a different canvas size to the
// sprite it replaces. Three things have to be true for it to drop in without
// shifting the scene:
//   1. real alpha, not a keyed-looking matte;
//   2. the SUBJECT scaled to the original subject's pixel size, not the canvas;
//   3. the subject placed at the original subject's offset on the original canvas.
//
// Green spill is the part that needs care: the key lives exactly where the new
// rim light does, so a hard threshold eats the rim and a loose one leaves a
// green halo. This uses a soft band plus a despill that rebalances the green
// channel rather than clipping it.
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const [,, SRC, OUT, REF] = process.argv
const b = await chromium.launch(); const p = await b.newPage()
await p.goto('http://localhost:5173/')

const dataUrl = await p.evaluate(async ({ src, ref }) => {
  const load = async (s) => { const i = new Image(); i.src = s; await i.decode(); return i }
  const ctxOf = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { c, x, d: x.getImageData(0,0,img.width,img.height) } }

  // ── reference geometry from the sprite being replaced ────────────────────
  const orig = await load(ref)
  const od = ctxOf(orig).d.data
  let ox0=1e9, oy0=1e9, ox1=-1, oy1=-1
  for (let y=0;y<orig.height;y++) for (let x=0;x<orig.width;x++) {
    if (od[(y*orig.width+x)*4+3] > 16) { if(x<ox0)ox0=x; if(x>ox1)ox1=x; if(y<oy0)oy0=y; if(y>oy1)oy1=y }
  }

  // ── key + despill ────────────────────────────────────────────────────────
  const img = await load(src)
  const { c, x, d } = ctxOf(img); const px = d.data
  let nx0=1e9, ny0=1e9, nx1=-1, ny1=-1
  for (let i=0;i<px.length;i+=4) {
    const r=px[i], g=px[i+1], bl=px[i+2]
    // Greenness relative to the strongest other channel. Robust to the render's
    // own green booster glow, which is far less saturated than the key.
    const greenness = g - Math.max(r, bl)
    let a = 255
    if (greenness > 90) a = 0                     // solid key
    else if (greenness > 30) a = Math.round(255 * (1 - (greenness - 30) / 60))  // soft edge
    if (a > 0 && greenness > 0) {
      // Despill: pull green down to the neighbouring channels' level so rim
      // pixels keep their luminance without the cast.
      px[i+1] = Math.max(r, bl) + Math.min(greenness, 12)
    }
    px[i+3] = a
    if (a > 16) { const q=i/4, xx=q%img.width, yy=(q/img.width)|0
      if(xx<nx0)nx0=xx; if(xx>nx1)nx1=xx; if(yy<ny0)ny0=yy; if(yy>ny1)ny1=yy }
  }
  x.putImageData(d, 0, 0)

  // ── scale the SUBJECT to the original subject's box, on the original canvas ─
  const out = document.createElement('canvas'); out.width = orig.width; out.height = orig.height
  const ox = out.getContext('2d')
  ox.imageSmoothingQuality = 'high'
  ox.drawImage(c, nx0, ny0, nx1-nx0+1, ny1-ny0+1, ox0, oy0, ox1-ox0+1, oy1-oy0+1)
  return out.toDataURL('image/png')
}, { src: SRC, ref: REF })

writeFileSync(OUT, Buffer.from(dataUrl.split(',')[1], 'base64'))
console.log('wrote', OUT)
await b.close()
