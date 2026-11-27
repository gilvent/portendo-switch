# Blibli: game design

How the Blibli stop is designed, in the order it was built: mechanics first, then dynamics in a greybox, then the paper look. The art standard (the Paper Diorama Checklist) applies in phase 3 only. Each phase ends with a gate; the next phase starts when every line of the gate holds.

## What the visitor should feel and learn

- **Feel:** a toy box. Everything he pokes answers at once, in its own way, and what he does in one place shows up in another.
- **Learn:** at Blibli, an Indonesian e-commerce, Alvaro built the two ends of a customer's journey: the **product detail page** (where a purchase starts) and **product reviews** (what the customer leaves behind for the next one).

The visitor plays the customer. Nothing is written out for him.

## Phase 1: mechanics

### Rules that hold everywhere

1. **One button.** A uses the thing in reach, or jumps when nothing is. B leaves. No new controls are added.
2. **No failing.** No score, timer, lock or wrong answer. Every toy works on its own, in any order, forever. His print and his review card, once made, are never taken away.
3. **Same-frame answer.** A press changes the state at once. Motion follows the state and can always be interrupted by the next press.
4. **One fact per toy.** What a toy does stands for one true thing about the work.
5. **Things remember.** A choice made at one toy shows up at others, across both spaces.
6. **The object does the acting.** He has three body moves (a dip, a hop, a lean); what tells the toys apart is how each object moves.

### Verbs

| Verb | Input | Rule |
|---|---|---|
| Walk | stick, arrows, tap | Free on the floor plan; solids block. |
| Use | A at a stop, or a tap on it | Advances that toy by one state. His move and the toy's motion start in the same frame. A stop may ask a hop of him (the price tag); it is still Use. |
| Jump | A with nothing in reach | Cosmetic only: what hangs over him swings, what is loose under him hops. Never changes a state. |
| Brush | walking past | Loose things hop, people answer with a tag, birds take off and come back. |
| Stand near | no input | Some paper works on presence alone: the door opens, the shelf deals itself out. Never saved. |
| Leave | B, twice | Unchanged. |

### Two spaces, one loop

The storeroom is retired. Reviews move outside, where customers leave them: on the shop's own front.

| Space | Stands for | The customer is |
|---|---|---|
| **Shopfront on the promenade** (outside) | Product reviews | reading others' reviews before going in; reviewing what he bought when he comes out |
| **Shop floor** (inside) | Product detail page | choosing and buying |

The loop, in one sentence: he reads the reviews on the shop window, goes in and picks a phone, and comes out to photograph it, rate it and see his own review join the wall.

The front is laid out in that order, left to right from where the train leaves him: the review wall with shoppers reading it, the door, the photo string in the other window, then the photo spot and the writing stand on the plaza.

### Toys

Each toy lists its states (kept in `game.toys`), his move, and the object's motion. "Fact" is the one thing it stands for; "also seen" is a second truth it happens to show.

**Shop floor: product detail**

| Toy | States | His move | The object | Fact |
|---|---|---|---|---|
| Showcase phone | colour 0, 1, 2, then 0 | dip | The phone turns over like a card and comes up in the next colour; its swatch chip rises. Every phone in both spaces follows. | Variant selection on product detail |
| Price tag | deal off, on, then off | hop | His head knocks the coupon reel hanging over him. A coupon flutters down and sticks to the tag; the old price is struck and the new one bursts out. The next press peels it off. | Promotions |
| Catalog stand | shut, leaf 1, 2, 3, then shut | lean | The folded catalog fans open on its stand, in the scene; each press turns one leaf over and the press after the last folds it shut. The first leaf follows the colour, the second the deal. | Secondary pages |
| Stock and basket | 0, 1, 2, 3 boxes, then 0 | hop | One press, one box: it leaves the stack in an arc and lands in the basket, which squashes. The press after the third tips them back onto the stack. | The one-step add to cart |
| Recommended shelf | set 0, 1, then 0 | lean | Product cards lie face down where the clerk is laying them out. When he comes to the shelf they turn over one by one, outward from where he stands. A slides in the next set, which turns over the same way. | Recommendations (also seen: they arrive as he gets to them, not all at once) |

**Shopfront: product reviews**

| Toy | States | His move | The object | Fact |
|---|---|---|---|---|
| Review wall | all, with photo, five stars, then all | lean | The tab strip over the wall turns; cards that do not match fold up against the wall in a wave, the rest hop. His own card obeys the same rule. | Filter reviews by photo or rating |
| Photo string | own shapes, squares, then own shapes | lean | Five prints and one empty peg, his, hang three over three in the window. A tug on the cord rolls a blind with six square windows down over them, or back up. | Gallery with grid and list views (also seen: photos vary in shape) |
| Instant camera | none, sideways, upright, upright with a new print sideways, then upright | dip | Flash, aimed at the phone on the unboxing table. The print slides out lying on its side. The next press turns it upright and it flies to his peg on the photo string beside him. Press again: a new print slides out sideways while the first stays on its peg; the press after that puts the new one in its place. | Photo upload (also seen: the photo that came out rotated) |
| Review card | 0, then 1 to 5 stars, then 1 | dip | The rubber stamp comes down on his card with a thump: one star a press. After five it starts again at one. | Writing a review |

