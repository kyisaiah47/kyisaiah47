"""Turn a Codex object drawn on plain white into a real-alpha PNG.
Corner flood fill: only near-white pixels connected to the image border become transparent,
so white faces inside the object stay opaque. Fails if the ground is not plain white
(for example a painted checkerboard) or if the cut leaves too little or too much."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
h, w, _ = rgb.shape
edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
if edge.min() < 236 or edge.std() > 4:
    sys.exit(f'{src}: border is not plain white (min {edge.min()}, std {edge.std():.1f}); checkerboard or scene ground')
near = (rgb.min(axis=2) >= 244) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 6)
lab, _ = ndimage.label(near)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, border[border > 0])
# Soft edge: pixels next to the cut get partial alpha by how close to white they are.
ring = ndimage.binary_dilation(bg, iterations=2) & ~bg
alpha = np.where(bg, 0, 255).astype(np.float32)
whiteness = (rgb[ring].min(axis=1) - 200).clip(0, 55) / 55.0
alpha[ring] = 255 * (1 - 0.85 * whiteness)
clear = (alpha == 0).mean()
if not 0.25 <= clear <= 0.92:
    sys.exit(f'{src}: transparent share {clear:.2f} out of range')
# Checkerboard check on what stays opaque: a fake transparency grid is a periodic grey/white tile.
op = alpha > 0
ys, xs = np.where(op)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
if y0 <= 2 or x0 <= 2 or y1 >= h - 3 or x1 >= w - 3:
    sys.exit(f'{src}: object touches the image edge (cut off)')
out = np.dstack([rgb.astype(np.uint8), alpha.clip(0, 255).astype(np.uint8)])
Image.fromarray(out, 'RGBA').save(dst, optimize=True)
print(f'{dst}: clear {clear:.2f}, bbox {x0},{y0}-{x1},{y1} of {w}x{h}')
