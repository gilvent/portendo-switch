import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

WORK, OUT = Path(sys.argv[1]), Path(sys.argv[2])
L = json.loads((WORK / "layout.json").read_text())
baked = np.load(WORK / "baked.npy")
alpha = np.asarray(Image.open(WORK / "albedo.png").convert("RGBA"))[:, :, 3].astype(np.float32) / 255
if baked.max() == 0:
    raise SystemExit("bake is empty")


def encode(lin):
    lin = np.clip(lin, 0, 1)
    return np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)


solid = alpha > 0.5
idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
lin = baked[idx[0], idx[1]]
a = alpha.copy()
BY_ID = {p["id"]: p for p in L["panels"]}


def frame(p):
    u, v = (np.array(p[k], dtype=float) for k in "uv")
    return np.array(p["o"], dtype=float), u / np.linalg.norm(u), v / np.linalg.norm(v)


def flatten(d):
    base = BY_ID[d["decal"]]
    bo, bu, bv = frame(base)
    do, du, dv = frame(d)
    n = np.array(base["n"], dtype=float)
    py, px = np.mgrid[0:base["ph"], 0:base["pw"]]
    world = bo + (px[..., None] + .5) / base["pw"] * base["w"] * bu + (1 - (py[..., None] + .5) / base["ph"]) * base["h"] * bv
    dn = np.array(d["n"], dtype=float)
    depth = ((do - world) @ dn) / (n @ dn)
    rel = world + depth[..., None] * n - do
    dx = (rel @ du) / d["w"] * d["pw"]
    dy = (1 - (rel @ dv) / d["h"]) * d["ph"]
    coords = [dy + d["y"] - .5, dx + d["x"] - .5]
    inside = (dx >= 0) & (dx < d["pw"]) & (dy >= 0) & (dy < d["ph"])
    over = ndimage.map_coordinates(alpha, coords, order=1) * inside
    colour = np.dstack([ndimage.map_coordinates(lin[..., c], coords, order=1) for c in range(3)])
    y, x = base["y"], base["x"]
    region = lin[y:y + base["ph"], x:x + base["pw"]]
    region[:] = region * (1 - over[..., None]) + colour * over[..., None]
    held = a[y:y + base["ph"], x:x + base["pw"]]
    held[:] = held * (1 - over) + over


def height(d):
    base = BY_ID[d["decal"]]
    return (np.array(d["o"]) - np.array(base["o"])) @ np.array(base["n"])


for d in sorted((p for p in L["panels"] if p["decal"]), key=height):
    flatten(d)
rgb = encode(lin)
atlas = np.dstack([rgb, a])
keep = atlas.copy()
for p in L["panels"]:
    if p["backdrop"] or (p["decal"] and BY_ID[p["decal"]]["backdrop"]):
        keep[p["y"]:p["y"] + p["ph"], p["x"]:p["x"] + p["pw"]] = 0
Image.fromarray((keep * 255 + 0.5).astype(np.uint8), "RGBA").save(OUT / "atlas.webp", quality=80, method=6, alpha_quality=85)

C = L["camera"]
reach = 1160 / C["zoom"]
CAMERAS = [np.array([x, reach * .225, reach * .974]) for x in (C["x0"], C["x1"])]


def seen(p):
    if p["group"] or p["motion"]:
        return True
    u, v = (np.array(p[k], dtype=float) for k in "uv")
    u, v = u / np.linalg.norm(u), v / np.linalg.norm(v)
    corners = [np.array(p["o"]) + u * x * p["w"] + v * y * p["h"] for x in (0, 1) for y in (0, 1)]
    return any(np.dot(np.array(p["n"]), cam - c) > 0 for cam in CAMERAS for c in corners)


keys = ("id", "o", "u", "v", "w", "h", "x", "y", "pw", "ph", "c", "solid", "motion", "group")
quads = [{k: p[k] for k in keys} for p in L["panels"] if not p["ghost"] and not p["decal"] and not p["backdrop"] and seen(p)]
for p in L["panels"]:
    if p["backdrop"]:
        crop = rgb[p["y"]:p["y"] + p["ph"], p["x"]:p["x"] + p["pw"]]
        Image.fromarray((crop * 255 + 0.5).astype(np.uint8), "RGB").save(OUT / "backdrop.webp", quality=78, method=6)
manifest = {"atlas": L["atlas"], "runs": L["runs"], "quads": quads}
(OUT / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")))
print(L["id"], "quads", len(quads), "atlas", L["atlas"]["w"], L["atlas"]["h"], "kb", (OUT / "atlas.webp").stat().st_size // 1024)
