# The MRT: game design

The commute that opens the site: the platform on the handheld's screen, boarding (which docks the console), and the
inside of the MRT car on the big screen. It was rebuilt in three passes, in this order, and each pass had to hold
before the next began:

1. **Mechanics**: the rules. What the player can do, what each thing does back, and the systems underneath.
2. **Dynamics**: the rules running. A greybox with no art (`?graybox`), tuned until the play itself is fun.
3. **Aesthetics**: the paper. The look is applied last, by the Paper Diorama Checklist and `ART_BIBLE.md`.

The art bible says how things look. This file says how they play.

## Pillars

- **Everything answers.** If the player can reach it, bump it, jump into it or tap it, it does something, in the same
  frame, the way that thing would if it were made of paper.
- **One button, many answers.** A is "use". No two things answer it the same way, and each answer carries one fact
  about whose site this is. Nothing is explained in a panel of text.
- **The commute is the tutorial.** Walk, use, jump and back are each needed once, in that order, before the first
  project. No instruction is ever given that the scene does not also give.
- **One force, many toys.** The train's acceleration is a single number. Every loose thing in the car reads it. The
  player never controls it directly, only by riding, so the car feels alive without a second system to learn.
- **Not a game inside the game.** No score, no timer, no fail state. Interactions are small (checklist 7.5).

## Verbs

| Verb | Input | Rule |
|---|---|---|
| Walk | stick, arrows, tap a spot | Handheld: along the platform. Docked: on the car floor, eased, with a dead stop at a thing to use. |
| Use | A, Enter, tap the thing | Acts on the nearest thing in reach. Its marker shows it; the prompt shows when A will work. |
| Jump | A with nothing in reach | Both screens. His head **bonks** anything hanging in its path. In the car a jump is also affected by the train: brake while he is in the air and the floor moves under him. |
| Back | B, Esc | Puts down what is open. At the doors it turns the destination. With nothing open it asks, then leaves. |
| Bump | walking into things | Loose things are pushed; standing things and people answer. |
| Tap | pointer on any paper | Whatever is under the finger answers, wherever he stands. |

## Systems

**The train** (`src/mrt/sim.ts`). One state: speed `v` (0 to 1) and acceleration `a`. It pulls away when the car
opens, cruises with small notches of power and brake a few seconds apart, brakes to a stand when a stop is asked for,
and gives one last lurch as it stops. Everything that says "moving" (tunnel, sleepers, wheels, sway) plays at `v`.
Everything loose is pushed by `-a`.

**Pendulums.** Anything that hangs is a damped pendulum with its own length and damping, so no two swing in step:
the car's hand straps and the help point's handset; the platform's hanging signs. They are driven by the train's `-a`,
by a bonk from his head, by the wind of a train arriving, and by a tap.

**Rollers.** The drinks can on the car floor rolls freely along the car and hardly at all across it. It is kicked by
his feet, pushed by `-a`, knocks back off the end walls, and is flattened when he lands on it (it springs back).

**Him.** The same `-a` leans him and slides his feet a little on a hard brake or a start. In the air he keeps his own
speed while the car changes its speed under him.

**Sound** (`src/sfx.ts`). Every answer has a short synthesised sound of its own. One button mutes all of it.

Under reduced motion nothing swings, rolls, slides or blows: every toy steps straight to its end state.

## The platform (handheld)

A one-way funnel of about twenty seconds, each beat gated by the one before.

| Beat | Thing | A does | Also answers | Teaches / tells |
|---|---|---|---|---|
| 1 | Stairs | (he arrives down them) | | Walk |
| 2 | **Ticket gate** | Taps his pass: the reader turns green, the paddles drop, the pass pops up, the train is called | Walking into it shut: the paddles rattle, the reader buzzes | Use. The pass is his name and his trade |
| 3 | **Line map** | Turns the lamp to the other line: its stops light one after another, and the departure board and the train's own sign take that destination | | What is on the site: a Work line and a Side projects line |
| 3 | Bench sleeper | | Walking past: "z". A jump beside him: he starts awake | |
| 3 | Platform sign | | A jump under it: his head bonks it and it swings | Jump |
| 3 | The train arriving | | Its wind swings every hanging sign, leans him, and blows scraps along the platform | |
| 4 | **Train door** | Boards: he steps in, the doors shut, the train pulls out, the console goes to the dock | | Boarding is docking |

The departure board always says the next thing to do. The gate cannot be passed shut, and the door cannot be used
until the train stands.

## The car (docked)

The hub. He comes in through the door he boarded by as the train pulls away, and the pull-away shoves him and
everything loose toward the back.

| Thing | A does | Also answers | Tells |
|---|---|---|---|
| **Doors** | Asks for the stop on the sign: chime, brake, the station slides up to the windows, the doors open, he walks out | B turns the sign | Where the projects are |
| **Line map** | Turns the sign to the other stop: the map's lamp runs to it | The sign's arrows, for a pointer | The same two lines as the platform |
| **Poster roll** | Winds the roll on one poster: three in all | | Who he is and what he does |
| **Help point** | Lifts the handset and opens the contact card | The handset swings on its cord with the train | How to reach him |
| Hand straps | | A jump bonks them; the train swings all of them | |
| Drinks can | | Kicked, rolled by the train, flattened by a landing | |
| Passengers | | Each answers a bump in their own way; all of them jolt when the train stops | |
| Suitcase, bag | | Hop when bumped | |

## Tuning

The numbers that make it feel right live at the top of `src/mrt/sim.ts`, and the journey test holds the ones that
matter: a jump under a strap swings it, a brake swings all of them the same way and rolls the can forward, the can
comes back off the end wall, and under reduced motion none of it moves.
