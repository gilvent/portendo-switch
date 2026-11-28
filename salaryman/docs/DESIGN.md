# Papercraft Salaryman: the design

This is the working design for the rebuild, read through **MDA** (Hunicke, LeBlanc, Zubek). The designer builds
**mechanics → dynamics → aesthetics**: rules, then what those rules do when someone plays, then what the player feels.
The player meets them the other way round. So each element below is written in build order and checked in play order.

**Direction since pass 3 (the owner's steer):** a stop does not walk the visitor through project details, the tech
stack or what he built. It only has to match the *theme* of the company: Blibli.com is shopping. The details live on
the one-page version. Moperty and Radjastone keep their pass-2 greybox for now and are out of scope until revisited.

Creative direction came from a Fable 5.2 consultation (high effort). Calls the lead made on top of it are marked
**Lead**. Units are metres in the three.js scene. Fable's original numbers were in the old game's units and have been
converted at about 55 old units to 1 m.

## 1. The game as a whole

### Target aesthetics

| Aesthetic | What it means here | Aesthetic statement (the test) |
|---|---|---|
| **Discovery** (first) | Finding out how each place plays: its toys (the marked mechanisms), its rule (one thing true everywhere in it) and its surprise (one unmarked set piece). The kind of place says where he worked | "I poked the shop, it did something I did not expect, and I know where he worked." |
| **Sensation** (first) | Paper that snaps, flutters and swings, and a train whose inertia moves everything at once | "I can almost feel the card stock, and the train moves me." |
| **Challenge** (mini, for the first visit) | Commuter micro-skills: catch the doors, hold on, don't miss your stop, notice the odd thing. All of it is telegraphed and soft-fail, and each fail is a gag | "I only just made it, and I was better at it by the third ride." |

Narrative comes free and is not aimed at: the visit is one working day, from morning to night. Fantasy, fellowship,
expression and submission are not aimed at either.

**Reconciling "mini Challenge" with "the scene is not gamified".** Challenge belongs to the *frame*, meaning the
commute (doors, inertia, stops) and noticing things (one unmarked secret per place). No project is ever timed, scored
or made into a minigame. Failure costs at most about 6 s and is always funny.

### Core loop: two textures in turn

| Phase | Length | Texture | Aesthetic |
|---|---|---|---|
| **Ride** | about 8.5 s | Kinetic and timed: chime, pull-away, cruise, chime, brake, doors | Sensation and Challenge |
| **Stop** | 30–75 s | Calm and untimed: walk a one-way place, work its mechanisms (each one punches the ticket), then re-board at the far end | Discovery |

The train runs the line by itself: **Blibli.com → Moperty → Radjastone → Alvaro L. (terminus)**. The player never
picks from a menu. Stations come to them, and the only choice is to get off or stay on.

### A first visit, minute by minute

| Time | Beat |
|---|---|
| 0:00–0:20 | Platform on the handheld, morning. The station sign already says who and what. Gate, ticket, the train arrives as wind, the door countdown, board |
| 0:20–0:23 | **Dock.** The console drops into the dock and the screen opens to the window |
| 0:23–0:33 | Ride 1. He is thrown, which teaches "hold on". The ad panel says hello. "Next stop: Blibli.com" comes up in the windows |
| 0:33–1:50 | Blibli.com |
| 1:50–2:00 | Ride 2, noon light. A Blibli poster and souvenir now ride in the car. A second try at the strap |
| 2:00–2:40 | Moperty |
| 2:40–2:50 | Ride 3, afternoon |
| 2:50–3:30 | Radjastone |
| 3:30–3:40 | Ride 4, dusk |
| 3:40–4:00 | Terminus: the home platform at night. The gate takes the ticket, the console undocks, and his business card is on the handheld |

### The hurry path (a recruiter, under 60 s, cannot fail)

- **0 s, no input:** the station sign reads "Alvaro L. · Web Frontend Developer".
- **0 s, one click:** "In a hurry? One-page version" under the console opens a static page built from the same content.
  It is the only chrome outside the fiction, and it stays.
- **About 7 s:** A at the gate prints the ticket (name and trade). **X** (or a tap on the ticket) flips it to the
  contact side, and it stays reachable for the rest of the game.
- **About 35 s:** standing in the first project with only → and A. A missed train costs at most 6 s, and the first
  station's doors wait for him.

## 2. Game design elements

Each element is built bottom-up. Its sheet says what it is made of (M), what players do with it (D), what that is
meant to feel like (A), and how that is checked.

### 2.1 Verbs and controls

- **M:** walk left and right on **one lane** at 4.4 m/s. Depth is set dressing only (Fable cut z-walking. **Lead:**
  agreed; it halves the control and collision work and makes touch trivial). **A** works the mechanism in reach (1.3 m);
  with nothing in reach it jumps (apex about 1.1 m held, 0.75 m on a tap, 0.55 s; the cut on release waits 0.11 s so a
  tap still rings the bell; 1.6 m would put a 1.5 m salaryman's head through the strap rail). **X** flips the ticket. **B / Esc** closes
  what is open. Touch: tap a spot to walk there; tap an object to walk to it and work it. Mechanisms stand at least 3 m
  apart, so A is never ambiguous.
- **D:** a non-gamer holds → and taps A. A gamer jumps at everything, which the secrets reward.
- **A:** no control challenge, so the Challenge can live in timing. **Check:** 5 of 5 cold testers move and act within
  8 s with no key legend on screen.

### 2.2 Interaction grammar: a movable book, with juice

- **M:** every interactive object is one of five paper mechanisms: **pull-tab, flap, wheel, slot, pop-up**. Each has a
  visible tab in one accent colour (coral). Working one has four phases:
  1. **Anticipation:** the tab wiggles for 0.3 s every 2.5 s while he is within 3.6 m.
  2. **Snap:** 80–250 ms, stepped like stop-motion.
  3. **Settle:** a 400 ms overshoot wobble.
  4. **Caption:** a stub slides out in first person, at most 9 words, for 3 s, and the ticket is punched (the first time).
- Captions replace every letter. They are his dry aside as someone in the place, first person, present tense, never
  a CV line; at most one per stop winks at his having worked there. One per mechanism, first use only; they ride
  over his head for 1.2 s + 0.35 s a word and come after the settle. Unmarked touchables stay as free juice and are
  not recorded.
- **D:** the affordance is learnt once at the gate and recognised everywhere. Players work mechanisms again because each
  state is different.
- **A:** Sensation (snap, sound) and Discovery (the change of state is the surprise). **Check:** after play, testers
  name the kind of place for each stop and at least 2 of its toys unprompted. Nobody is asked to recall a fact about
  the work.

### 2.3 Platform: the handheld opening

- **M:** fixed camera, one screen, and four things: the station sign, the departure board (the only tutorial voice), the
  gate and the train door. A sleeping commuter with a newspaper is the platform's secret. The shut gate blocks him; A
  opens it, prints the ticket and calls the train, which arrives 2.5 s later with wind.
- **D:** blocked, then A, then wind, then hurry, then board: about 15 s.
- **A:** teaches both verbs with a reason; the first Sensation (wind) and the first Challenge (the doors). **Check:**
  median time to board is under 20 s.

### 2.4 Dock and undock

- **M:** boarding plays an uninterruptible 2.2 s transition: the console drops into the dock, the screen scales to full
  bleed, one clack and a camera knock. Under reduced motion it is a 300 ms cross-fade. At the terminus it runs in reverse.
- **D:** it happens once each way, so it stays special.
- **A:** the peak of Sensation and Discovery ("the game is bigger than its screen"). **Check:** an audible reaction on
  the first dock.

### 2.5 The train: hub and navigation

- **M, the ride:** chime 0.8 s, accelerate 1.2 s, cruise 4 s, chime 0.8 s, brake about 1.1 s (a × 1.1), then the doors
  open. Unheld, the pull slides him half the car (7.4 m) into the end wall.
- **M, the dwell:** 4 s, then 2 s of closing ticks (four a second) with the bar over the doors flashing coral. At the first stop ever, the doors wait until he gets off. If he stays
  on, the train goes on to the next stop.
- **M, the strip map (pass 3: the express slider is cut):** a passive strip map over the doors shows where the train
  is on the line. The slider would have saved about 28 s, and only for someone already on the way out; the hurry
  path has the one-page version and the ticket's contact side.
- **M, the car changes as the day goes on:** the light steps from morning to night; three empty ad frames fill, one
  poster per project visited; a souvenir from each stop rides the luggage rack and obeys the inertia. On ride 1 only,
  the ad panel cycles three intro lines by itself.
- **D:** the hurry player never navigates. Wanderers play with the physics for 8 s and are then pulled on by the
  arrival, so the hub never stalls.
- **A:** Sensation (inertia), Challenge (holding on, not missing the stop), Discovery (the station coming up in the
  windows before the doors open). **Check:** nobody asks "where do I go?".

### 2.6 Project scenes: the shared rules

- **M:** one continuous side-scroll per project, with no sub-rooms and **one way through**: he gets off at the left,
  and the way back to the train is at the right end. Untimed and unfailable. Each has 3–7 marked mechanisms, one
  unmarked secret, and one "visit the site" object that opens a new tab and is not punched. An establishing tag
  appears on arrival and carries the stop's one fact (the company and what it is). Jump secrets stand at least 2 m
  from any mechanism, so A never opens a tab when the player meant to jump. Widths: Blibli 38 m, the others about
  26 m. No timing, score or catch game inside a stop: slapstick with no outcome, reactive juice and noticing only.
- **D:** walking right naturally meets everything, so even a rusher collects 2–3 punches.
- **A:** Discovery first. **Check:** more than 70% of marked mechanisms are worked without prompting.

### 2.7 The ticket: progression, meta and contact in one object (the signature)

- **M:** the gate prints a ticket. The front is the line, with a row of hole outlines per station; the back is his
  contact. Each toy found (its first working) punches a hole: the chad flutters down and light shows through. 16 holes
  in total, 12 round and 4 star:

  | Row | Round | Star |
  |---|---|---|
  | Line | 1 | 1 |
  | Blibli | 5 | 1 |
  | Moperty | 3 | 1 |
  | Radjastone | 3 | 1 |

  It shows how many, never which. Docked, the HUD is the ticket's corner (only the current station's row) plus the
  in-world A prompt.
- **D:** an empty star outline sends players looking. The flip makes contact a single button from second 7.
- **A:** it collapses stamps, stars, the pass and the contact letter into one prop, and it is the pun people remember:
  you rode his commute and left holding his card.

### 2.8 Camera

- **M:** fixed in handheld mode. Docked, the car fits one screen (on a phone held upright the view keeps its width
  and follows him). At the terminus the camera closes in at tap-out with the game's only yaw toward the doorway, holds
  for the wave and the lamps going out, and pulls back as the console comes out. Scenes follow with a 2.2 m lead in the direction he
  faces. Working a mechanism pushes in 1.12× for 0.6 s. A knock on a brake, a landing or a punch.
- **A:** Sensation. It keeps the caption and the mechanism in one glance.

### 2.9 Audio

- **M:** synthesised, in families that each mean one thing (pass 4): *paper* (him and what he touches), *train* (a
  lurch and rising whine on the pull, a squeal on the brake, a rumble with an idle hum, rail-joint knocks every 4.2 m),
  *three sine notes 0.2 s apart* (brace: they end as the force starts), *square ticks* (doors closing, platform and
  car), the *reader beep* (the gate), *shop* plinks and scanner beeps, and the signature *ka-chunk* (click, 70 ms gap,
  thud, chad flutter), which means a hole in the ticket and nothing else; the star adds an arpeggio. It lands 160 ms
  after the toy's snap, with a 50 ms held frame and a downward knock. Every sound under 300 Hz has a partner above
  400 Hz for phone speakers. The dock clacks; the ending resolves the line's last jingle (G) to a held C.
  Haptics: a pulse per brace note, the pull, the brake, the stop, the dock, the punch. They are not silenced by mute
  (with sound off they are the second channel) and are never the only channel. Mute: the console's volume key, a ♪ key
  at the screen's corner once docked, or M.
- **A:** Sensation. The jingles make an arrival feel discovered.

### 2.10 UI and HUD

- **M:** in handheld mode the console is the HUD: its buttons are the touch controls and go down with the keys. Docked,
  there is one HUD element (the ticket corner) and the in-world prompt. Touch is direct, with no on-screen controller.
- **A:** nothing stands between the eye and the paper.

### 2.11 The challenge beats

| # | Beat | Tension | Release | Soft fail | Fair hint |
|---|---|---|---|---|---|
| 1 | **Make the doors** (platform): open for 8 s, about 1.5 s walk from the gate | "Doors closing 0:08" on the board, a quickening chime, a flashing lamp | He steps in and the console docks. In the last second he turns edge-on and slips through paper-thin | The train leaves in a gust that blows the sleeper's newspaper about; "Next train 0:05" | Countdown, chime, lamp |
| 2 | **Hold on** (each pull-away and brake): one A (or a tap anywhere) grabs the nearest strap within 1.45 m and holds until the train settles. The window opens as the doors close and 0.6 s before the arrival chime | Chime, the rings turn coral and kick, standees rise and reach up | He swings out and dismounts; the standees cheer; the Line star hole, the first time; "Held on. Like a local." | He slides the car, crumples on the end wall, holds the pose, the passengers look; the first time, "Note to self: grab a strap." No time lost | Ride 1 is meant to be failed; from ride 2, until he has held once, the nearest strap shows "A Hold on" |
| 3 | **Don't miss your stop** (from the second stop on): 6 s dwell plus a 2 s chime | The chime while he is busy in the car | A hop out as the doors pinch shut | He rides to the next station, which is still content; the line loops | Announcement, the station name in the windows, the lamp |
| 4 | **The odd one out**: one secret per place | One empty star outline on the ticket row | A set piece bigger than a normal mechanism | None; it is optional | Once a stop's marked holes are all punched, the secret's corner curls and glints every 4 s |
| 5 | **Rush hour** (ride 4, smallest version, after beat 2 is proven): six extra standees ripple with the pull and cushion him; no new input | Crowded | He bursts out at the terminus | The crowd cushions the throw | The crowd parts toward the lit door |

Beat 2 is the mastery arc: fail on ride 1, succeed by ride 2 or 3.

### 2.12 Ending and contact

- **M:** the terminus is the home platform at night. The gate takes the ticket and the console undocks. The handheld
  shows the business card: name, trade, four links, the ticket's punch pattern as a labelled strip, "Ride again", and
  with all 16 holes a gold edge. At tap-out the ticket shows its front and turns over to his contact side before the
  console comes out. The card focuses the Email link, and Enter or Space work on it. Contact is never gated.
- **A:** the release, and the moment a visitor gets in touch.

## 3. Project scenes

The metaphors stay between "too literal" (a phone showing the app) and "too far" (a birdhouse tree for a property app).
The tech stack is never in a scene.

### Blibli.com: the shop that fills your bag (pass 3)

A paper shop floor, 38 m. **Its rule:** whatever he touches ends up in the blue bag on his arm, and what he buys beats
him to the train. The greeter at the door bows and the bag hops onto his arm. Things stand in a tower out of the bag
that leans against his acceleration and floats apart when he jumps. Each of the five movable-book mechanisms appears
once, so the shop is also the showcase of the grammar. Text on paper is shop print only: the "blibli" fascia, price
tags in rupiah, "SALE". Souvenir: the sealed bag, with its receipt, on the car seat.

| # | x (m) | Mechanism | What happens | His line |
|---|---|---|---|---|
| 1 | 4.5 | Lamp carousel **wheel** | Ratchets the lamp to its next colour; a boxed lamp hops into the bag | "Just looking. Fine, I'll take one." |
| 2 | 11 | Can pyramid **pull-tab** | The bottom can slides out into the bag; a held breath, a clerk's head pops up, the pyramid comes down and rolls everywhere (one for his head); the cans hop back in stop-motion. Second pull: only the top can drops, into the bag | "I only wanted the bottom one." |
| 3 | 17.5 | Fitting room **flap** | The curtain drops in front of him, three rustles, the old look is tossed over the top, it snaps up on the next (glasses, cap, bow tie, all three). He keeps wearing it, price tag swinging, for the rest of the day | "Tag stays on. That's the look." |
| 4 | 24 | Surprise box **pop-up** | Springs by itself as he walks past (the rusher's punch); the toy hops onto his tower. A pushes it back in for the next toy | "Didn't need it. Bought it anyway." |
| 5 | 30 | The till **slot** | Each thing hops over the scanner, one beep up a scale, while the receipt chatters out; ka-ching, the stamp; the sealed bag slides down a chute into a courier's box and the courier pops a wheelie off to the trains | "Do I still get the staff discount?" (the stop's one wink) |
| ★ | 33 | Sale bell (jump) | A wave of SALE flags drops right to left, prices are struck through, a stampede of shoppers pours in from the trains and back out with bags, coupons flutter, the shelves restock | "Flash sale! Who rang that? Oh. Me." |

Unmarked juice: three shelves whose goods stand up as he comes near, two strollers with bags, the greeter's bow.
Arrival tag: "Blibli.com · Indonesia's big online store. I worked here as a front-end developer."

### Moperty: a street in his hometown

Folded paper houses with FOR SALE and FOR RENT signs. Souvenir: a house key on a tag.

| # | Mechanism | What happens | Fact it carries |
|---|---|---|---|
| 1 | Signpost **wheel** (Sale / Rent) | Matching houses stand, the others fold flat | Browse homes for sale or rent around my hometown |
| 2 | Build plot, 3 pulls | A pencil sketch, then the house front pops up, then the house turns to show the pipes and wiring at its back | I designed it, built the front, built the back |
| 3 | Road sign **pull-tab** | A tall sign rises and visitors walk in from off-screen | People had to find it, so I did the SEO too |
| ★ | Street lamp (jump) | Evening falls and every window lights | Still running: I build and run the whole product |

### Radjastone: the stone showroom

A courtyard gallery of a natural-stone firm, with a feature wall and the owner, a stonemason. Souvenir: a stone tile.

| # | Mechanism | What happens | Fact it carries |
|---|---|---|---|
| 1 | Tracing-paper **flap** | A vellum sketch folds down over the entrance and matches it line for line | I designed their website, then built it to match |
| 2 | Feature wall (walk-by) | Slabs rise and clack into place following his walk, and reverse if he walks back | Animation, felt as scroll-driven choreography |
| 3 | Sample **slot** | The owner hands him one of three stones; slotting it re-skins the showroom, then the owner swaps one himself | The owner updates the content himself |
| ★ | Rough block (jump on it 3 times) | It splits into a tiny carved salaryman | Freelance: one client, one developer, start to finish |

## 4. Build order (greybox first, then art)

| Milestone | Build | Playtest questions |
|---|---|---|
| **M0** Commute loop | Platform, gate, door timer, dock, car with inertia and straps, auto-arrival, an empty stop with an exit at the right end, the next ride | Is the median time to the first stop under 35 s? Does anyone get stuck? Is the throw funny? Do half grab a strap by ride 3 without being told? Does anyone feel punished by the doors? |
| **M1** Mechanism grammar | The five mechanisms with snap, sound, caption and punch | Is the tab spotted without a prompt? Is the caption read? Does one A ever do the wrong thing? |
| **M2** Blibli greybox | All its mechanisms in labelled boxes | Does anyone say "shop" or "online store" unprompted? Do they connect the courier with the bag on the seat? Do 70% work 4 of 5 toys? Does anyone jump for the bell before the glint? |
| **M3** Ticket, hub changes, terminus | Holes, the flip for contact, light steps, posters, the undocked ending | Is the car's change noticed? Does an empty star send players looking? Is his email found in under 15 s? |
| **M4** Moperty and Radjastone | Both scenes, plus beats 3 and 4 | Does the front-and-back house read without explanation? Is missing a stop funny or annoying? |
| **M5** Art where design leans on it | Ticket; tab colour; station pop-up; the edge-on squeeze and crumple; then the rest | Are affordances as clear as in the greybox? |
| **M6** Fallbacks | One-page version, reduced motion, touch, audio polish | Is the hurry path under 60 s on a phone with sound off? |

**Kill criterion:** if the M0 rhythm of ride and stop is not fun in boxes, it is fixed before anything else.

## 5. Cut from the old game

Stamps, stars, the pass card and "0 of 16" are replaced by the ticket. The find/touchable taxonomy goes. The key legend
and the corner buttons move onto the console. Flipping the door sign with B and the line-map toys go. Letters,
including contact, go. Tech-stack boxes go. Blibli's three rooms and their back-tracking become one scene. z-walking
goes. "B asks before leaving" and "nothing is timed" go: the doors are the timer, and leaving is walking out. The can
and the "whole carriage" find go. The two lines become segment colours on one loop.

## 6. Iteration log

Each pass records what was changed, why, and what play showed. Newest last.

### Pass 1: M0, the commute loop in greybox

Built: the platform (gate, departure board, arriving train, an 8 s door countdown), the dock, the car (ride phases,
inertia, ten straps, two standees who grab first, seated passengers who jolt, an end wall that crumples him), a
greybox stop with placeholder mechanisms and a way back at the right end, and the ticket (printed at the gate, a
corner per place, flips for contact).

Scripted play (`tests/play.mjs`) gave the first numbers:

| Measure | Target | First pass | Change | Now |
|---|---|---|---|---|
| Time to the first stop, hurry path | under 35 s | 22.9 s | none | 22.9 s |
| Slide when he does not hold on, ride 1 | about 5.5 m | 2.9 m | `RIDE.throw` 2.6 → 4.6 | 5.5 m: he ends against the end wall |
| A during the chime, standing at the doors | grabs a strap | jumped instead | straps had a 4.4 m gap at the doors; strap at ±1.1 m added, reach 1.1 → 1.45 m, sign over the doors narrowed so straps clear it | grabs |
| Missed stop | doors close after 6 + 2 s and the train goes on | as intended | none | — |

Also fixed: the page-turn leaves showed at the screen edges when they should have been hidden; the station wall outside
the windows showed past the car's end walls (now clipped to the car).

### Pass 2: M1 to M4, the grammar, the three scenes, the day, the ending

Built: the mechanism grammar (`src/game/mech.ts`: a coral tab that wiggles every 2.5 s within 3.6 m, a 12 fps stepped
snap, an overshoot settle, a caption, a punch); the three project scenes on a shared one-way station builder
(`src/scenes/station.ts`); the car changing with the day; the terminus and the undocked business card; the one-page
version (`one-page.html`, built from the same content, the only place the tech stack appears).

Calls made by the lead in this pass, and why:

- **The day shows on a clock, not in the car's light.** The art checklist says underground places have no time of day.
  The car instead shows the day through a wall clock that moves on with each ride, the three poster frames filling,
  and souvenirs (a shopping bag, a key tag, a stone tile) that ride on the free end of a seat and slide with the
  train's inertia. The evening belongs to an outdoor place: Moperty's street lamp.
- **Low blocks are steps.** Radjastone's rough block stood in the only lane, so a player who just holds → got stuck,
  and getting stuck is Challenge the design does not want. Blocks up to 0.5 m are now walked up onto; jumping on one
  is the secret, not the way past.
- **The secret's glint** comes on once a stop's marked holes are all punched, as the design asked.
- **Every fact is punched once.** Two routes can tell the same fact (Blibli's panel tab and its ALL AT ONCE lever both
  tell "incremental beats big bang"), and the hole is punched by whichever comes first.

Scripted checks (`tests/scene.mjs <station>`): Blibli 8 of 8 marked holes, Moperty 3 of 3, Radjastone 3 of 3,
walking right and pressing A at each prompt. The terminus runs through tap-out, undock and the card.

### Pass 3: the owner's steer, a player-side review, and the fixes

**Steer.** Scenes match the company's theme, not its project details. Blibli was rebuilt as a shop (§3); the
engineering-lesson mechanisms (lazy loading, incremental release, rotated uploads, review filters, gallery ratios)
were cut. The one-page version stays the only home of work detail.

**Review.** Fable 5.2 (high) played the greybox through Playwright, A→D→M, and ranked fixes
(platform, dock, rides, hold-on, terminus, hurry path, phones). Verdicts on the open calls:

| Call | Verdict |
|---|---|
| Express tab | Cut the slider; a passive strip map later (it saved about 28 s, only for someone leaving) |
| Rush hour | Smallest version only (six standees that cushion him), after hold-on is proven; deferred |
| Blibli's 8 + secret | Too many: 46.5 s, 13 presses, 57% of round holes worked. 5 + secret |
| Captions | Mostly unread in the frame (hidden, occluded, flat 3.2 s). His dry aside, timed by length, over his head |
| Hold-on fair? | The window was right (2.0 s); the teaching and the input were not |

Changes, and what re-measuring showed:

| Measure | Before | Change | After |
|---|---|---|---|
| Masher grabs a strap (20 rides) | 9 / 20 | A no longer lets go; window opens as the doors close | 20 / 20 |
| Single A from 0.1 s to 3.2 s after the doors start closing | grabs only from 0.68 s | as above | every press grabs |
| Learning to hold | no tell, no fail line | coral rings that kick, standees that reach, "Note to self: grab a strap.", an "A Hold on" pin from ride 2 until the first hold | — |
| Dock | 17 of 52 frames blank; ride 1 chimes under the black | draw inside `resize()`, ease-in grow, ride 1 waits 0.9 s | car visible through the grow, doors still open when it is full size |
| Touch strap grab | impossible | a tap anywhere in the window grabs | hangs |
| Touch jump apex | 0.20 m | a tap-jump is full height | full |
| Portrait phone, docked | hero off screen | view keeps its width down to a square; camera follows him in narrow views; a "turn sideways" note | hero at x 194 of 390 |
| End card on phones | two links cut off, 10 px | card and ticket take the viewport, 44 px rows, 16 px type | no overflow, all four links 44 px |
| "Get off" prompt at rest | missing | reach 1.25 → 2.6 m | shows |
| Missed train | about 11 s | next train 5 → 2.5 s, gentler departing gust | — |
| Bell secret | A opened blibli.com from most of its width | bell 3 m from the till, 2.4 m from the Visit stand | rings across its width |
| Keys on the end card | dead | Enter and Space pass through on links and buttons; Email focused | Enter on "Ride again" reloads |

Scripted checks after the pass: `tests/scene.mjs blibli` punches 5 of 5 and the bell's star; `tests/play.mjs` reaches
Blibli at 27.8 s of wall-clock time under software rendering (the review measured 17.95 game seconds before the pass;
the train is now called 1 s later and ride 1 waits 0.9 s for the dock), inside the 35 s target, with no errors.

### Pass 4: dynamics and Sensation

A Fable 5.2 (xhigh) plan, judged by instrumenting every sound, haptic, shake and nudge against the game clock. What it
found, and what was built:

| Found | Built |
|---|---|
| The train made no sound a phone could play; two rail knocks a ride | lurch + rising whine on the pull, squeal on the brake, door ticks as they close, an idle hum, knocks every 4.2 m with a click partner; on the platform, wind and rail beds that follow the arriving train, a squeal as it stops, litter that blows past |
| Shake moved the picture 2 px at most | gains ×3.6, capped at 0.6; the crumple, the cans, the stop and the dock now read; a 50 ms held frame on each punch, 83 ms on the crumple |
| The punch was a 110 Hz thud on the toy's own frame; the till played it twice; tap-out had none | one ka-chunk, 160 ms after the snap, everywhere a hole is made; the gate's ka-chunk keeps the ticket at tap-out |
| The brace chime rang 0.46 s into the pull, and the dwell-end warning reused it | the notes end as the force starts; the dwell end is ticks, so the chime means only "brace" |
| Dock, undock and card nearly mute | whirr, clack, knock and a long whoosh at the dock, the LED's ding; reverse whoosh and clack at the undock; paper at the card |
| Reduced motion collapsed every timeline into one frame (17 sounds at once) and made the camera faster | timelines keep their length and cut to the end pose; the camera eases at the normal rate with no lead; page turn and dock fade; straps and passengers hold a lean instead of swinging; tunnel lamps slow; the tab brightens instead of wiggling |
| Sound-off players lost the door warnings and could not mute once docked | a bar over the car doors (amber pulses for brace, coral four a second for closing) and over the platform door (lit on each tick); the "Get off" prompt pulses while the doors close; "…that was my stop." the first time he misses one; ♪ key and M |
| The terminus was lit from behind the paper, still and silent | lamps in front of the paper, a skyline when the last train leaves, a newspaper blown off the bench, crickets, a flickering lamp, a warm doorway; at tap-out a close shot with a slight yaw, a wave, the lamps out one by one, a pull-back, then the card; the ticket is taken at the upper left instead of covering it |

Also: a slide scuffs instead of stepping; a strap creaks as it swings and claps follow a held ride; the courier has its
own horn and putter; flags pop on a rising scale; the stampede is heard and felt; prompts tick instead of popping.
Dwell 6 → 4 s.

Measured after: under reduced motion the can pyramid spreads its sounds over its normal 2.7 s, and a turn moves the
camera 0.35 m in 150 ms (was 4.7 m). `tests/play.mjs` reaches Blibli at 23.8 s, `tests/scene.mjs blibli` punches 5 of 5
and the star, a tap grabs a strap on a phone, all with no errors. Still to do: one listening pass on a laptop and a
phone, expecting to trim levels rather than timings.


### Pass 5: M6, the hurry path on a phone with sound off

Scripted as a first-time visitor on an iPhone 13 viewport, taps only, muted before load (`hurry.mjs` in the session's
scratch; the steps: tap the gate, tap the ticket corner, tap the ticket to flip it, tap the doors, ride, tap the doors).

| Measure | Target | Portrait | Landscape |
|---|---|---|---|
| Name and trade on screen, no input | 0 s | yes (the station sign) | yes |
| Contact side of the ticket, Email link tappable (44 px) | about 7 s | 7.5 s | 8.6 s |
| Standing in Blibli | under 60 s | 25.2 s | 27.2 s |
| Page errors | none | none | none |

Found and fixed: in portrait the console was wider than the phone and cut off A, B and X (the console's height is now
`min(62vh, 38vw)`, so the whole console fits). The one-page link was a 17 px target and is 43 px on touch screens. The
one-page version itself fits a phone with no sideways scroll and puts contact first. Every audio warning has a visual
twin since pass 4, and haptics carry the punch and the brace where the phone supports them.
