import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

WORK, OUT = Path(sys.argv[1]), Path(sys.argv[2])
L = json.loads((WORK / "layout.json").read_text())
light = np.load(WORK / "light.npy")
rgba = np.asarray(Image.open(WORK / "albedo.png").convert("RGBA")).astype(np.float32) / 255
alpha = rgba[:, :, 3]
if light.max() == 0:
    raise SystemExit("bake is empty")


def decode(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


# Light is baked at reduced resolution without the print, so it is smooth by nature: lift it to atlas size,
# smooth away sampling noise inside each panel (never across panels), then multiply the crisp print back in.
AH0, AW0 = alpha.shape
light = ndimage.zoom(light, (AH0 / light.shape[0], AW0 / light.shape[1], 1), order=1)[:AH0, :AW0]
albedo = decode(rgba[:, :, :3])
baked = np.zeros_like(albedo)
BY_ID = {p["id"]: p for p in L["panels"]}
SIGMA = float(__import__("os").environ.get("LIGHT_SMOOTH", "2.2"))


def encode(lin):
    lin = np.clip(lin, 0, 1)
    return np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)


for p in L["panels"]:
    y, x, h, w = p["y"], p["x"], p["ph"], p["pw"]
    m = (alpha[y:y + h, x:x + w] > 0.5).astype(np.float32)
    if not m.any():
        continue
    part = light[y:y + h, x:x + w]
    far = p["backdrop"] or (p["decal"] and BY_ID[p["decal"]]["backdrop"])
    if far:
        # The open view is far off: nothing in the near scene can shade it, so it takes the sky's unshaded light.
        lit = part[m > 0.5]
        even = np.percentile(lit, 92, axis=0)
        baked[y:y + h, x:x + w] = albedo[y:y + h, x:x + w] * (even + p["emit"])
        continue
    k = max(.6, SIGMA * min(1, min(h, w) / 24))
    wsum = ndimage.gaussian_filter(m, k, mode="nearest") + 1e-6
    smooth = np.dstack([ndimage.gaussian_filter(part[..., c] * m, k, mode="nearest") / wsum for c in range(3)])
    baked[y:y + h, x:x + w] = albedo[y:y + h, x:x + w] * (smooth + p["emit"])
solid = alpha > 0.5
idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
lin = baked[idx[0], idx[1]]
a = alpha.copy()


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
    if base["backdrop"]:
        region *= far_shade(d, base, world, n, dn, do, du, dv, over)[..., None]
    region[:] = region * (1 - over[..., None]) + colour * over[..., None]
    held = a[y:y + base["ph"], x:x + base["pw"]]
    held[:] = held * (1 - over) + over


# The far backdrop is lit evenly because nothing in the near scene can shade it, but its own cut layers still shade
# one another, as in any shadow box. For flat layers under one sun that shadow is plain geometry: each pixel looks
# toward the sun along SUN_TO_LIGHT and is shaded where it meets a layer standing in front of it. The sun's soft edge
# widens the shadow with the gap, and the layer also hides part of the sky from what lies close behind it.
SUN = np.array(L["sunToLight"], dtype=float) / np.linalg.norm(L["sunToLight"])
FAR_DEPTH = {}


def far_shade(d, base, world, n, dn, do, du, dv, over):
    hb = FAR_DEPTH.setdefault(base["id"], np.zeros((base["ph"], base["pw"])))
    hd = height(d)
    gap = np.maximum(hd - hb, 0)
    start = world + hb[..., None] * n
    t = ((do - start) @ dn) / (SUN @ dn)
    rel = start + t[..., None] * SUN - do
    dx = (rel @ du) / d["w"] * d["pw"]
    dy = (1 - (rel @ dv) / d["h"]) * d["ph"]
    inside = (dx >= 0) & (dx < d["pw"]) & (dy >= 0) & (dy < d["ph"])
    occ = ndimage.map_coordinates(alpha, [dy + d["y"] - .5, dx + d["x"] - .5], order=1) * inside
    px_per_unit = base["pw"] / base["w"]
    g = float(np.median(gap[occ > .5])) if (occ > .5).any() else float(hd)
    occ = ndimage.gaussian_filter(occ, max(.5, g * .14 / 2.5 * px_per_unit), mode="nearest")
    sun, sky = L["light"]["sun"] * max(float(SUN @ n), 0), L["light"]["sky"]
    # Shadowed paper still takes the sky and the bounce off the lit layer beside it, so it never goes black.
    shade = 1 - occ * sun / (sun + sky) * .55
    near = ndimage.gaussian_filter(over, max(.5, g * .9 * px_per_unit), mode="nearest")
    shade *= 1 - np.clip(near - over, 0, 1) * sky / (sun + sky) * .9
    hb[over > .5] = hd
    return shade


def height(d):
    base = BY_ID[d["decal"]]
    return (np.array(d["o"]) - np.array(base["o"])) @ np.array(base["n"])


for d in sorted((p for p in L["panels"] if p["decal"] and not p["view"]), key=height):
    flatten(d)

C = L["camera"]
reach = 1160 / C["zoom"]
CAMERAS = [np.array([x, reach * .225, reach * .974]) for x in (C["x0"], C["x1"])]
EYE = sum(CAMERAS) / len(CAMERAS)


