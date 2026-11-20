import json
import os
import sys

import bpy
from mathutils import Vector

WORK = sys.argv[sys.argv.index("--") + 1]
L = json.load(open(os.path.join(WORK, "layout.json")))
UNIT = 0.01
AW, AH = L["atlas"]["w"], L["atlas"]["h"]


def to_blender(v, k=UNIT):
    return Vector((v[0] * k, -v[2] * k, v[1] * k))


def srgb(hex_color):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(lin(int(hex_color[i:i + 2], 16)) for i in (1, 3, 5)) + (1,)


scene = bpy.context.scene
for stale in list(bpy.data.objects):
    bpy.data.objects.remove(stale)
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = os.environ.get("CYCLES_DEVICE", "METAL")
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = "GPU" if any(d.type != "CPU" for d in prefs.devices) else "CPU"
except TypeError:
    scene.cycles.device = "CPU"
scene.cycles.samples = L["samples"]
scene.cycles.use_denoising = False
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 4
scene.cycles.transmission_bounces = 4
scene.cycles.transparent_max_bounces = 8
scene.view_settings.view_transform = "Standard"

albedo = bpy.data.images.load(os.path.join(WORK, "albedo.png"))
albedo.alpha_mode = "STRAIGHT"
LS = float(os.environ.get("LIGHT_SCALE", "0.5"))
BW, BH = max(1, round(AW * LS)), max(1, round(AH * LS))
target = bpy.data.images.new("bake", BW, BH, alpha=False, float_buffer=True)
target.colorspace_settings.name = "Linear Rec.709"


def material(name, transl, emit):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    k = m.node_tree.links
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    tex = n.new("ShaderNodeTexImage")
    tex.image = albedo
    tex.interpolation = "Closest"
    uv = n.new("ShaderNodeTexCoord")
    k.new(uv.outputs["UV"], tex.inputs["Vector"])
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 900
    noise.inputs["Detail"].default_value = 6
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.22
    bump.inputs["Distance"].default_value = 0.002
    k.new(noise.outputs[0], bump.inputs["Height"])
    # The baked surface sees itself as white (light only); bounce rays still pick up its printed colour.
    path = n.new("ShaderNodeLightPath")
    own = n.new("ShaderNodeMix")
    own.data_type = "RGBA"
    k.new(path.outputs["Is Camera Ray"], own.inputs["Factor"])
    k.new(tex.outputs["Color"], own.inputs["A"])
    own.inputs["B"].default_value = (1, 1, 1, 1)
    diff = n.new("ShaderNodeBsdfDiffuse")
    k.new(own.outputs["Result"], diff.inputs["Color"])
    k.new(bump.outputs[0], diff.inputs["Normal"])
    tr = n.new("ShaderNodeBsdfTranslucent")
    k.new(own.outputs["Result"], tr.inputs["Color"])
    paper = n.new("ShaderNodeMixShader")
    paper.inputs[0].default_value = transl
    k.new(diff.outputs[0], paper.inputs[1])
    k.new(tr.outputs[0], paper.inputs[2])
    glow = n.new("ShaderNodeEmission")
    k.new(tex.outputs["Color"], glow.inputs["Color"])
    dim = n.new("ShaderNodeMath")
    dim.operation = "MULTIPLY"
    k.new(path.outputs["Is Camera Ray"], dim.inputs[0])
    dim.inputs[1].default_value = -emit
    lift = n.new("ShaderNodeMath")
    k.new(dim.outputs[0], lift.inputs[0])
    lift.inputs[1].default_value = emit
    k.new(lift.outputs[0], glow.inputs["Strength"])
    lit = n.new("ShaderNodeAddShader")
    k.new(paper.outputs[0], lit.inputs[0])
    k.new(glow.outputs[0], lit.inputs[1])
    cut = n.new("ShaderNodeMixShader")
    k.new(tex.outputs["Alpha"], cut.inputs[0])
    k.new(n.new("ShaderNodeBsdfTransparent").outputs[0], cut.inputs[1])
    k.new(lit.outputs[0], cut.inputs[2])
    k.new(cut.outputs[0], out.inputs["Surface"])
    node = n.new("ShaderNodeTexImage")
    node.image = target
    node.select = True
    n.active = node
    return m


