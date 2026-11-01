# Blibli Papercraft Art Bible

Target: a photographed miniature paper diorama. Every surface must be something you could cut from a real sheet. Depth, density and composition may learn from Paper Mario; all art stays original, with no Nintendo assets.

![Hero in the review stage](hero/final.png)

## Paper stocks

| Stock | Weight, feel | Core (cut edge) | Light through | Used for |
|---|---|---|---|---|
| Cover | 220gsm coated, smooth | White core shows at cuts | 8% | Printed objects: mailbox, signs, awnings, shop fronts, roofs |
| Kraft | 300gsm unbleached, faint flutes | Pale tan, zigzag rib on open edges | 4% | Parcels, cartons, anything shipped |
| Greyboard | 1.5mm chipboard, matte | Solid grey | 0% | Structure: posts, feet, stair stringers, belt frames, shelves |
| Bond | 120gsm uncoated | White | 30% | Labels, letters, receipts, tissue, catalog pages |
| Vellum | 60gsm tracing | Cream | 62% | Tape, windows, lamp shades, phone screens |
| Sugar | 160gsm dyed through, soft tooth | Same colour as face, never white | 16% | Foliage, grass, ground, simple single-piece objects |

White cut edges appear only on stocks with a white core. Sugar paper with a white outline reads as a sticker.

## Palette per space

Each space uses its base colours plus at most two accents. All values come from the existing art.

| Space | Base | Accents | Neutral |
|---|---|---|---|
| Street | Sky `#8fd3f4`, grass `#7fbf6a`, foliage `#3f9a5b` | Blibli blue `#0092da`, coral `#e8552d` | Cream `#fff4e2`, kraft `#b98450` |
| First-floor outlet | Brick `#d9a968`, planks `#c58c4d` | Blibli blue `#0092da`, sun `#f6b73c` | Cream `#fff4e2`, ink `#1d2228` |
| Second-floor store-room | Plank `#8f6f55`, concrete `#8b8275` | Coral `#e8552d`, mint `#35b58a` | Kraft `#b98450`, steel `#3d444e` |

Tech colours from `content.ts` appear only as small label bars.

## Edges and creases

- **Cut edge:** a 0.5-unit line of core colour inside the die line, on free pieces.
- **Fold:** a broken 1.1-unit crease line at 60% opacity. It must wobble and never read as a stroke.
- **Open corrugated edge:** a zigzag rib strip.
- **Glue:** carton joints are visible as an overlapping strip on the side wall. Foot tabs stay visible and pressed to the ground.

## Print style

- Flat ink only, in one or two colours per panel, with Fredoka for type.
- No printed gradients, printed shadows or printed highlights. Light is real or it is absent.
- Print detail is limited to what a real printer would put on the object: labels, handling arrows, bars, panel lines.
- Bars and arrows are decoration. Never print a number, tracking code, rating or result that `content.ts` does not state.

## Imperfection limits

- Labels: at most 1.2° off square.
- Stacked parcels: at most 9° yaw.
- Scuffs: at most two per face, at most 20% opacity, and only on kraft.
- Lifted flaps: 22–44°, and only where a story reason exists (the opened top parcel, the mail slot).
- No tears, stains or crumpling on anything carrying text.

## Light

One sun, defined once as `SUN_TO_LIGHT = [-.62, 1, 1]` in `src/light.ts`: upper left, in front of the scene. Ground shadows fall right and back by 0.62 and 1 per unit of height. Top and front faces are brightest, left faces are next, and right faces sit in ambient light and bounce. Blender bakes from this vector, so static objects and moving objects cannot disagree.

Sun colour is warm (1, .96, .9) with a 8° soft edge. Sky fill is cool, at strength .62.

## Composition

Detail follows where the courier can walk. References are in `refs/`, for depth, density and composition only. They are never traced, and `docs/` is never shipped.

### Outdoors: walkable detail, flat background