**His own review**

| | Rule |
|---|---|
| His card on the wall | There once he has one star or an upright print. Until then its place is an empty pin. |
| "With photo" | Counts once he has an upright print (camera state upright or later). |
| His print on the string | On his peg once a print has been turned upright, and from then on. Until then the peg is empty. |
| Seeing it join the wall | The wall is out of sight from the photo spot. What he sees there is the print landing on the string. His card drops onto the wall, and the shoppers answer, the next time he comes within sight of the wall after it changed. This is not saved. |
| The camera's subject | The phone on the unboxing table, always there, in the colour chosen inside (blue until he chooses). |
| Nothing is undone | The camera never goes back to no upright print; the stars never go back to none. |

**Without a stamp**

| Thing | Input | What happens | Fact |
|---|---|---|---|
| Station trims | first use of each toy | A small header strip on that station turns from the old look to the new one. The door and the sign are new from the start. Paint cans stand by the writing stand until its trim turns. Nothing marks the last one. | Incremental release over big bang |
| Courier's scooter | follows the basket | Its rack carries as many parcels as the basket holds. | (journey glue) |
| Shoppers at the wall | follow the wall | They answer when the wall changes and when his card appears. | Potential customers browsing reviews |
| Shop door | presence | Opens as he comes; the bell over it swings. | (way in) |
| "Visit Blibli.com" | A | Opens the site. | (way out) |

### What remembers what

| Set at | Shows at |
|---|---|
| Colour (showcase) | boxes in the stack and basket, the catalog's first leaf, the phone on the unboxing table, his print |
| Deal (price tag) | the catalog's second leaf |
| Basket count | parcels on the scooter |
| Print (camera) | his card, the photo string, the "with photo" filter |
| Stars (review card) | his card on the wall, the "five stars" filter |
| First use of any toy | that station's trim |

### Arrival and links

| | |
|---|---|
| The train leaves him | at the review wall |
| `/work/blibli`, `/work/blibli/highlight` | the review wall |
| `/round/blibli-storeroom/...` | the review wall |
| Where the shop's stairs were | nothing: the shop is one floor inside |

### Engine changes this needs

- A toy may wrap to a state other than its first (`wrapTo`): the camera returns to "upright", the stars to one.
- A Blibli scene is given every world's toys (under `world/toy`) and which stops are stamped (`done:<stop>`), so a sheet outside can follow a choice made inside and a trim can follow its station.
- Pieces that move are actors a script poses (`toys/`); what depends on more than one toy (his card under a filter) is posed by script, not baked as a variant.
- A stop names his move (`gesture`), and he turns to face what he uses.

### Quad allowance

The limits the journey test enforces stay: 210 sheets on the shopfront. The shop floor's limit rises from 75 to 90 (the storeroom it absorbs ran at 115). Gate 2 records a count per toy from the greybox; phase 3 names the dressing that goes to pay for it.

Wall cards are one sheet each (they fold away rather than turn over). Parcels on the scooter are one cut card with three variants. A trim is one sheet with two variants.

### Left out on purpose

- The role note and the tech stack (checklist 7.1, 7.6). The route sheet still carries the description for anyone who wants text.
- High traffic and performance work; CSS techniques; datalayer, service worker and intersection observer; the name of the team; "offline business to online" (7.6, 7.8).
- Carrying things by hand. It needs a pick-up and put-down rule, a hero pose and a drop case for one small gain; the scooter carries the purchase instead.
- Anything timed or scored.

### Gate 1

- [x] Every fact in the source page has a toy, or is listed as left out.
- [x] No two toys share an object motion; his three moves are spread across them.
- [x] Every toy works alone, in any order, from a fresh deep link, and can be pressed without end; his print and card are never taken away.
- [x] The loop can be told in one sentence, and the front is laid out in its order.
- [x] The engine changes are listed, and a per-toy sheet count is due at Gate 2.
- [x] An independent read found no rule that contradicts another (see Review notes).

### Review notes

An independent read of the first draft found twelve problems and a second read of the rewrite found six more; all were taken. The ones that changed the design:

- The front ran against the loop: he met the camera before the shop. Reordered so the wall comes first and the photo spot after the door, and gave the camera a subject that is always there.
- His own card and print had no rules at fresh state or on wrap. Added "His own review"; the camera re-shoots and the stars restart at one, so nothing is undone.
- The wall and the string were the same toy twice. The string became a blind pulled by a cord over prints hung three over three.
- The redress of the whole place cost too much and read as a progress meter. Cut down to one trim per station.
- The shelf's beat fired once, unseen. It now deals itself out from where he stands every time, and "loaded" is not saved.
- The catalog left the scene for an overlay. It now fans open on its stand.
- Free jumps changed state in the first draft; now only Use does.
- Re-shooting took his photo away again. The camera got a fourth state so the first print stays on its peg while a new one is made.
- The loop's payoff fired out of sight. His card now joins the wall when he is next there to see it.

