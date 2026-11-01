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
scene.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL"
prefs.get_devices()
for d in prefs.devices:
    d.use = True
scene.cycles.samples = L["samples"]
scene.cycles.use_denoising = False
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 4
scene.cycles.transmission_bounces = 4
scene.cycles.transparent_max_bounces = 8
scene.view_settings.view_transform = "Standard"

albedo = bpy.data.images.load(os.path.join(WORK, "albedo.png"))
albedo.alpha_mode = "STRAIGHT"
target = bpy.data.images.new("bake", AW, AH, alpha=False, float_buffer=True)
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
    diff = n.new("ShaderNodeBsdfDiffuse")
    k.new(tex.outputs["Color"], diff.inputs["Color"])
    k.new(bump.outputs[0], diff.inputs["Normal"])
    tr = n.new("ShaderNodeBsdfTranslucent")
    k.new(tex.outputs["Color"], tr.inputs["Color"])
    paper = n.new("ShaderNodeMixShader")
    paper.inputs[0].default_value = transl
    k.new(diff.outputs[0], paper.inputs[1])
    k.new(tr.outputs[0], paper.inputs[2])
    glow = n.new("ShaderNodeEmission")
    k.new(tex.outputs["Color"], glow.inputs["Color"])
    glow.inputs["Strength"].default_value = emit
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
verts, faces, uvs, mat_ids, mat_list = [], [], [], [], []


def quad(pts, rect, transl, emit):
    key = (round(transl, 3), round(emit, 3))
    if key not in mats:
        mats[key] = len(mat_list)
        mat_list.append(material(f"paper-{key}", transl, emit))
    i = len(verts)
    verts.extend(pts)
    faces.append((i, i + 1, i + 2, i + 3))
    x, y, w, h = rect
    uvs.extend([(x / AW, 1 - (y + h) / AH), ((x + w) / AW, 1 - (y + h) / AH), ((x + w) / AW, 1 - y / AH), (x / AW, 1 - y / AH)])
    mat_ids.append(mats[key])


for p in L["panels"]:
    o, u, v = (Vector(p[k]) for k in "ouv")
    u, v = u.normalized(), v.normalized()
    a = o
    b = o + u * p["w"]
    c = b + v * p["h"]
    d = o + v * p["h"]
    quad([to_blender(q) for q in (a, b, c, d)], (p["x"], p["y"], p["pw"], p["ph"]), p["transl"], p["emit"])

mesh = bpy.data.meshes.new("hero")
mesh.from_pydata(verts, [], faces)
mesh.update()
for m in mat_list:
    mesh.materials.append(m)
layer = mesh.uv_layers.new(name="UV")
for li, uv in enumerate(uvs):
    layer.data[li].uv = uv
for poly, mid in zip(mesh.polygons, mat_ids):
    poly.material_index = mid
obj = bpy.data.objects.new("hero", mesh)
scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

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
scene.render.bake.use_pass_emit = True
scene.render.bake.use_pass_glossy = False
bpy.ops.object.bake(type="COMBINED", pass_filter={"DIRECT", "INDIRECT", "COLOR", "DIFFUSE", "TRANSMISSION", "EMIT"})
target.filepath_raw = os.path.join(WORK, "baked.exr")
target.file_format = "OPEN_EXR"
target.save()

import numpy as np

px = np.array(target.pixels[:], dtype=np.float32).reshape(AH, AW, 4)[::-1, :, :3]
np.save(os.path.join(WORK, "baked.npy"), px)

