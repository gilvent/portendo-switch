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
| Riverside promenade (street) | Sky `#8fd3f4`, brick paving `#dba38b`, river `#4fa9d6`, palm `#3f9a5b` | Blibli blue `#0092da`, coral `#e8552d` | Cream `#fff4e2`, kraft `#b98450` |
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

### 0. Setting

The Blibli street is a walkable riverside shopping promenade: a brick plaza closed by shops on the left, right and back, the Blibli shop as its anchor, and the river seen through a pergola gate at the back left, with boats on it and the far bank beyond. Every object must belong to that place: stalls, kiosks, palms, planters, café tables, flags, festoon lights, shoppers. Nothing is added only to fill space (no balloons, no mountains).

Every space follows one scene standard. It is not limited to shoeboxes: a space can be a room box, a street on a curved ring, or any other diorama shape the game needs.

### 1. Technique by role and distance

Split each space into the **main space**, where the courier walks and plays, and the **surroundings** that frame it. Judge each part of the surroundings from inside the main space: it is **open** if the eye travels far into it, and **enclosed** if something tall and close hems the space in. Which surface it sits on does not matter.

| Part | Build | In the Blibli spaces |
|---|---|---|
| Main space | Freestanding folds with real volume: boxes, tubes, ridge folds, slotted pairs, stacked contours. Slim or intricate outlines (people, bikes, scooters) are stand-up cut cards. The ground is flat sheets at slightly different heights. | Mailbox, parcels, bench, sandwich board, bins, lamps; showcase pedestal, tri-fold leaflet, price stand, basket, riser; reviewer's desk, camera, belts |
| Open surroundings | A shadow box: many thin cut layers stood well apart, one behind another, alternating pale and deep and paler with distance, each throwing its shadow and sky occlusion on the next. Things that sit in the view (boats, a bridge, trees) stand *between* layers, never printed on one. Layers whose position must match the scene's parallax are real layers flattened onto a card in the 3D scene (`riverView` in `promenade.ts`); layers far enough to stay put go in the CSS backdrop. Far detail is tiny flat print. Only what belongs to the place. | Through the gate, card one just behind the railing: five cut water bands with a two-layer tour boat riding between them. Card two further back, the far bank: lapping water, the quay wall with lamps, a footbridge, waterfront shops and cafés with awnings, a tree row with palms, a middle row of flats; the city rows in the backdrop rise behind it. In the CSS backdrop: the city's haze, far and middle rows and two layers of cut clouds stood off the sky, with gulls printed small. The street is also seen through every window |
| Enclosed surroundings | Bounding facades on every side the eye is stopped, built flat and dressed in relief fixed to their surface, sticking out toward the main space: half pieces on walls, hanging pieces on ceilings, low edges on floors. Anything with depth is **carved** relief (`carved` in `kit.ts`): real volume, painted onto the wall as the game camera sees it, so shelf lips, box ends and tops all show | The promenade's white waterfront building (souvenir stall, scarves, boat-tour office, balcony, window boxes), red café (striped awnings, shutters, menu board, planters) and boutique; window boxes, lanterns and a blade sign on the Blibli shop; pegboard, shelves, clock and frame on the shop walls; steel racking stocked with cartons, totes, crates, binders and rolls on the store-room side walls; high shelves under the roof slopes |