def carve(base, parts):
    # Relief seen from the game camera. Each wall pixel takes the nearest piece its camera ray meets on the way in,
    # so a box on a wall shelf keeps its end and top instead of collapsing to the face parallel to the wall.
    bo, bu, bv = frame(base)
    py, px = np.mgrid[0:base["ph"], 0:base["pw"]]
    world = bo + (px[..., None] + .5) / base["pw"] * base["w"] * bu + (1 - (py[..., None] + .5) / base["ph"]) * base["h"] * bv
    ray = world - EYE
    best = np.full(world.shape[:2], np.inf)
    over = np.zeros(world.shape[:2])
    colour = np.zeros(world.shape)
    for d in parts:
        do, du, dv = frame(d)
        dn = np.array(d["n"], dtype=float)
        centre = do + du * d["w"] / 2 + dv * d["h"] / 2
        if dn @ (EYE - centre) <= 0:
            continue
        denom = ray @ dn
        with np.errstate(divide="ignore", invalid="ignore"):
            t = ((do - EYE) @ dn) / denom
        rel = EYE + t[..., None] * ray - do
        dx = (rel @ du) / d["w"] * d["pw"]
        dy = (1 - (rel @ dv) / d["h"]) * d["ph"]
        inside = (dx >= 0) & (dx < d["pw"]) & (dy >= 0) & (dy < d["ph"]) & (t > 0) & (t < 1.0005)
        if not inside.any():
            continue
        coords = [np.where(inside, dy + d["y"] - .5, 0), np.where(inside, dx + d["x"] - .5, 0)]
        cover = ndimage.map_coordinates(alpha, coords, order=1) * inside
        hit = (cover > .02) & (t < best)
        if not hit.any():
            continue
        best[hit] = t[hit]
        over[hit] = cover[hit]
        for c in range(3):
            colour[..., c][hit] = ndimage.map_coordinates(lin[..., c], coords, order=1)[hit]
    y, x = base["y"], base["x"]
    region = lin[y:y + base["ph"], x:x + base["pw"]]
    region[:] = region * (1 - over[..., None]) + colour * over[..., None]
    held = a[y:y + base["ph"], x:x + base["pw"]]
    held[:] = held * (1 - over) + over


for base_id in dict.fromkeys(p["decal"] for p in L["panels"] if p["decal"] and p["view"]):
    carve(BY_ID[base_id], [p for p in L["panels"] if p["decal"] == base_id and p["view"] and not p["ghost"]])
rgb = encode(lin)
atlas = np.dstack([rgb, a])
keep = atlas.copy()
for p in L["panels"]:
    if p["backdrop"] or (p["decal"] and BY_ID[p["decal"]]["backdrop"]):
        keep[p["y"]:p["y"] + p["ph"], p["x"]:p["x"] + p["pw"]] = 0
# Far layers were packed last: everything below the near panels ships in backdrop.webp, so crop it off the atlas.
near_h = max((p["y"] + p["ph"] for p in L["panels"] if not (p["backdrop"] or (p["decal"] and BY_ID[p["decal"]]["backdrop"]))), default=keep.shape[0]) + 6
keep = keep[:near_h]
L["atlas"]["h"] = keep.shape[0]
Image.fromarray((keep * 255 + 0.5).astype(np.uint8), "RGBA").save(OUT / "atlas.webp", quality=80, method=6, alpha_quality=85)

def seen(p):
    if p["group"] or p["motion"] or p.get("show") or p.get("keep"):
        return True
    u, v = (np.array(p[k], dtype=float) for k in "uv")
    u, v = u / np.linalg.norm(u), v / np.linalg.norm(v)
    corners = [np.array(p["o"]) + u * x * p["w"] + v * y * p["h"] for x in (0, 1) for y in (0, 1)]
    return any(np.dot(np.array(p["n"]), cam - c) > 0 for cam in CAMERAS for c in corners)


keys = ("id", "o", "u", "v", "w", "h", "x", "y", "pw", "ph", "c", "solid", "motion", "group", "show")
def tiles(q, n):
    if n <= 1:
        return [q]
    u = np.array(q["u"], dtype=float)
    u = u / np.linalg.norm(u)
    out = []
    for k in range(n):
        # Neighbouring tiles overlap by two pixels so no seam opens between them.
        x0, x1 = max(0, round(q["pw"] * k / n) - 1), min(q["pw"], round(q["pw"] * (k + 1) / n) + 1)
        o = (np.array(q["o"], dtype=float) + u * q["w"] * x0 / q["pw"]).round(3).tolist()
        out.append({**q, "id": f'{q["id"]}-{k}', "o": o, "w": q["w"] * (x1 - x0) / q["pw"], "x": q["x"] + x0, "pw": x1 - x0})
    return out


quads = [t for p in L["panels"] if not p["ghost"] and not p["decal"] and not p["backdrop"] and seen(p) for t in tiles({k: p.get(k) for k in keys}, p.get("split", 1))]
for p in L["panels"]:
    if p["backdrop"]:
        crop = rgb[p["y"]:p["y"] + p["ph"], p["x"]:p["x"] + p["pw"]]
        Image.fromarray((crop * 255 + 0.5).astype(np.uint8), "RGB").save(OUT / "backdrop.webp", quality=78, method=6)
manifest = {"atlas": L["atlas"], "runs": L["runs"], "quads": quads}
(OUT / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")))
print(L["id"], "quads", len(quads), "atlas", L["atlas"]["w"], L["atlas"]["h"], "kb", (OUT / "atlas.webp").stat().st_size // 1024)
