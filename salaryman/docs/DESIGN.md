# Papercraft Salaryman: the design

This is the working design for the rebuild, read through **MDA** (Hunicke, LeBlanc, Zubek). The designer builds
**mechanics → dynamics → aesthetics**: rules, then what those rules do when someone plays, then what the player feels.
The player meets them the other way round. So each element below is written in build order and checked in play order.

Creative direction came from a Fable 5.2 consultation (high effort). Calls the lead made on top of it are marked
**Lead**. Units are metres in the three.js scene. Fable's original numbers were in the old game's units and have been
converted at about 55 old units to 1 m.

## 1. The game as a whole

### Target aesthetics

| Aesthetic | What it means here | Aesthetic statement (the test) |
|---|---|---|
| **Discovery** (first) | Finding out who he is by working paper mechanisms, each of which acts out one true thing he did | "I pulled a tab and understood something about him." |
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
  with nothing in reach it jumps (apex about 1.6 m, 0.45 s; hold for height). **X** flips the ticket. **B / Esc** closes
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
- Captions replace every letter. Unmarked touchables stay as free juice and are not recorded.
- **D:** the affordance is learnt once at the gate and recognised everywhere. Players work mechanisms again because each
  state is different.
- **A:** Sensation (snap, sound) and Discovery (the change of state *is* the fact). **Check:** after play, testers recall
  at least 3 true facts unprompted.

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

- **M, the ride:** chime 0.8 s, accelerate 1.2 s, cruise 4 s, chime 0.8 s, brake 1.5 s, then the doors open.
- **M, the dwell:** 6 s, then a 2 s closing chime. At the first stop ever, the doors wait until he gets off. If he stays
  on, the train goes on to the next stop.
- **M, the express tab:** the strip map over the doors is a pull-tab slider. Slide the paper train to any station and
  the train runs express, with the skipped stations whooshing past. It is the only navigation UI, and it is optional.
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
  unmarked secret, and one "visit the site" object that opens a new tab and is not punched. An establishing caption
  appears on arrival (role plus one line). Widths: Blibli about 44 m, the others about 26 m.
- **D:** walking right naturally meets everything, so even a rusher collects 2–3 punches.
- **A:** Discovery first. **Check:** more than 70% of marked mechanisms are worked without prompting.

### 2.7 The ticket: progression, meta and contact in one object (the signature)

- **M:** the gate prints a ticket. The front is the line, with a row of hole outlines per station; the back is his
  contact. Each fact found punches a uniquely shaped hole: the chad flutters down and light shows through. 18 holes in
  total, 14 round and 4 star:

  | Row | Round | Star |
  |---|---|---|
  | Line | 1 | 1 |
  | Blibli | 7 | 1 |
  | Moperty | 3 | 1 |
  | Radjastone | 3 | 1 |

  It shows how many, never which. Docked, the HUD is the ticket's corner (only the current station's row) plus the
  in-world A prompt.
- **D:** an empty star outline sends players looking. The flip makes contact a single button from second 7.
- **A:** it collapses stamps, stars, the pass and the contact letter into one prop, and it is the pun people remember:
  you rode his commute and left holding his card.

### 2.8 Camera

- **M:** fixed in handheld mode. Docked, the car fits one screen. Scenes follow with a 2.2 m lead in the direction he
  faces. Working a mechanism pushes in 1.12× for 0.6 s. A knock on a brake, a landing or a punch.
- **A:** Sensation. It keeps the caption and the mechanism in one glance.

### 2.9 Audio

- **M:** synthesised. The rumble follows the speed, with knocks at the rail joints. The punch's "ka-chunk" is the
  signature sound. Each station has its own three-note arrival jingle. The door chime is the challenge's warning and is
  never the only cue: the door lamp flashes with it. Sound starts on the first input; mute is the volume key on the
  console.
- **A:** Sensation. The jingles make an arrival feel discovered.

### 2.10 UI and HUD

- **M:** in handheld mode the console is the HUD: its buttons are the touch controls and go down with the keys. Docked,
  there is one HUD element (the ticket corner) and the in-world prompt. Touch is direct, with no on-screen controller.
