"""
Rebuild the hero layers from the supplied hero mockup (a 1672x941 render with
text baked in). Writes to public/hero/:
  figure.webp        the masked figure as a real alpha cutout
  figure-alt.webp    the figure re-dressed in blue and gold, revealed by the pointer
  smoke.webp, smoke-portrait.webp, smoke-front.webp   generated smoke planes

  python3 scripts/hero-assets.py path/to/hero-mockup.webp

Needs numpy, scipy and Pillow. The thresholds are tuned for that mockup:
the giant word sits below y=540 and the copy left of x=540.
"""
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'public/hero'
os.makedirs(out, exist_ok=True)

# ── cutout ──
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
mx = a.max(-1); mn = a.min(-1); v = mx; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
H, W = v.shape
yy, xx = np.mgrid[0:H, 0:W]
bg = ((s > 0.55) & (v > 0.5)) | ((s > 0.72) & (v > 0.3))   # orange and deep red smoke
cream = (s < 0.3) & (v > 0.75)
bg |= cream & (yy > 540)                                  # the baked-in giant word
bg |= (xx > 960) & (yy > 400) & (yy < 545) & (v > 0.5)    # glow behind the right shoulder
bg |= (xx < 540) | (xx > 1330) | (yy < 130)               # headline, nav, side labels
fig = ndi.binary_opening(~bg, iterations=2)
lab, n = ndi.label(fig)
keep = lab == (1 + int(np.argmax(ndi.sum(fig, lab, range(1, n + 1)))))
keep = ndi.binary_fill_holes(keep)
keep = ndi.binary_closing(keep, iterations=3)
keep = ndi.binary_fill_holes(keep)
keep = ndi.binary_opening(keep, iterations=3)

# repair the mask's right edge: the eye socket and brow there are lit orange-brown
# by the backlight and read as smoke, which bites a notch out of the face. Any row
# that stops well short of its neighbours' edge is filled out to that edge, with
# the original pixels.
for y in range(220, 495):
    def right(yy):
        cols = np.where(keep[yy, 860:1010])[0]
        return 860 + cols.max() if len(cols) else 0
    edges = [right(yy) for yy in range(y - 22, y + 23)]
    env = int(np.median(edges))
    cur = right(y)
    if env and cur < env - 3:
        keep[y, cur:env + 1] = True
keep = ndi.binary_closing(keep, iterations=2)
keep = ndi.binary_fill_holes(keep)
alpha = ndi.gaussian_filter(keep.astype(np.float32), 1.0)
rgb = a.copy()
edge = (alpha > 0.02) & (alpha < 0.98)
rgb[edge] *= 0.75                                         # pull the orange fringe off the edge
ys, xs = np.where(keep)
x0, y0, x1, y1 = xs.min() - 6, ys.min() - 6, xs.max() + 6, H
Image.fromarray((np.clip(np.dstack([rgb, alpha])[y0:y1, x0:x1], 0, 1) * 255).astype(np.uint8)).save(f'{out}/figure.webp', quality=86, method=6)

# the reveal: the same figure re-dressed, a royal blue cloak with a gold mask,
# made by mapping its own light and shade onto two colour ramps
crop_rgb = a[y0:y1, x0:x1]
crop_al = alpha[y0:y1, x0:x1]
lum = crop_rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
inside = crop_al > 0.5
lo, hi = np.percentile(lum[inside], 1), np.percentile(lum[inside], 99.5)
l = np.clip((lum - lo) / (hi - lo), 0, 1)
l = np.clip(l + (l - ndi.gaussian_filter(l, 12)) * 1.4, 0, 1) ** 0.62   # lift the folds out of the black cloth

def ramp(v, stops, cols):
    cols = np.array(cols, np.float32) / 255
    return np.stack([np.interp(v, stops, cols[:, c]) for c in range(3)], -1)

blue = ramp(l, [0, .18, .42, .62, .78, 1], [[3, 6, 24], [10, 28, 96], [28, 70, 190], [90, 130, 230], [226, 178, 92], [255, 240, 200]])
gold = ramp(l, [0, .3, .6, .85, 1], [[40, 22, 6], [120, 74, 20], [214, 160, 70], [246, 214, 150], [255, 246, 220]])
ch, cw = lum.shape
cy, cx = np.mgrid[0:ch, 0:cw].astype(np.float32)
head = np.clip((360 - cy) / 60, 0, 1) * np.clip((lum - 0.16) / 0.14, 0, 1)   # bright parts of the head region
head = ndi.gaussian_filter(head, 2)[..., None]
alt = blue * (1 - head) + gold * head
Image.fromarray((np.clip(np.dstack([alt, crop_al]), 0, 1) * 255).astype(np.uint8)).save(f'{out}/figure-alt.webp', quality=84, method=6)
print('figure', x1 - x0, 'x', y1 - y0)

# ── smoke ──
rng = np.random.default_rng(42)

def fbm(h, w, octaves, base, seed):
    r = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(octaves):
        grid = r.random((max(2, int(base * 2 ** o * h / w)) + 1, int(base * 2 ** o) + 1)).astype(np.float32)
        acc += np.asarray(Image.fromarray(grid).resize((w, h), Image.BICUBIC)) * amp
        tot += amp; amp *= 0.55
    return acc / tot

def smoke(w, h, cx, cy, seed):
    q1 = fbm(h, w, 5, 2.2, seed); q2 = fbm(h, w, 5, 2.2, seed + 1)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    warp = 0.22 * min(w, h)
    n = ndi.map_coordinates(fbm(h, w, 7, 2.6, seed + 2), [np.clip(yy + (q2 - 0.5) * warp * 2, 0, h - 1), np.clip(xx + (q1 - 0.5) * warp * 2, 0, w - 1)], order=1)
    n = (n - n.min()) / (n.max() - n.min())
    d = np.sqrt(((xx - cx * w) / (w * 0.62)) ** 2 + ((yy - cy * h) / (h * 0.85)) ** 2)
    t = np.clip(np.clip(1.15 - d, 0, 1) ** 1.35 * 0.85 + (n - 0.5) * 0.55 + 0.08, 0, 1)
    stops = np.array([0, 0.22, 0.45, 0.68, 0.86, 1.0])
    cols = np.array([[0x3a, 0x0b, 0x07], [0x7a, 0x17, 0x0c], [0xc4, 0x2f, 0x16], [0xee, 0x5a, 0x26], [0xfa, 0x86, 0x45], [0xff, 0xb4, 0x76]], np.float32) / 255
    img = np.stack([np.interp(t, stops, cols[:, c]) for c in range(3)], -1)
    img += (rng.random((h, w, 1)).astype(np.float32) - 0.5) * 0.025
    return (np.clip(img, 0, 1) * 255).astype(np.uint8)

Image.fromarray(smoke(2400, 1350, 0.55, 0.52, 7)).save(f'{out}/smoke.webp', quality=80, method=6)
Image.fromarray(smoke(1080, 1920, 0.5, 0.62, 11)).save(f'{out}/smoke-portrait.webp', quality=80, method=6)
w, h = 2400, 900
n = fbm(h, w, 6, 3, 23)
yy = np.mgrid[0:h, 0:w][0].astype(np.float32) / h
al = np.clip((n - 0.45) * 2.2, 0, 1) * np.clip((yy - 0.25) * 1.6, 0, 1) * 0.55
peach = np.array([0xff, 0x9a, 0x5a], np.float32) / 255
Image.fromarray((np.dstack([np.broadcast_to(peach, (h, w, 3)), al]) * 255).astype(np.uint8)).save(f'{out}/smoke-front.webp', quality=75, method=6)
print('smoke planes written to', out)
