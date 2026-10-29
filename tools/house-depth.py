# Builds the depth map for the 3D hero (js/world.js) from assets/hero-poster.webp.
# Usage: python3 tools/house-depth.py assets/hero-poster.webp assets/house/depth.png
# Writes depth.png (R: photo depth, G: depth behind the house) and back.webp (inpainted colour behind the house).
import sys, numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB').resize((960, 540), Image.LANCZOS)).astype(np.float32)
H, W = 540, 960
r, g, b = im[..., 0], im[..., 1], im[..., 2]
vv, uu = np.mgrid[0:H, 0:W].astype(np.float32)
y, x = vv / H, uu / W
F = 1484 / 2            # focal length in this 960x540 space (fov ~40deg)
CAM_H = 1.5
HORIZON = 0.685 * H
Z_NEAR, Z_FAR = 5.0, 300.0

z = np.full((H, W), Z_FAR, np.float32)
# mountains / valley above the horizon: lower rows are nearer
z_m = 60 + np.clip((HORIZON / H - y) / 0.6, 0, 1) * 110
z = z_m.copy()
# the dark foreground ridge on the left is nearer
# sky: blue, above the mountains, per column from the top
sky = (b > r + 50) & (b > 150) & (b > g + 12) & (y < 0.62)
from scipy.ndimage import binary_opening
sky = binary_opening(sky, structure=np.ones((3, 21)))
first_rock = np.argmax(~sky, axis=0)          # first non-sky row per column
# the silhouette is smooth; drop columns where bluish snow shadow read as sky
from scipy.ndimage import median_filter, minimum_filter1d
first_rock = median_filter(first_rock, 7, mode='nearest')
sky_col = vv < first_rock[None, :]
cloud = (y < 0.3) & (r > 200) & (g > 200) & (b > 200) & ((x > 0.55) | (x < 0.13)) & (y < 0.25)
z[sky_col] = Z_FAR
z[cloud & (y < 0.24)] = Z_FAR * 0.9
# ground plane below the horizon (grass, pool, terrace)
below = vv > HORIZON + 1
z[below] = F * CAM_H / (vv[below] - HORIZON)
# trees: yellow-green blobs standing on the ground line
tree = (g > b + 35) & (g > 110) & (y > 0.47) & (y < 0.735) & (x < 0.66)
z_tree = np.where(x < 0.27, 42, np.where(x < 0.5, 58, 80))
z[tree] = np.minimum(z[tree], z_tree[tree])
# the house: glass facade receding to the left, end wall facing us
def inside(px, py, poly):
    n = len(poly); res = np.zeros(px.shape, bool); j = n - 1
    for i in range(n):
        xi, yi = poly[i]; xj, yj = poly[j]
        cond = ((yi > py) != (yj > py)) & (px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi)
        res ^= cond; j = i
    return res
S = 0.5  # 1920 -> 960
house = inside(uu, vv, [(1230*S, 585*S), (1760*S, 302*S), (1920*S, 302*S), (1920*S, 815*S), (1500*S, 812*S), (1230*S, 745*S)])
zh = np.where(uu < 1760*S, 40 - (uu - 1230*S) / (530*S) * 26, 14 - (uu - 1760*S) / (160*S) * 5)
z[house] = zh[house]
# plants and terrace on the right sit on the ground plane already
mtn = ~sky_col & ~house & (vv <= HORIZON + 1) & ~tree
zs = gaussian_filter(np.where(mtn, z, z_m), 4)
z[mtn] = zs[mtn]
z = np.clip(z, Z_NEAR, Z_FAR)
# background layer behind the house: what the photograph never saw, inpainted
import cv2
from scipy.ndimage import gaussian_filter, binary_dilation
zb = z.copy()
zb[house] = np.where(vv[house] > HORIZON + 1, z[house], z_m[house])
zb[house & (vv > HORIZON + 1)] = (F * CAM_H / (vv - HORIZON).clip(1))[house & (vv > HORIZON + 1)]
mask = binary_dilation(house, iterations=3).astype(np.uint8) * 255
bgr = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_RGB2BGR)
fill = cv2.cvtColor(cv2.inpaint(bgr, mask, 9, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
fill = gaussian_filter(fill.astype(np.float32), sigma=(3, 3, 0))
zb = np.clip(zb, Z_NEAR, Z_FAR)
dispb = (1 / zb - 1 / Z_FAR) / (1 / Z_NEAR - 1 / Z_FAR)
Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).save(out.replace('depth.png', 'back.webp'), quality=80)
back_disp = np.where(house, np.clip(dispb ** 0.5 * 255, 1, 255), 0).astype(np.uint8)
disp = (1 / z - 1 / Z_FAR) / (1 / Z_NEAR - 1 / Z_FAR)
d8 = Image.fromarray(np.clip(disp ** 0.5 * 255, 0, 255).astype(np.uint8))   # sqrt for precision in the far field
d8 = d8.filter(ImageFilter.MedianFilter(3))
# R: the photograph's depth. G: depth of what lies behind the house (0 = nothing to fill)
fg = np.asarray(d8)
Image.fromarray(np.dstack([fg, back_disp, np.zeros_like(fg)])).save(out, optimize=True)
print('saved', out)