## Phase 2: dynamics

Built and tuned in a greybox: both spaces drawn straight from their scene data as plain boxes and cards (`art/grey.ts`), with every moving piece already the actor it will be when it has art. Nothing in this phase depends on how a thing looks.

### How a toy is made

- **The state is the game's.** A toy's number lives in `game.toys`; a press changes it in the reducer and nowhere else. So the route sheet, a deep link and a mashed button all end in the same place.
- **A toybox shows the state** (`toys/shop.ts`, `toys/front.ts`). Each toy is a view with two parts: `rest` stands its pieces where a state leaves them, and `play` builds the motion from one state to the next.
- **A press never waits.** If a toy is still moving when it is pressed again, its pieces are stood where that motion would have ended and the new motion starts from there.
- **Paper moves at 14 frames a second.** Motion is written as a smooth timeline and shown in whole frames, so an arc, a flip and a squash land on the same beats.
- **What works on presence** (the door, the shelf, the pigeons, his card joining the wall, lamps knocked by a jump) is watched every frame from where he stands, and is never saved.

### Feel, in numbers

| | |
|---|---|
| First answer to a press | within two frames: his move starts and the toy's state has changed (checked for all nine) |
| His moves | dip: squashes to 84%. Hop: 70ms crouch, 82 units up, so his head reaches 219. Lean: 12° toward the thing. He turns to face what he uses. |
| A knock | the reel is struck 200ms after the press, when his head gets there; nothing on the tag moves before that |
| Length of a toy's motion | 300 to 700ms; a wave across several pieces is staggered 70 to 100ms apart |
| Things hung to be knocked | lowest edge at 206, a head's reach below the top of his jump |
| Coming into reach | the toy stirs once (a bob, a swing, the cover lifting), so he sees what the A is for |
| Feedback beyond motion | paper scraps in the toy's colour, dust on landings, a flash for the camera, a 3-unit shake for the stamp, tags over the shoppers |
| Sound | eleven sounds made from filtered noise and sine blips (`sfx.ts`): tap, flip, thump, pop, flutter, rip, shutter, ding, slide, peel, whoosh. On from his first press; a button turns it off and the choice is kept. |
| Reduced motion | a toy steps straight to its new state: no flash, scraps, shake or tags |

### What playing it changed

| Found | Change |
|---|---|
| He stood in front of the basket; the box flew behind his head | He stands beside it, facing the stack, and the camera centres between them |
| Prompts and labels sat on top of the phone, the tag and the catalog | Each stop's marker hangs above its object |
| The colour changed a frame before the phone began to turn | The turn starts edge-on: the first half of the card flip takes no time |
| The reel and the right-hand lamp covered the shelf | The shelf moved right; the lamp moved over the way in from the door |
| His head did not visibly reach the reel or the lamps | Both hang lower (see the table) |
| A shopper stood in the doorway | Moved to the wall's side of it |
| His photo vanished from his card while a second print was out | The card shows it for both states |
| A new class name collided with the handheld's and threw the controller off a phone screen | Renamed; the phone check caught it |

### Sheets per toy (greybox, before any culling)

| Shop floor | | Shopfront | |
|---|---|---|---|
| Showcase | 11 | Review wall | 12 |
| Price tag | 10 | Photo string | 14 |
| Catalog | 14 | Camera and table | 22 |
| Stock and basket | 18 | Writing stand | 20 |
| Shelf | 15 | Door and bell | 5 |
| Lamps | 4 | Scooter, people, pigeons | 9 |

The shopfront's toys come to about 80 sheets in greybox. Baking removes hidden box faces and flattens prints into their parents, but phase 3 still has to bring the visible total to 210 by cutting toy sheets and naming the dressing that goes.

### Gate 2

- [x] All nine toys play in both spaces from a fresh link, in any order.
- [x] Every toy answers within two frames of the press.
- [x] A mashed toy ends exactly where slow presses leave it (compared pose for pose).
- [x] His print and card are never taken away, however often the camera and stamp are pressed.
- [x] What is chosen inside shows outside: colour, basket count, and his own review under each filter.
- [x] Presence works without a press: door, shelf, pigeons, a lamp knocked by a jump.
- [x] Reduced motion steps without motion, flash or paper bits.
- [x] The whole journey still runs: platform, train, wall, shop and back; phone and landscape; old links land on the wall.
- [ ] Every sheet answers a tap: holds in the train and the shop; the greybox shopfront is too bare under the tap grid to judge, so this carries into Gate 3.

These are the checks in `tests/journey.mjs` (24; 23 pass in greybox).

## Phase 3: aesthetics

*Filled in when Gate 2 holds.*
