# Game design: mechanics, dynamics, aesthetics

The whole game, read through the MDA framework (Hunicke, LeBlanc and Zubek). A designer builds from the bottom up:
**mechanics** are the rules and parts, **dynamics** are what those rules do once a player is running them, and
**aesthetics** are what the player then feels. A player meets them the other way round, feeling first. So the game is
built in the first order and judged in the second.

Aesthetics here means the player's experience, not the look. The look has its own standard (`ART_BIBLE.md` and the
Paper Diorama Checklist) and is applied to a scene only after its play holds.

Each scene has its own sheet in the same three layers. The first is `MRT_DESIGN.md`.

## What it is for

| Aesthetic | Aim | In this game |
|---|---|---|
| **Discovery** (the game as uncharted territory) | first | Whose site is this, what has he made, and what does that thing do if I poke it? |
| **Sensation** (the game as sense-pleasure) | first | Every answer is felt: seen to move like paper, heard, and on a phone buzzed. |
| **Challenge** (the game as obstacle course) | as little as possible | Only working out how to play, once, in the first half minute. Nothing after that can be failed, timed or lost. |

The other five (fantasy, narrative, fellowship, expression, submission) are not aimed at. A rule that would buy one of
them at the cost of Discovery or Sensation, or by adding Challenge, is left out.

## Mechanics

**The space.** Worlds on a train line. Each world is a small place with a floor to walk. The MRT car is the hub; its
doors open onto the others.

**Things in a world, by how they are found.**

| Kind | Marked? | Rule | Recorded as |
|---|---|---|---|
| **Stop** | A pennant hangs on it; A is prompted in reach | A does the one thing that stop does: turn a toy to its next state, open a card, go through a door | A stamp, the first time (doors are not stamps) |
| **Find** | Nothing points at it | Set off by doing the natural thing to it: walking into it, jumping under it, landing on it, a finger | A star, the first time |
| **Touchable** | Nothing points at it | Hops or speaks when brushed | Not recorded |

**Verbs.** Walk (stick, arrows, or tap a spot). Use (A at a stop). Jump (A anywhere else). Back (B). Tap (any
paper answers a finger). Map (X: the route sheet, which goes anywhere without walking).

**The pass.** One card, top left. It counts stamps for the whole game, and for the place he is in it shows a dot for
each stop and a star for each find, filled or empty. It never names what is missing. When a star is found a tag names
it for a moment.

**Feedback parts.** Every answer is built from the same few: paper scraps, dust, a spoken tag, a hop, a synthesised
sound (`sfx.ts`), a buzz in the hand for the hard ones, and a knock of the camera for the heavy ones. The controller on
the screen goes down when its key does.

**Rules that exist to remove Challenge.**

- Nothing can be failed, and nothing is timed.
- A always answers: if there is nothing to use, he jumps.
- Reach is generous: a stop is in reach from in front of the thing itself, and a jump under a rail finds the nearest strap.
- B asks before it leaves a place.
- The route sheet reaches every stop without walking, and every stop has an address.
- Reduced motion keeps every rule and drops only the movement.

## Dynamics

What these rules do when someone plays.

- **The poke loop.** See a thing, go to it, do something to it, get an answer, look for the next. Stops start the
  loop because they are marked. Finds keep it going because the first accidental one (the shut gate) teaches that
  unmarked things answer too.
- **Dots and stars.** The pass shows how many, never which. A filled dot beside three empty stars turns "I have
  used everything" into "what else is in here?" This is the game's whole pull, and it needs no score.
- **Two speeds through the same place.** Holding right and pressing A when prompted reaches the first project in
  a handful of presses: the floor for a visitor in a hurry. Wandering finds the rest. Neither path blocks the other,
  and the route sheet is a third for someone who will not walk at all.
- **One cause, many effects.** Where a place has a force of its own (the train's acceleration, the platform's wind),
  every loose thing reads it, so one event answers in a dozen places at once.
- **Seeing your own hands.** Because the on-screen controller moves with the keyboard, a new player learns which key
  is which button by pressing it, without reading.

## Aesthetics

How the dynamics become the three feelings, and what is tuned to keep them there.

| Feeling | Comes from | Tuned by | Held by |
|---|---|---|---|
| Discovery | The poke loop; dots and stars; a new place opening like a card; a stop that shows more each time it is used | How many finds a place has and how natural the act that sets each off; what a first-time player is thrown toward | Journey checks that each find fires and is counted once |
| Sensation | Every answer in the same frame; physics that carry on after the input; sound, buzz and camera knock scaled to how hard the thing was hit | `sim.ts` (forces), `sfx.ts` (sounds and buzzes), the stepped redraw | Journey checks that read the physics; the ear |
| Challenge, kept small | Four things to work out, each with a hint already on screen (see a scene's sheet for its list) | Hints, reach, and what A does with nothing to use | A blind first-time playthrough reaching the first project |

**The test of a new rule.** Does it make something to find, or make an answer felt? If neither, it is not for this
game. Does a first-time player have to work it out? If so it needs a hint on screen and a place in a scene's short list,
or it goes.