- Shadow-box layers stand deep, like card on thick foam spacers: 30–60 units between neighbours. The sun is in front, so a layer's shadow mostly hides behind it and only the sideways part shows, 0.62 of the gap; shallower gaps leave it a hairline and the view reads flat.
- Layered shadow-box work (flat cards stacked a little apart, flattened along the surface's normal by `relief`) is only for flat objects (posters, boards, frames, cards) and for open distant views. Never use it for objects with depth on a wall indoors, above all on side walls, where the camera sees them edge-on and they collapse into flat strips.
- One surface can be partly both: enclosure in front, the open view through its gaps. The alleys between the shops show the skyline; the windows show the street.
- The front edge frames the opening: the kerb, the road and its lamps outside; boxes and a plant indoors.
- Each kind of object has one design, used flat, in relief or freestanding.

### 2. Variants

- One base design per object type, varied by size, proportion, repeated parts (storeys, tiers), pose and small add-ons. The facades share one frame and one set of relief parts (`fawning`, `fbalcony`, `fflowers`, `fblade`, `flamp`); shoppers are one figure varied by build (trousers, shorts, dress, child), hat, backpack and what they carry.
- Freestanding objects in open space are folded volumes with cut pieces glued on, the way a paper fox is a tent-folded body with a cut head and tail, or a pine is two slotted cards. Detail is carried by glued pieces in lighter and darker tones of the object's own colour, never by outlines. The courier's scooter is a folded floorboard and skirt, a tent-folded cowl with the seat, stripe and tail lamp glued on, a leg shield carrying the handlebar, headlamp and a pale shine, a folded cargo box, and wheels with a pale rim and hub glued on. The bicycle is spoked ring wheels with a sugar-paper frame standing proud of them, saddle, grip and chainring glued on, and a folded kraft basket. Pigeons on the pavement are tent-folded with wing, neck sheen, eye and beak glued on. Bushes are a scalloped sheet with a darker and a paler cluster glued a little proud of it. Café chairs are a cut back with its legs folded into the seat, slats glued on paler.
- Flat cut cards are right only where the object is plane-shaped (a wheel, a sign, a flag, a table top), stands against a surface or structure (a bench under a window, birds on a roof ridge), or is flat on purpose (people, cut as two layers with the arm and bag proud of the figure). Their detail is carried by colour tones.
- Other freestanding objects carry the same structure: a palm is a ringed trunk and fans of broad cut fronds at different headings and droops; a shade tree is a forked trunk under scalloped leaf clusters layered at different depths and greens; a person is a figure plus an arm-and-bag layer standing proud of it.
- Colours come from a narrow family per type. Phones use the three variant colours wherever they appear.
- Group in small clusters (a bench with a bike, a family of shoppers), not on an even grid, except where the subject is regular (shelves, belts), and then break it a little.

### 3. Realism

- Arrange it like a real place: everything rests on something, bases are hidden or anchored, and things sit where they would really be (hydrant at the kerb, scooter on the road, the clock on the wall).
- Show life and small stories: shoppers with bags, a delivery parked outside, a card on the review board still in the old theme with the paint cans beside it.
- Build from big to small: surroundings and ground, then main subjects, then props, then details that fill gaps.
- Make it obviously paper: grain, cut edges, creases; never photographic.

### The projects are played, not read

Neither floor carries a written account of the work. Each part of the work is an object you use. `encoded` in `content.ts` lists which stop acts out each fact.

| Stop | What you do | What it stands for |
|---|---|---|
| Showcase phone | A turns the phone through its three colours; the matching swatch chip pops up | Product detail: variant selection |
| Catalog paper | Opens the tri-fold leaflet: Specs, Promo, Shipping, Discussion and Description leaves, showing the colour you chose | Secondary pages for the mobile page |
| Price tag | A sticks the deal on: the price is struck through, a burst appears, the coupon is torn off | Promotions |
| Basket | Each A drops one boxed phone in; the fourth empties it | The simpler one-step add to cart |
| Recommended shelf | Grey placeholders fold away as you arrive; A turns to the next set | Recommendations, lazy loading |
| Instant camera | A prints the photo sideways; A again sets it upright on the review card | Photo upload, and the EXIF rotation bug |
| Review card | Each A adds a star | Writing a review as a reviewer |
| Photo gallery | A switches between a grid of square crops and a list of photos at their own shapes | Gallery with grid and list views; photos vary in ratio |
| Review board | Paper tabs filter it: all, with photo, five stars | Filter by photo or rating |
| Old-theme card and paint cans | Dressing | The redesign rolled out piece by piece |

Stops carry `focus` and `look`: the camera leans in on the object being used while the courier stands beside it, not in front of it.

### Outside and inside match

A room diorama is the building seen from the street, cut open. Every room's outline must match the exterior that holds it.

- The Blibli shop is a two-storey building with a gabled roof.
- The first-floor outlet is a rectangular room with a flat ceiling, because the second floor sits on it.
- The second-floor store-room is gabled, because it sits directly under that roof.
- Stairs go the way the floor goes. In the outlet they climb; in the store-room, the top floor, they go **down**: a notch in the front left of the floor, a balustrade on its open side, the wall handrail falling with the flight, and the cut floor slab showing the treads dropping toward the shop.
- The exterior is about 500 units tall so the whole roof stays in frame on the street camera. Rooms are drawn larger than the exterior scale, like any cutaway model.

## Pipeline

`npm run paper` rebuilds all three spaces. `npm run paper -- street 64` rebuilds one quickly at low samples. `PAPER_PREVIEW=1 npm run paper -- street` skips Blender and lights everything evenly, for laying a scene out in under a minute; never ship it. Set `BLENDER` and `CHROME` to the binaries when they are not in the macOS default locations, and `CYCLES_DEVICE=NONE` to bake on the CPU.

1. `src/art/kit.ts` holds the parts: panels, boxes, hinges, tabs, slots, layered decals and relief. `src/art/recipes.ts` turns data into objects and print layers. `src/art/scenes/` holds the three spaces as data.
2. Chrome renders each panel's stock, print, grain and edges into an albedo atlas.
3. Blender Cycles bakes light only, at half the atlas size (`LIGHT_SCALE`): each surface sees itself as white while bounce rays still take on the colours around it. Light is smooth by nature, so a low sample count is enough once `finish.py` smooths it within each panel.
4. `finish.py` multiplies the crisp print back over the light, lights the far backdrop evenly (nothing near can shade it) apart from the shadows its own cut layers throw on each other, worked out from `SUN_TO_LIGHT`, the sun's soft edge and each layer's gap, flattens decals and flat relief into their parents along the parent's normal, paints carved relief onto its wall along the game camera's rays (nearest piece wins), culls faces no game camera can see, and writes the atlas, backdrop and manifest. Far layers are packed last and cropped off the shipped atlas, so the backdrop can be cut at high resolution for free.
5. `PaperScene` in `src/art/fold.tsx` renders the manifest as `matrix3d` quads.

No AI image or 3D tool was used. All geometry is planar and generated from data.

## Performance budget

Measured on the worst case: software GPU, 4x CPU throttle, DPR 2.625, landscape.

- Textured layers cost far more than flat colour ones. Up to about 120 flat faces ran at 60fps, while 59 textured quads did not.
- The hard limit on the street is total fill, not quad count alone. Removing any one large layer recovered 60fps, while removing 11 small quads did nothing.
- Use relief for anything against a wall: real depth in Blender, no quad in the browser. Carved relief costs nothing extra in the browser either.
- Mark sheets with no cut-outs as opaque so the browser skips blending them.
- Anything far away and flat belongs in the CSS backdrop. Open views that must keep parallax are built as layers and flattened onto one or two cards: the river view's 14 layers ship as four quads.
- Texture area costs as much as quad count: every quad is rasterised at its own texel size times the device pixel ratio. A scene sets `density` for panels that set none (the street uses 2.1), ghost faces pack at .35, and carved pieces are cut no finer than their wall.
- Measured with `tests/perf.mjs` (software GPU, 4x CPU throttle, DPR 2.625) in a cloud container slower than the original machine: the old 112-quad street walked at 27.8fps there; the 200-quad promenade walks at about 17–21fps depending on texture density. With the river view rebuilt as a layered shadow box (198 quads; 192 once the sailboat, yachts and front bench were removed; 209 with the folded scooter, bicycle, pigeons and café chairs, which walked at 18.3fps), the same run measured 17.5fps against 16.6fps for the 200-quad version just before it. Re-measure on the reference machine before trusting the 60fps target.

| Space | Quad limit, enforced by the journey test |
|---|---|
| Street (riverside promenade) | 210 (uses 209) |
| First-floor outlet | 75 |
| Second-floor store-room | 115 |

Panels that swap with a toy (`show`) or ride a belt (`group`) are baked as phantoms: lit, but casting no shadow, so variants sharing a spot never shade each other and a belt box leaves no shadow where it no longer is. Hidden variants are not in the page, so they cost nothing.

## Motion

Paper moves in five stepped frames over .42s, never smoothly. Conveyor parcels advance in 60 steps per run. Under reduced motion, hinges jump straight to their end pose and belts stop.

| Stop | What moves |
|---|---|
| Mailbox | Slot flap lifts, letter slides out, flag tips |
| Delivery boxes | Top parcel flap opens |
| Enter the store | Both door leaves swing inward |
| Showcase phone | The chosen swatch chip rises |
| Recommended shelf | Placeholder cards fold down |
| Review board | The chosen filter tab rises |
| Any toy | A piece that appears drops into place in five stepped frames |
