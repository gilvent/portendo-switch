# The MRT: opening and hub

The commute that opens the site: the platform on the handheld's screen, boarding (which docks the console), and the
inside of the MRT car on the big screen, which is the hub. This is its sheet in the three layers of `GAME_DESIGN.md`,
bottom up. It was built in that order too: rules first, then a greybox with no art (`?graybox`) to tune what the rules
do, then the feel, and only then the paper (`ART_BIBLE.md`).

## 1. Mechanics

### Systems (`src/mrt/sim.ts`)

- **The train.** One state: speed `v` and acceleration `a`. It pulls away when the car opens, cruises with small
  notches of power and brake, brakes to a stand when a stop is asked for, and lets go all at once as it stands.
- **Pendulums.** Anything that hangs: the car's ten hand straps and the help point's handset; the platform's two
  hanging boards. Pushed by `-a` in the car, by the train's wind on the platform, and by his head or a finger.
- **A roller.** The drinks can: rolls freely along the car, hardly across it. Pushed by `-a`, kicked by his feet,
  thrown back by the end walls, flattened by a landing, and springs back.
- **Him.** `-a` leans him and slides his feet; in the air the car changes speed under him. Stepping onto the train as
  it pulls away throws him down the car.

### The platform (handheld)

| Thing | Kind | Rule |
|---|---|---|
| Ticket gate | Stop | Shut, it stops him. A taps the pass: it opens, the pass pops up with his name and trade, the train is called |
| Line map | Stop | A turns its lamp to the other line. The departure board and the train's own sign take that stop |
| Train door | Stop | Usable only when the train stands. A boards, which docks the console |
| The gate says no | Find | Walk into the shut gate |
| The name board swings | Find | Jump under it (his head knocks it and his rise stops), or a finger |
| The commuter wakes | Find | Jump beside the sleeper, or a finger |
| Departure board | - | Always says the next thing to do |

### The car (docked)

| Thing | Kind | Rule |
|---|---|---|
| Doors | Stop (a door) | A asks for the stop on the sign. B turns the sign |
| Poster roll | Stop | A winds on one poster of three: a greeting, his name, what he does |
| Line map | Stop | A turns the sign to the other stop; its lamp moves |
| Help point | Stop | A lifts the handset and opens the contact card |
| A strap to swing | Find | Jump anywhere under a rail, or a finger |
| A can to kick | Find | Walk into the can, or a finger |
| A can to flatten | Find | Land on it |
| The roll comes round | Find | Wind the poster roll back to its first poster |
| The whole carriage | Find | Brush past every passenger who answers |
| Passengers, suitcase, bag | Touchable | Each answers a bump in its own way |

## 2. Dynamics

What happens when those rules run, in the order a first-time player meets it.

1. **He walks right and the gate stops him.** The paddles rattle, the reader buzzes, and the first star is found
   before anything has been explained: unmarked things answer, and the game keeps count.
2. **A opens the gate and the wait begins.** The train takes about two seconds. In that time A does nothing useful, so
   it is a jump, and he is standing under the name board: the second find is the likeliest next press.
3. **The train arrives as weather.** Its wind swings both boards, leans him, blows scraps down the platform and shakes
   the screen. Nothing was pressed; the place did it.
4. **Boarding is a change of scale.** The handheld's flat theatre folds into the dock and opens as a room.
5. **The train throws him.** It is already pulling away: he slides down the car with the straps swinging back and the
   can rolling past, and stops under the poster roll with A lit. The hub's first answer is who this is.
6. **The way out is behind him.** The doors are marked and their sign is lit. Walking back to them crosses the can's
   path and passes under the rail.
7. **Asking for a stop moves the whole car.** Chime, brake: every strap swings forward, the can rolls forward, he
   slides, the station comes up to the windows; then the brake lets go, everything swings back, every passenger jolts
   in turn, and only then do the doors open.

Two speeds run through this. **In a hurry:** hold right, A at the gate, A at the door, walk back, A at the doors: the
first project in three presses and about fifteen seconds. **Wandering:** three stars on the platform and five in the car,
none of them needed.

## 3. Aesthetics

### Discovery

| Moment | What is found | Why it lands |
|---|---|---|
| The shut gate | Unmarked things answer | It happens by accident, within three seconds |
| The pass | His name and trade | It is the answer to the first A |
| The line map | The site has two lines: work, and side projects | Choosing one changes where the train goes |
| The dock | The game is bigger than the screen it started on | A change of dimension, once |
| The poster roll | Who he is, a line at a time | He is thrown at it; each A shows one more |
| Stars | Eight things nothing points at | The pass shows how many are left, never which |
| The station at the windows | Where a project is, before the doors open | It arrives in the stop's own colour and name |

### Sensation

| Sense | What carries it |
|---|---|
| Eye | Real pendulums and a real roller, redrawn in steps like stop-motion; squash and stretch on him; scraps and dust; the camera knocking when the train stands, on a hard landing, when the can is crushed |
| Ear | A sound for every answer; the train's rumble, as loud as it is fast; two knocks at each rail joint; a footstep to each stride; a chime before the brake; three rising notes for a star |
| Hand | The on-screen button goes down with its key and the stick tips with the arrows; a phone buzzes on a knock, a crunch, a stamp, a star |

### Challenge: the whole of it

Four things to work out, each with its hint already on screen. There is no fifth.

| To work out | Hint |
|---|---|
| How to move | The legend; the lit stick, which tips when an arrow is pressed |
| What A is for | The gate will not let him by; the departure board says to tap the pass; A is prompted there |
| How to board | The door mark on the floor; the departure board; A is prompted at the door |
| Where to go in the car | The doors keep their pennant; the sign over them is the only lit thing in the car |

Nothing here is timed. The gate cannot be failed, only not yet opened. A jump cannot miss a strap.

## Tuning

The numbers that make it feel right are at the top of `src/mrt/sim.ts`, and `SHOVE` in `App.tsx`. The journey test
reads the physics from the game and holds what matters: the first star comes from the gate; a jump under a rail swings
a strap; a brake swings all of them one way and rolls the can; the doors wait for the train to stand; boarding leaves
him under the poster roll and out of reach of the doors; each find counts once; under reduced motion none of it moves.

## What changed between passes, and why

- **The car opened with "Get off" already prompted.** A player pressing A never saw the hub. Now the pull-away throws
  him to the poster roll: the first answer in the car is an introduction, and leaving costs one short walk.
- **Finds were unrecorded.** Bonking a strap was fun once and then forgotten. Stars on the pass, with the count
  showing and the names hidden, make each one a discovery and the missing ones a question.
- **Answers were only seen.** Sound came first; then the rumble, the rail joints, footsteps, the buzz and the camera
  knock, so that heavy things feel heavy.
- **The controller was a picture.** It now moves with the keyboard, which removed the one piece of reading a new player
  had to do.
- **Strap rail by the windows.** It sat inside the reach of the back wall's stops, so A there used a stop instead of
  jumping. It moved over the aisle.