| Tier | Where | Build | Detail |
|---|---|---|---|
| Walkable | Objects on or beside the path | Full folded forms: thickness, hinges, layers | Highest: the hero's level |
| Near edge | Plants and fences at the path border | Standing die-cut cards with a tab | Medium: printed, with a cut silhouette |
| Background | Behind the walkable strip | Flat cards stacked in overlapping rows | Low: one flat print per card, with no folds |
| Sky | Behind everything | One printed sheet | Lowest |

- The walkable ground is a sheet with a die-cut edge. It does not run off as an endless plane.
- Background rows get lighter and bluer with distance, using print colour rather than a fog effect.
- Background cards stay single quads, which leaves the quad budget for the walkable tier.

### Indoors: the diorama is the room

- The room is the object: floor, three walls and a ceiling that matches the building outside, with the near wall removed. Its cut outline sits against a black void.
- The floor stays mostly open and walkable. Props hug the walls and corners, with one or two pieces standing out on the floor.
- Density goes on the walls: shelves, hanging items, windows and stacked goods.
- Wall and floor surfaces are printed brick and plank, with depth from the room's fold lines.
- Windows are vellum panels that glow. Their light pools softly on the floor, and lamps add warm pools. The room's edges fall off into dark.

Indoor light keeps the `light.ts` sun as the key, entering through the removed near wall. Window and lamp light are secondary sources baked in Blender, so they never change the direction of object shadows.

### Outside and inside match

A room diorama is the building seen from the street, cut open. Every room's outline must match the exterior that holds it.

- The Blibli shop is a two-storey building with a gabled roof.
- The first-floor outlet is a rectangular room with a flat ceiling, because the second floor sits on it.
- The second-floor store-room is gabled, because it sits directly under that roof.
- The exterior is about 500 units tall so the whole roof stays in frame on the street camera. Rooms are drawn larger than the exterior scale, like any cutaway model.

## Pipeline

`npm run paper` rebuilds all three spaces. `npm run paper -- street 64` rebuilds one quickly at low samples.

1. `src/art/kit.ts` holds the parts: panels, boxes, hinges, tabs, slots, layered decals and relief. `src/art/recipes.ts` turns data into objects and print layers. `src/art/scenes/` holds the three spaces as data.
2. Chrome renders each panel's stock, print, grain and edges into an albedo atlas.
3. Blender Cycles bakes direct light, bounce, translucency, lamps and window glow.
4. `finish.py` flattens decals and relief into their parents, culls faces no game camera can see, and writes the atlas, backdrop and manifest.
5. `PaperScene` in `src/art/fold.tsx` renders the manifest as `matrix3d` quads.

No AI image or 3D tool was used. All geometry is planar and generated from data.

## Performance budget

Measured on the worst case: software GPU, 4x CPU throttle, DPR 2.625, landscape.

- Textured layers cost far more than flat colour ones. Up to about 120 flat faces ran at 60fps, while 59 textured quads did not.
- The hard limit on the street is total fill, not quad count alone. Removing any one large layer recovered 60fps, while removing 11 small quads did nothing.
- Use relief for anything against a wall: real depth in Blender, no quad in the browser.
- Mark sheets with no cut-outs as opaque so the browser skips blending them.
- Anything far away and flat belongs in the CSS backdrop.

| Space | Quad limit, enforced by the journey test | Current |
|---|---|---|
| Street | 95 | 66 |
| First-floor outlet | 40 | 27 |
| Second-floor store-room | 75 | 49 |

## Motion

Paper moves in five stepped frames over .42s, never smoothly. Conveyor parcels advance in 60 steps per run. Under reduced motion, hinges jump straight to their end pose and belts stop.

| Stop | What moves |
|---|---|
| Mailbox | Slot flap lifts, letter slides out, flag tips |
| Delivery boxes | Top parcel flap opens |
| Enter the store | Both door leaves swing inward |
| Product catalog | Tablet tilts up |
| Computer desk | Monitor tilts up |