- **A:** nothing stands between the eye and the paper.

### 2.11 The challenge beats

| # | Beat | Tension | Release | Soft fail | Fair hint |
|---|---|---|---|---|---|
| 1 | **Make the doors** (platform): open for 8 s, about 1.5 s walk from the gate | "Doors closing 0:08" on the board, a quickening chime, a flashing lamp | He steps in and the console docks. In the last second he turns edge-on and slips through paper-thin | The train leaves in a gust that blows the sleeper's newspaper about; "Next train 0:05" | Countdown, chime, lamp |
| 2 | **Hold on** (each pull-away and brake): A under the rail grabs the nearest strap within 1.1 m | Chime, passengers brace, straps tremble | He swings out and dismounts with a flourish; a kid claps; the Line star hole, the first time | He slides up to 5.5 m, crumples on the end wall and pops flat. No time lost | On ride 1, which is meant to be failed, every passenger grabs a strap 0.5 s before he flies |
| 3 | **Don't miss your stop** (from the second stop on): 6 s dwell plus a 2 s chime | The chime while he is busy in the car | A hop out as the doors pinch shut | He rides to the next station, which is still content; the line loops | Announcement, the station name in the windows, the lamp |
| 4 | **The odd one out**: one secret per place | One empty star outline on the ticket row | A set piece bigger than a normal mechanism | None; it is optional | Once a stop's marked holes are all punched, the secret's corner curls and glints every 4 s |
| 5 | **Rush hour** (stretch goal, ride 4): a full car whose standees tip like dominoes | Crowded and lit for dusk | He bursts out at the terminus | The crowd carries him out anyway | The crowd parts toward the lit door |

Beat 2 is the mastery arc: fail on ride 1, succeed by ride 2 or 3.

### 2.12 Ending and contact

- **M:** the terminus is the home platform at night. The gate takes the ticket and the console undocks. The handheld
  shows the business card: name, trade, four links, the ticket's punch pattern as a strip, "Ride again", and with all
  18 holes a gold edge and a "How this was made" link. Contact is never gated.
- **A:** the release, and the moment a visitor gets in touch.

## 3. Project scenes

The metaphors stay between "too literal" (a phone showing the app) and "too far" (a birdhouse tree for a property app).
The tech stack is never in a scene.

### Blibli.com: the store built around one product

A department-store floor with one product on a pedestal (a paper desk lamp; no screens), and the customers' review
wall at the far end. Souvenir: a shopping bag.

| # | Mechanism | What happens | Fact it carries |
|---|---|---|---|
| 1 | Pedestal **wheel** | The lamp changes colour; the price tag flips with it; clerks from three counters lean in | The product page: many teams' features on one page, and I built them in |
| 2 | Promo **pull-tab** | A sale banner drops and the price is struck through | Promotions were among them |
| 3 | "You may also like" shelf (walk-by **pop-up**) | Items unfold only as he comes near | Recommendations, and only what is in view gets loaded |
| 4 | Checkout **pull-tab** | A three-turn conveyor refolds into one straight chute | The revamp made add-to-cart simpler |
| 5 | Facade under renovation | Tabs flip one panel per pull while shoppers keep coming in. A taped lever, "ALL AT ONCE", jams the whole front and scatters them | Incremental release beats big bang |
| 6 | Review wall **wheel** | Cards without photos, or with too few stars, fold face-down | Filtering reviews by photo or rating |
| 7 | Instant camera **slot** | The photo comes out sideways; A turns it upright | Phone uploads arrived rotated: test on real devices |
| 8 | Gallery **pull-tab** | Tall, wide and square photos re-lay from grid to list, and all fit | The review gallery; user images vary in ratio |
| ★ | Bell over the door (jump) | Flash sale: a flood of paper shoppers, and nothing falls | High traffic; the page had to stay fast |

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
| **M2** Blibli greybox | All its mechanisms in labelled boxes | Are 3 or more facts recalled? Does the "ALL AT ONCE" lesson land? Where do players skip? |
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
