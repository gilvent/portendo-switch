# Moperty: the hometown lane

The design record for the Moperty scene. It was made in three phases, in this order: **mechanics** (the rules), **dynamics** (the rules running in a grey box), **aesthetics** (the paper diorama, by the scene standard). Each phase closes with a review; a phase is ready when its review has nothing open.

## What the scene has to say

From `content.ts` and the live product (moperty.id):

| # | Fact | Source |
|---|---|---|
| F1 | Moperty lets people browse property around my hometown | description |
| F2 | A listing is for sale or for rent | the product |
| F3 | A listing has a detail page: what is inside the property | the product |
| F4 | It lists different kinds of property: land, houses, warehouses | the product's own title |
| F5 | Every listing lets you ask an agent | the product ("Ask") |
| F6 | I built the whole product myself, from the design to the front and the back | summary |
| F7 | I made it findable, and people came | summary (SEO) |
| F8 | It is a side project that still runs | role, the live site |

Nothing about the technology appears in the scene (scene standard 7.6), and nothing is written out (7.1).

## Phase 1: mechanics

### Pillars

1. **A toy, not a level.** No goal, score, timer or fail state. Every interaction can be repeated for ever and undone by doing it again.
2. **One object, one verb, one fact.** No two objects are used the same way (7.2).
3. **What you do stays done and is noticed.** A change at one object is seen by the rest of the lane: the people in it and the office window. This is the scene's signature and the one thing no other scene has.
4. **Paper does it.** Every motion is something a paper model could do: a hinge, a flap, a pop-up, a flip, a slide, in stepped frames.

### The fantasy

You are the one person who runs a small hometown lane of property. You put the homes on the market, and people come to look.

### Verbs

The scene adds no button. It uses the three inputs the game already has, and gives each one more thing to mean.

| Input | Already means | New in this scene |
|---|---|---|
| Stick | Walk | **Presence**: some paper answers him being there (the garden gate opens as he comes to it) |
| A at a stop | Use it | Five toys below, each its own verb |
| A away from a stop | Jump | **Bump**: a jump under something that hangs shakes it loose (the mango tree). **Thump**: landing shakes the small things around him |
| B | Leave | unchanged |
| Tap | Walk there and use | unchanged; a tap on the tree walks him under it and jumps |

### Objects

Left to right along the lane. Each toy is a counter that A steps round (`toys` in `game.ts`).

| Stop | Verb | States | What happens | Fact |
|---|---|---|---|---|
| Way out | walk through | | Back to the MRT | |
| **Road sign** (`post`) | raise | 0 down, 1 up | The fingerpost at the lane's mouth swings up on its hinge. While it is up, visitors walk into the lane (see Visitors). Lowering it sends them home | F7 |
| **Empty plot** (`build`) | build | 0 land, 1 plan, 2 front, 3 back and sides, 4 roof | A pop-up house rises one fold per press: the plan sheet unrolls on the ground, the front stands up, the back and sides stand up, the roof folds over. A fifth press folds it flat: it is a pop-up, and the plot is land again | F6, F4 |
| **Board** (`board`) | flip | 0 for sale, 1 for rent | The board in the house's yard turns over on its post, one face coral, one blue | F2 |
| **Front door** (`door`) | open | 0 shut, 1 open | The front of the house swings open like a doll's house and the rooms inside pop up: bed, bath, living room | F3 |
| **Agent's bell** (`ask`) | ring | 0 nobody, 1 to 3 the agent with a card | The bell hops. The agent pops up in the office window and holds up a picture card: land, a house, a warehouse, one per ring. The fourth ring sends him back down | F5, F4 |
| **Office door** | visit | | Opens moperty.id | F8 |

Not stops, so they carry no marker and no stamp:

| Thing | Trigger | States | What happens |
|---|---|---|---|
| **Garden gate** (`gate`) | presence | 0 shut, 1 open | Swings open while he is at it, shuts behind him |
| **Mango tree** (`mango`) | bump | 0 to 3 mangoes down | A jump under the tree drops a mango. The fourth jump: the hens have eaten them, and the ground is clear again |
| Hens, cat, washing, wheelbarrow, sand heap | brush, thump or tap | | Hop, with a puff of dust or a tag |

### Chain reactions

What makes it a lane and not six buttons. Every row is a rule the dynamics phase must show.