mats = {}
mat_list = []


def mat_index(transl, emit):
    key = (round(transl, 3), round(emit, 3))
    if key not in mats:
        mats[key] = len(mat_list)
        mat_list.append(material(f"paper-{key}", transl, emit))
    return mats[key]


def build(name, panels, phantom):
    verts, faces, uvs, mat_ids = [], [], [], []
    for p in panels:
        o, u, v = (Vector(p[k]) for k in "ouv")
        u, v = u.normalized(), v.normalized()
        pts = [o, o + u * p["w"], o + u * p["w"] + v * p["h"], o + v * p["h"]]
        i = len(verts)
        verts.extend(to_blender(q) for q in pts)
        faces.append((i, i + 1, i + 2, i + 3))
        x, y, w, h = p["x"], p["y"], p["pw"], p["ph"]
        uvs.extend([(x / AW, 1 - (y + h) / AH), ((x + w) / AW, 1 - (y + h) / AH), ((x + w) / AW, 1 - y / AH), (x / AW, 1 - y / AH)])
        mat_ids.append(mat_index(p["transl"], p["emit"]))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for m in mat_list:
        mesh.materials.append(m)
    layer = mesh.uv_layers.new(name="UV")
    for li, uv in enumerate(uvs):
        layer.data[li].uv = uv
    for poly, mid in zip(mesh.polygons, mat_ids):
        poly.material_index = mid
    obj = bpy.data.objects.new(name, mesh)
    if phantom:
        obj.visible_shadow = False
        obj.visible_diffuse = False
        obj.visible_transmission = False
    scene.collection.objects.link(obj)
    return obj


# Panels that swap or ride a belt are lit but cast no shadow: their rest pose is not where they usually are.
# The far backdrop and its layers are the same: they stand in for things far away, so they never shade the scene
# (finish.py lights them evenly and works out the shadows they throw on each other itself).
BY_ID = {p["id"]: p for p in L["panels"]}
far = lambda p: bool(p.get("backdrop") or (p.get("decal") and BY_ID[p["decal"]].get("backdrop")))
is_phantom = lambda p: bool(p.get("show") or p.get("group") or far(p))
solid_panels = [p for p in L["panels"] if not is_phantom(p)]
phantom_panels = [p for p in L["panels"] if is_phantom(p)]
objs = [build("paper", solid_panels, False)]
if phantom_panels:
    objs.append(build("phantom", phantom_panels, True))
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]

sx, sy, sz = L["sunToLight"]
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = L["light"]["sun"]
sun.data.angle = 0.14
sun.data.color = (1.0, 0.96, 0.9)
direction = to_blender((sx, sy, sz), 1).normalized()
sun.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
scene.collection.objects.link(sun)
for i, lamp in enumerate(L["lamps"]):
    o = bpy.data.objects.new(f"lamp{i}", bpy.data.lights.new(f"lamp{i}", "POINT"))
    o.data.energy = lamp["energy"]
    o.data.color = lamp["color"]
    o.data.shadow_soft_size = 0.12
    o.location = to_blender(lamp["at"])
    scene.collection.objects.link(o)
world = bpy.data.worlds.new("sky")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (*L["light"]["skyColor"], 1)
world.node_tree.nodes["Background"].inputs[1].default_value = L["light"]["sky"]
scene.world = world

scene.render.bake.margin = 0
scene.render.bake.use_pass_direct = True
scene.render.bake.use_pass_indirect = True
scene.render.bake.use_pass_color = True
scene.render.bake.use_pass_diffuse = True
scene.render.bake.use_pass_transmission = True
scene.render.bake.use_pass_emit = False
scene.render.bake.use_pass_glossy = False
bpy.ops.object.bake(type="COMBINED", pass_filter={"DIRECT", "INDIRECT", "COLOR", "DIFFUSE", "TRANSMISSION"})
target.filepath_raw = os.path.join(WORK, "baked.exr")
target.file_format = "OPEN_EXR"
target.save()

import numpy as np

px = np.array(target.pixels[:], dtype=np.float32).reshape(BH, BW, 4)[::-1, :, :3]
np.save(os.path.join(WORK, "light.npy"), px)