| When | Then |
|---|---|
| `post` goes up | Visitors start to arrive, the first within half a second |
| `post` goes down | Every visitor turns and walks out by the nearer end |
| A visitor reaches a listing | They stop, look and answer with a tag that depends on its state (table below) |
| A toy changes while a visitor is looking at it | That visitor hops and answers again at once, and stays a little longer |
| `door` is open | The house draws visitors before anything else |
| `build` reaches 4 | The hens scatter; the plot's card in the office window turns from land to house |
| `build` folds back to 0 | Dust; the card turns back to land |
| `board` flips | The house's card in the office window changes colour with it |
| `mango` wraps to 0 | The hens peck |
| He lands a jump | Small things within reach hop a little (thump) |

### Visitors

The people who browse (F1, F7). They are scenery that follows rules; nothing is won by them.

- Three visitors. They exist only while `post` is 1.
- **Spots.** Each listing has a viewing spot on the lane: `plot`, `house`, `office`.
- **Choosing.** A visitor goes to the spot with the highest score: appeal, minus 1 for each other visitor at or heading to it, minus 1.5 if they were just there.

  | Spot | Appeal |
  |---|---|
  | plot | 1 as land, 1.5 while it is going up, 2 when built |
  | house | 1.5 shut, 2.5 open |
  | office | 1 with nobody in, 2 with the agent up |

- **Looking.** On arrival they stop for 3 to 5 seconds and answer:

  | Spot | State | Tag |
  |---|---|---|
  | plot | land | ? |
  | plot | going up | … |
  | plot | built | ! |
  | house | shut | ? |
  | house | open | ♥ |
  | office | nobody in | … |
  | office | agent up | ♪ |

- **Moving on.** After three or four looks they leave by the nearer end, wait a few seconds out of sight and come back in the way they left.
- **Places.** Two can look at one listing, side by side; the rules never send a third.
- **Brushed** by the salaryman they hop and answer, like any passer-by.
- Under reduced motion nobody walks: while `post` is up, one visitor stands at each spot.

### What was left out, and why

| Idea | Why not |
|---|---|
| Carrying a key or a sign from one object to another | Order dependencies turn a toy into a task (7.5) |
| A phone or map that filters listings | Literal, and already ruled out (7.3, 7.5) |
| "Sold" stickers, prices, counts | Not in the source; never print what `content.ts` does not state |
| Labels for design, front end, back end, SEO | Technology (7.6). The build order (plan, front, back) is left for those who see it |
| Installing the app (PWA) | Technology |
| A written summary letter and a tech-stack letter | 7.1, 7.6. The world keeps its `description` for the route sheet |

### Review 1 (rules on paper)

| Check | Result |
|---|---|
| Each fact F1 to F8 has a place | F1 the lane and its visitors; F2 board; F3 door; F4 plot, agent's cards; F5 bell; F6 plot; F7 road sign; F8 office door |
| 7.2 no two stops share a verb | raise, build, flip, open, ring, visit |
| 7.5 not gamified | No goal or score; visitors are scenery. The stamp card is the game's own |
| Every toy reversible | All cyclic |
| No order dependency | Each toy works from a cold start; chain reactions only add |
| Reduced motion | Every state is a still pose; visitors stand |
| Deep links | Every stop has `/round/moperty/<stop>` |
| First ten seconds | He arrives at the road sign: the first A fills the lane with people |

### Review 2 (rules in simulation)

`node tests/rules.ts` steps the reducer and the crowd without a page: 19 checks, one for every rule above that does not need paper to show it. It found one fault in the first draft (a visitor could take a place another still held) and one in the layout (a viewing spot in front of the road sign); both are fixed.

Pacing, measured over three minutes of simulated lane with the sign up:

| Measure | First draft | Tuned |
|---|---|---|
| Visitors on screen, average | 2.3 | 2.6 |
| Visitors looking at a listing, average | 0.9 | 1.3 |
| Lane empty | 1.1% of the time, 2.0s at most | 0.8%, 1.4s |
| First visitor walks in | 0.35s | 0.35s |
| First look | 5.9s | 4.7s |
| Share of looks at the house, shut then open | 34% then 45% | 35% then 43% |

The first draft walked too much and looked too little, and looking is where the reactions are. Walking speed went up by a quarter, the lane's ends came in, looks grew by half a second and each visit by one listing.

**Phase 1 is ready.** Open for the dynamics phase to answer by play, not on paper: whether five presses to build feels like a build or like a chore; whether visitors in the foreground get in the way of what is being used; whether the office window's cards are noticed at all.
