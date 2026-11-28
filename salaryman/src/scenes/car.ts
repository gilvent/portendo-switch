import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { clamp, Spring } from '../core/math.ts';
import { bed, buzz, noise } from '../core/audio.ts';
import { sfx } from '../game/sfx.ts';
import { HELLO, LINE } from '../game/content.ts';
import { reducedMotion } from '../core/stage.ts';
import { Settle } from '../game/mech.ts';
import { CREST } from './crest.ts';
import type { StationId } from '../game/content.ts';
import { slipThrough } from '../game/squeeze.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';

// The hub: the inside of a moving car. One force, the train's acceleration, moves everything loose at once. The ride
// runs by itself (chime, pull-away, cruise, chime, brake, doors); holding a strap through the pull-away or the brake is
// the one skill, and missing it throws him down the car, which is the joke and the lesson.
export const RIDE = {
  closing: .7, chime: .8, accel: 1.2, cruise: 4, brake: 1.5, dwell: 4, warn: 2,
  a: 3.2,            // m/s² while pulling away and braking
  throw: 4.6,        // how hard the train's push acts on him
  grip: .12,         // how well his shoes hold on the vinyl
  reach: 1.45,        // A this close to a strap grabs it
  strapL: .55, railY: 2.7, joint: 4.2
};
type Phase = 'closing' | 'chime' | 'accel' | 'cruise' | 'warn' | 'brake' | 'stand' | 'leave';
const W = 15.6, H = 3.3, D = 3.2;

export function trainCar(): Place & { sim: { phase: Phase; t: number; v: number; a: number; at: number } } {
  const R = RIDE, group = new THREE.Group();
  // Shell: floor, back wall with windows and the doors in the middle, end walls, a strip of ceiling.
  group.add(box(W + .6, .3, D, '#9aa3ad', 0, -.3, -.2));
  group.add(box(W + .6, .04, .2, '#3d444e', 0, -.04, D / 2 - .2));
  const backZ = -1.75;
  group.add(box(W, 1.05, .14, '#e9edf1', 0, 0, backZ), box(W, .95, .14, '#e9edf1', 0, 2.35, backZ));
  for (const x of [-7.3, -4.4, -1.45, 1.45, 4.4, 7.3]) group.add(box(x === -1.45 || x === 1.45 ? .5 : .4, 1.3, .14, '#e9edf1', x, 1.05, backZ));
  group.add(box(.3, H, D, '#dfe4ea', -W / 2 - .15, 0, -.2), box(.3, H, D, '#dfe4ea', W / 2 + .15, 0, -.2));
  group.add(box(W, .12, .35, '#f4f6f8', 0, H, backZ + .18));
  // Seats under the windows.
  for (const x of [-5.85, -2.95, 2.95, 5.85]) group.add(box(2.5, .48, .6, '#2f6f9f', x, 0, backZ + .38), box(2.5, .5, .12, '#2f6f9f', x, .48, backZ + .12));
  // The doors.
  const doorL = box(.86, 2.25, .06, '#cfd5dc', -.45, 0, backZ + .1), doorR = box(.86, 2.25, .06, '#cfd5dc', .45, 0, backZ + .1);
  group.add(doorL, doorR, box(1.9, .1, .2, '#3d444e', 0, 2.25, backZ + .1));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.08, 12, 8), new THREE.MeshStandardMaterial({ color: '#f6b73c', emissive: '#000' }));
  lamp.position.set(.85, 2.45, backZ + .15); lamp.visible = false; group.add(lamp);
  // The bar over the doors: the eye's twin of every warning. Amber, three pulses: brace (the chime, the arrival).
  // Coral, four a second: the doors are closing.
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.9, .08, .05), new THREE.MeshStandardMaterial({ color: '#3d444e', emissive: '#000' }));
  bar.position.set(0, 2.4, backZ + .16); group.add(bar);
  const barSet = (c: string | null) => { const m = bar.material as THREE.MeshStandardMaterial; m.emissive.set(c ?? '#000'); m.color.set(c ?? '#3d444e'); };
  // Over the doors: the next-stop sign.
  let signText = { top: 'Next stop', name: LINE[0].name, color: LINE[0].color };
  const sign = card(1.9, .5, (g, Wd, Ht) => {
    rrect(g, 0, 0, Wd, Ht, 10, '#1d2026'); label(g, signText.top, Wd / 2, Ht * .27, Ht * .22, '#9aa3ad', 'center', 600);
    label(g, signText.name, Wd / 2, Ht * .68, Ht * .4, signText.color === '#35b58a' ? '#7fe0b4' : '#ffd27a', 'center', 700);
  }, { rim: .02 });
  sign.position.set(0, 2.76, backZ + .12); group.add(sign);
  const setSign = (top: string, i: number) => { const s = LINE[i]; if (signText.top !== top || signText.name !== s.name) { signText = { top, name: s.name, color: s.color }; sign.redraw(); } };
  // The ad panel over the left seats: on the first ride it says hello, a line at a time.
  let ad = 0;
  // After the first ride it advertises the stop just left.
  let adLine = '';
  const adCard = card(2.6, .5, (g, Wd, Ht) => { rrect(g, 0, 0, Wd, Ht, 10, '#f6b73c'); label(g, adLine || HELLO[ad], Wd / 2, Ht / 2, Ht * .42, '#23262b', 'center', 700, Wd * .9); }, { rim: .03 });
  adCard.position.set(-4.4, 2.76, backZ + .12); group.add(adCard);
  // Three poster frames, empty at first: each project he visits puts its poster up.
  let visited: string[] = [];
  const POSTER: Record<string, { mark: string; line: string }> = { blibli: { mark: '🛍', line: 'All in one bag' }, moperty: { mark: '⌂', line: 'Homes near you' }, radjastone: { mark: '◆', line: 'Natural stone' } };
  const posters = [2.6, 4.6, 6.6].map((x, j) => { const c = card(1.7, .55, (g, Wd, Ht) => {
    const id = visited[j], st = LINE.find(l => l.id === id);
    if (!st) { rrect(g, 0, 0, Wd, Ht, 8, '#d4d9df'); g.setLineDash([6, 5]); g.strokeStyle = '#b3bac2'; g.lineWidth = 3; g.strokeRect(8, 8, Wd - 16, Ht - 16); return; }
    rrect(g, 0, 0, Wd, Ht, 8, st.color); label(g, POSTER[id].mark, Ht * .45, Ht / 2, Ht * .5, '#fffaf0'); label(g, st.name, Ht * .9, Ht * .38, Ht * .3, '#fffaf0', 'left', 700); label(g, POSTER[id].line, Ht * .9, Ht * .7, Ht * .2, '#fffaf0cc', 'left', 500);
  }, { rim: .02 }); c.position.set(x, 2.78, backZ + .12); group.add(c); return c; });
  // The clock over the far seats: the day goes on, ride by ride. (Underground has no daylight; the clock is the day.)
  const TIMES = ['8:52', '12:10', '15:24', '18:47', '21:05', '22:30'];
  let clockText = TIMES[0];
  const clock = card(.62, .62, (g, Wd, Ht) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(Wd / 2, Ht / 2, Wd / 2, 0, 7); g.fill(); g.strokeStyle = '#3d444e'; g.lineWidth = 6; g.stroke(); label(g, clockText, Wd / 2, Ht / 2, Ht * .26, '#23262b', 'center', 700); }, { rim: .02 });
  clock.position.set(-6.75, 2.74, backZ + .12); clock.scale.multiplyScalar(.85); group.add(clock);
  // Souvenirs from each stop ride on the free end of a seat, and slide with the train like everything loose.
  const souvenirs = [
    { id: 'blibli', x0: 1.75, x1: 3.05, m: (() => { const b = box(.32, .38, .18, '#0092da'); b.add(box(.06, .22, .01, '#fffaf0', .07, -.02, .095)); return b; })() },
    { id: 'moperty', x0: 4.65, x1: 5.85, m: box(.26, .12, .06, '#f6b73c') },
    { id: 'radjastone', x0: -4.15, x1: -2.85, m: box(.34, .06, .26, '#d8c390') }
  ].map(sv => { sv.m.position.set((sv.x0 + sv.x1) / 2, .48, backZ + .4); sv.m.visible = false; group.add(sv.m); return { ...sv, x: (sv.x0 + sv.x1) / 2, v: 0 }; });
  // Outside: the tunnel's lamps rush past; at a stop, the station wall stands in the windows with its name.
  const outside = new THREE.Group(); outside.position.z = -2.9; group.add(outside);
  const tunnel = box(60, 3.6, .1, '#101318', 0, -.1, -.6); tunnel.castShadow = false; outside.add(tunnel);
  const lamps: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.7, .12, .05), new THREE.MeshBasicMaterial({ color: '#ffe3a0' })); l.position.set(-30 + i * 5, 2.2, -.5); outside.add(l); lamps.push(l); }
  const station = new THREE.Group(); outside.add(station);
  // The station lights itself (it is outside the car's shadow), and columns cross the windows as it slides in; at rest
  // each hides behind a pillar so the windows are clean.
  const selfLit = (m: THREE.Mesh, c: string, k: number) => { m.receiveShadow = false; m.castShadow = false; const mt = m.material as THREE.MeshStandardMaterial; mt.emissive.set(c); mt.emissiveIntensity = k; };
  const stWall = box(40, 3.6, .1, '#dfe2e6', 0, -.1, -.4); selfLit(stWall, '#dfe2e6', .35); station.add(stWall);
  const stBand = box(40, .4, .12, '#0092da', 0, .9, -.38); selfLit(stBand, '#0092da', .3); station.add(stBand);
  for (const px of [-16.8, -13.7, -10.7, -7.6, -4.58, -1.51, 1.51, 4.58, 7.6, 10.7, 13.7, 16.8]) { const c = box(.26, 2.9, .3, '#f4efe4', px, -.1, .15); selfLit(c, '#f4efe4', .3); station.add(c); }
  // Over the roofline, the place itself: two cut sheets hinged at their feet that stand up as the train stops.
  let crestId: StationId = 'blibli', crestHidden = true;
  const crestBack = card(7.6, 2.3, (g, Wd, Ht) => CREST[crestId].back(g, Wd, Ht, Wd / 7.6), { res: 110, rim: .05 });
  const crestFront = card(10.2, 1.9, (g, Wd, Ht) => CREST[crestId].front(g, Wd, Ht, Wd / 10.2), { res: 110, rim: .05 });
  crestBack.position.set(0, 2.97, -1.5); crestFront.position.set(0, 2.97, -1); station.add(crestBack, crestFront);
  const crests = [{ c: crestFront, settle: new Settle(), lead: 0, shown: false }, { c: crestBack, settle: new Settle(), lead: .167, shown: false }];
  const POSE = [-90, -62, -34, -10, 8, -3, 0].map(d => d * Math.PI / 180);
  // Nothing outside shows past the car's end walls.
  const clip = [new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2)];
  const clipAll = () => outside.traverse(o => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.clippingPlanes = clip; });
  clipAll();
  const setStation = (i: number) => {
    const st = LINE[i]; (stBand.material as THREE.MeshStandardMaterial).color.set(st.color); (stBand.material as THREE.MeshStandardMaterial).emissive.set(st.color);
    crestId = st.id; crestBack.redraw(); crestFront.redraw();
    for (const c of [crestBack, crestFront]) { const mt = c.material as THREE.MeshStandardMaterial; mt.emissiveMap = CREST[crestId].night ? mt.map : null; mt.emissive.set(CREST[crestId].night ? '#fff' : '#000'); mt.emissiveIntensity = .5; mt.needsUpdate = true; }
  };
  // Straps over the aisle, clear of the doors.
  const straps: { x: number; th: number; w: number; mesh: THREE.Group; ring: THREE.Mesh }[] = [];
  for (let x = -6.6; x <= 6.61; x += 1.1) {
    if (Math.abs(x) < .9) continue;
    const m = new THREE.Group(); m.position.set(x, R.railY, .1);
    const band = box(.05, R.strapL - .12, .03, '#e9edf1', 0, -(R.strapL - .12), 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(.09, .022, 6, 14), new THREE.MeshStandardMaterial({ color: '#f6b73c' }));
    ring.position.y = -R.strapL + .04; ring.castShadow = true; m.add(band, ring); group.add(m); straps.push({ x, th: 0, w: 0, mesh: m, ring });
  }
  group.add(box(13.8, .05, .05, '#b7bec7', 0, R.railY, .1));
  // Passengers: seated ones jolt; two standees grab their straps just before the pull, so a watcher learns from them.
  const folk = [-6.6, -5.2, -2.3, 3.6, 6.4].map((x, i) => {
    const c = card(.85, 1.2, (g, Wd, Ht) => { const s = Wd / 85; g.fillStyle = ['#7b4b8f', '#3f7a5b', '#a0522d', '#35577f', '#8f6b3f'][i]; g.beginPath(); g.roundRect(18 * s, Ht - 72 * s, 50 * s, 60 * s, 10 * s); g.fill(); g.fillStyle = ['#f0c8a0', '#c68e63', '#f3d2b3', '#8d5b3c', '#e9bf98'][i]; g.beginPath(); g.ellipse(43 * s, Ht - 94 * s, 24 * s, 24 * s, 0, 0, 7); g.fill(); g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(43 * s, Ht - 104 * s, 25 * s, 14 * s, 0, Math.PI, 0); g.fill(); g.fillRect(34 * s, Ht - 96 * s, 4 * s, 5 * s); g.fillRect(48 * s, Ht - 96 * s, 4 * s, 5 * s); });
    c.position.set(x, .25, backZ + .55); group.add(c); return { c, x, jolt: new Spring(0, 120, 7), delay: Math.abs(x) * .03 };
  });
  const standees = [-3.85, 4.95].map((x, i) => {
    const c = card(.95, 1.45, (g, Wd, Ht) => { const s = Wd / 95; g.fillStyle = i ? '#4a5a6a' : '#6a4a5a'; g.beginPath(); g.roundRect(22 * s, Ht - 80 * s, 50 * s, 64 * s, 10 * s); g.fill(); g.fillRect(64 * s, Ht - 126 * s, 9 * s, 50 * s); g.fillStyle = '#f0c8a0'; g.beginPath(); g.ellipse(47 * s, Ht - 104 * s, 24 * s, 24 * s, 0, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.ellipse(47 * s, Ht - 114 * s, 25 * s, 13 * s, 0, Math.PI, 0); g.fill(); g.fillRect(40 * s, Ht - 106 * s, 4 * s, 5 * s); g.fillRect(54 * s, Ht - 106 * s, 4 * s, 5 * s); });
    c.position.set(x, 0, -.3); group.add(c);
    const arm = box(.09, .62, .06, i ? '#4a5a6a' : '#6a4a5a', .2, .78, .01); arm.visible = false; c.add(arm);
    return { c, x, hold: 0, cheer: 0, arm };
  });
  // The sim.
  const sim = { phase: 'stand' as Phase, t: 0, v: 0, a: 0, at: 0, dist: 0, stopAt: 0, express: false };
  const rumble = bed(420, .7);
  let hold: typeof straps[number] | null = null, held = false, lastJoint = 0, doorOpen = 1, clapped = false, rideNo = 0;
  const holdWindow = () => sim.phase === 'closing' || sim.phase === 'chime' || sim.phase === 'accel' || sim.phase === 'warn' || sim.phase === 'brake' || (sim.phase === 'cruise' && sim.t > R.cruise - .6);
  const door: Mech = {
    id: 'doors', x: 0, reach: 2.6, at: new THREE.Vector3(0, 2.0, -1), up: true,
    label: () => `Get off: ${LINE[sim.at].name}`, hurry: () => hurry, on: () => sim.phase === 'stand' && doorOpen > .9, use: g => void getOff(g)
  };
  const go = (p: Phase) => { sim.phase = p; sim.t = 0; };
  const self = {
    id: 'car', group, lane: { x0: -W / 2 + .1, x1: W / 2 - .1, z: .1 }, solids: [], mechs: [door], sim,
    enter(g: Game, from: string | null) {
      g.hero.place(0, .1, 1); g.hero.grip = R.grip;
      g.stage.scene.background = new THREE.Color('#0b0d10');
      rideNo = ++g.save.rides; ad = 0;
      const last = [...g.save.visited].reverse().find(v => v !== 'home'), ls = LINE.find(l => l.id === last);
      adLine = rideNo > 1 && ls && POSTER[ls.id] ? `${ls.name} · ${POSTER[ls.id].line}` : ''; adCard.redraw();
      visited = g.save.visited.filter(v => v !== 'home'); posters.forEach(p => p.redraw());
      clockText = TIMES[Math.min(TIMES.length - 1, rideNo - 1)]; clock.redraw();
      souvenirs.forEach(sv => (sv.m.visible = visited.includes(sv.id as never)));
      // Boarding (from the platform or a station): the doors shut behind him and the train pulls away at once.
      sim.at = from === 'platform' ? 0 : g.save.next; setSign('Next stop', sim.at);
      // Outside stands the stop he is leaving (none, from the morning platform); the next one is dressed on the way.
      crestHidden = from === 'platform'; setStation(from === 'platform' ? sim.at : (sim.at + LINE.length - 1) % LINE.length);
      sim.v = 0; sim.a = 0; doorOpen = 1; go('closing'); if (from === 'platform') sim.t = -.9; held = false; clapped = false; crumpled = false;
      station.position.x = 0; lamps.forEach(l => (l.visible = false));
    },
    camera(g: Game) { const room = Math.max(1.5, W / 2 + .5 - g.stage.halfWidth(22.5)); g.stage.want = { x: clamp(g.hero.body.x * (room > 1.5 ? 1 : reducedMotion ? 0 : .3), -room, room), y: 1.75, z: 0, dist: 22.5, pitch: .13, yaw: 0 }; },
    onA(g: Game) {
      // In the hold window, A reaches for the nearest strap; while hanging, A lets go.
      if (hold) return true;
      if (!holdWindow() || g.near) return false;
      let best = null, bd = R.reach;
      for (const s of straps) { const d = Math.abs(s.x - g.hero.body.x); if (d < bd) { bd = d; best = s; } }
      if (!best) return false;
      hold = best; held = true; sfx.grip();
      const s = best; g.hero.hang = () => ({ x: s.mesh.position.x + Math.sin(s.th) * R.strapL, y: R.railY - Math.cos(s.th) * R.strapL - 1.42 });
      s.w += -g.hero.body.vx * .5;
      return true;
    },
    onTap(g: Game) { return self.onA(g); },
    exit() { rumble.set(0); },
    update(dt: number, g: Game) {
      const t0 = sim.t; sim.t += dt;
      const ph = sim.phase;
      // Phases.
      if (ph === 'closing') {
        if (t0 <= 0 && sim.t > 0) { sfx.doors(); [0, .23, .46].forEach(at => setTimeout(() => sfx.tick(true), at * 1000)); }
        if (sim.t > 0) doorOpen = Math.max(0, doorOpen - dt / R.closing);
        if (sim.t > R.closing) { go('chime'); sfx.chime(); buzz(15); g.emit('ride', rideNo); } }
      else if (ph === 'chime') { if (sim.t > R.chime) { go('accel'); g.stage.nudge(-.22, 0); sfx.lurch(); } }
      else if (ph === 'accel') { sim.a = R.a; if (sim.t > R.accel) { go('cruise'); sim.a = 0; endHold(g); crestHidden = false; setStation(sim.at); } }
      else if (ph === 'cruise') { sim.a = Math.sin(sim.t * 2.3) * .25; if (sim.t > R.cruise) { go('warn'); setSign('Arriving', sim.at); sfx.jingle(LINE[sim.at].jingle); g.emit('arriving', sim.at); } }
      else if (ph === 'warn') { sim.a = 0; if (sim.t > R.chime) { go('brake'); sfx.squeal(); g.stage.nudge(.12, 0); sim.stopAt = sim.dist + sim.v * sim.v / (2 * R.a * 1.1); } }
      else if (ph === 'brake') {
        sim.a = -R.a * 1.1;
        if (sim.v + sim.a * dt <= 0) { sim.v = 0; sim.a = 0; go('stand'); g.stage.shake(.4); crests.forEach(c => c.settle.kick(1)); g.stage.nudge(.26, 0); buzz(30); sfx.doors(); noise({ d: .3, f: 300, q: .7, v: .4 }); endHold(g); folk.forEach(f => f.jolt.kick(-4)); setSign('This stop', sim.at); g.emit('stand', sim.at); }
      } else if (ph === 'stand') {
        doorOpen = Math.min(1, doorOpen + dt * 2.2);
        // The doors wait at the first stop ever, and at the terminus; anywhere else they close after the dwell.
        const waits = !g.save.firstStop || LINE[sim.at].id === 'home';
        if (!waits && !leaving) {
          const left = R.dwell + R.warn - sim.t;
          // The last 2 s: the doors' ticks, four a second (the chime means only 'brace').
          hurry = left < R.warn;
          if (hurry) { const k = Math.floor((R.warn - left) * 4); if (k !== tickN) { tickN = k; sfx.tick(true); } }
          if (left <= 0) { hurry = false; tickN = -1; if (!missedOnce) { missedOnce = true; setTimeout(() => g.say('…that was my stop.'), 600); } sim.at = (sim.at + 1) % LINE.length; g.save.next = sim.at; setSign('Next stop', sim.at); go('closing'); doorOpen = 1; g.emit('missed'); }
        }
      }
      // The pop-up: the back sheet stands first, the front reaches upright on the stop; on the pull-away they fold.
      const tau = sim.v / (R.a * 1.1), phz = sim.phase;
      for (const cr of crests) {
        let k = 0;
        if (crestHidden) k = 0;
        else if (phz === 'brake') k = reducedMotion ? 0 : 1 - (tau - cr.lead) / .5;
        else if (phz === 'stand' || phz === 'closing' || phz === 'chime') k = 1;
        else if (phz === 'accel') k = reducedMotion ? 0 : 1 - (sim.t - cr.lead) / .42;
        k = clamp(k, 0, 1);
        const idx = Math.floor(k * 6);
        cr.c.visible = idx > 0; cr.c.rotation.x = POSE[idx] + cr.settle.step(dt) * .07;
        if (idx > 0 && !cr.shown && phz === 'brake') { cr.shown = true; sfx.paper(); }
        if (idx === 0) cr.shown = false;
      }
      // Speed and distance; the tunnel lamps rush past, and the station slides in to stand at the windows.
      sim.v = Math.max(0, sim.v + sim.a * dt);
      sim.dist += sim.v * dt;
      const vis = sim.v * 4.5;
      lamps.forEach((l, i) => { l.visible = sim.phase !== 'stand' && sim.phase !== 'closing'; l.position.x = ((-30 + i * 5 - sim.dist * (reducedMotion ? 1.2 : 4.5)) % 60 + 90) % 60 - 30; });
      if (sim.phase === 'brake' || sim.phase === 'stand') station.position.x = (sim.stopAt - sim.dist) * 4.5 * (sim.phase === 'stand' ? 0 : 1);
      else if (sim.phase === 'closing' || sim.phase === 'chime') station.position.x = 0;
      else station.position.x = -sim.dist * 4.5 - 1;
      station.visible = Math.abs(station.position.x) < 60;
      tunnel.visible = !station.visible || Math.abs(station.position.x) > 1;
      void vis;
      // Rumble as loud as it is fast; two knocks at each rail joint.
      rumble.set(Math.min(.5, .035 + sim.v * .07), .7 + sim.v * .12);
      if (sim.dist - lastJoint > R.joint && sim.v > 1) { lastJoint = sim.dist; noise({ d: .05, f: 160, q: 1, v: .35 }); noise({ d: .05, f: 150, q: 1, v: .3, at: .11 }); noise({ d: .02, f: 1400, q: 3, v: .16 }); noise({ d: .02, f: 1400, q: 3, v: .13, at: .11 }); folk.forEach(f => f.jolt.kick(.6)); }
      // The bar: amber pulses with the brace notes, coral at four a second while the doors close.
      const ptn = (ph === 'chime' || ph === 'warn') && sim.t < .6 && sim.t % .2 < .13 ? '#f6b73c' : hurry && Math.floor(sim.t * 8) % 2 ? '#e8552d' : null;
      barSet(reducedMotion && hurry ? '#e8552d' : ptn);
      const dOpen = pinch ?? doorOpen; doorL.position.x = -.45 - dOpen * .82; doorR.position.x = .45 + dOpen * .82;
      // The push: -a acts on everything loose. He slides unless he is holding on.
      g.hero.push = -sim.a * R.throw; g.hero.grip = R.grip;
      for (const s of straps) {
        const alpha = -(9.8 / R.strapL) * Math.sin(s.th) - (sim.a / R.strapL) * Math.cos(s.th) - 1.4 * s.w;
        s.w += alpha * dt; s.th += s.w * dt;
        // Reduced motion: no swing, a held lean against the force (it still says which way the train pulls).
        if (reducedMotion) { s.th += (Math.atan(-sim.a / 9.8) - s.th) * Math.min(1, dt * 6); s.w = 0; }
        s.mesh.rotation.z = s.th;
      }
      // Hanging: the strap creaks each time its swing turns.
      if (hold) { const sg = Math.sign(hold.w); if (sg && sg !== creakSign) { creakSign = sg; if (Math.abs(hold.th) > .06) sfx.creak(); } }
      // Souvenirs slide along their seat and knock at its ends.
      for (const sv of souvenirs) {
        if (!sv.m.visible) continue;
        sv.v += -sim.a * .9 * dt; sv.v *= Math.exp(-dt * (Math.abs(sim.a) > .5 ? .6 : 3)); sv.x += sv.v * dt;
        if (sv.x < sv.x0 || sv.x > sv.x1) { sv.x = Math.max(sv.x0, Math.min(sv.x1, sv.x)); if (Math.abs(sv.v) > .4) { noise({ d: .04, f: 700 + souvenirs.indexOf(sv) * 200, q: 2, v: Math.min(.3, Math.abs(sv.v) * .2) }); } sv.v *= -.35; }
        sv.m.position.x = sv.x; sv.m.rotation.z = reducedMotion ? 0 : -sv.v * .15;
      }
      // His head knocks a strap when he jumps under it.
      if (!hold && g.time > quietStraps && g.hero.body.vy > 2 && g.hero.body.y > .5) for (const s of straps) if (Math.abs(s.x - g.hero.body.x) < .4 && Math.abs(s.w) < 2) { s.w += 4 * (Math.random() < .5 ? 1 : -1); sfx.bonk(.2); }
      // Passengers jolt with the train; standees grab straps half a second before the pull.
      for (const f of folk) { f.jolt.kick(-sim.a * dt * 2.5); f.c.rotation.z = reducedMotion ? clamp(-sim.a * .03, -.1, .1) : f.jolt.step(0, dt) * .12; }
      const win = holdWindow();
      if (win && !wasWin) { for (const s of straps) s.w += (Math.random() - .5) * 1.2; }
      wasWin = win;
      for (const s of straps) (s.ring.material as THREE.MeshStandardMaterial).color.set(win ? '#e8552d' : '#f6b73c');
      // Until he has held on once, from the second ride, the nearest strap says so.
      if (win && !hold && rideNo >= 2 && g.save.holds === 0 && !g.near) {
        const st = straps.reduce((a, b) => (Math.abs(b.x - g.hero.body.x) < Math.abs(a.x - g.hero.body.x) ? b : a));
        g.pins.show('holdhint', `<div class="prompt"><b>A</b>Hold on</div>`, new THREE.Vector3(st.x, R.railY + .45, .1), 'pin');
      } else g.pins.hide('holdhint');
      for (const s of standees) {
        const want = holdWindow() ? 1 : 0;
        s.hold += (want - s.hold) * Math.min(1, dt * 10);
        const st = straps.reduce((a, b) => (Math.abs(b.x - s.x) < Math.abs(a.x - s.x) ? b : a));
        s.c.position.x = s.x + Math.sin(st.th) * R.strapL * s.hold; s.c.position.y = s.hold * .35 + s.cheer; s.cheer = Math.max(0, s.cheer - dt * 1.2); s.arm.visible = s.hold > .5;
      }
      // Thrown into the end wall: he crumples flat and pops back.
      if (!hold && Math.abs(g.hero.body.vx) > 2.4 && (g.hero.body.x < self.lane.x0 + .35 || g.hero.body.x > self.lane.x1 - .35)) { const side = Math.sign(g.hero.body.x); g.hero.crumple(side); g.hero.body.x = side * (W / 2 - .56); g.hero.body.vx = 0; sfx.crumple(); g.freeze = .083; g.stage.shake(.55); g.fx.burst(g.hero.body.x, 1, .1, ['#fffaf0', '#d9dde2'], 12, .5); setTimeout(() => sfx.pop(), 360);
        const near = folk.reduce((a, b) => (Math.abs(b.x - g.hero.body.x) < Math.abs(a.x - g.hero.body.x) ? b : a)); g.pins.show('oops', '<span>!</span>', new THREE.Vector3(near.x, 1.75, backZ + .55), 'tag', 600); folk.forEach(f => f.jolt.kick(Math.sign(g.hero.body.x - f.x) * 3)); g.emit('crumple');
        if (!crumpled && g.save.holds === 0) { crumpled = true; g.say('Note to self: grab a strap.'); } }
      // The first ride's ad panel says hello by itself.
      if (rideNo === 1 && !adLine) { const n = Math.min(HELLO.length - 1, Math.floor((sim.phase === 'closing' || sim.phase === 'chime' ? 0 : (sim.phase === 'accel' ? .5 : sim.phase === 'cruise' ? 1 + sim.t / 2 : 3)))); if (n !== ad) { ad = n; adCard.redraw(); sfx.paper(); } }
      if (sim.phase !== 'stand') leaving = false;
    }
  };
  let leaving = false, wasWin = false, crumpled = false, hurry = false, tickN = -1, missedOnce = false, quietStraps = 0, creakSign = 0, pinch: number | null = null;
  function endHold(g: Game) {
    if (hold && held) {
      g.save.holds++;
      g.hero.hang = null; g.hero.kick(0, 4.5); hold = null; sfx.jump(); buzz(8); quietStraps = g.time + .6;
      if (g.punch('line', 'hold', true, 120)) { g.say('Held on. Like a local.'); }
      if (!clapped) { clapped = true; standees.forEach(s => (s.cheer = .4)); setTimeout(() => sfx.clap(), 500); }
    }
    held = false;
  }
  async function getOff(g: Game) {
    leaving = true; g.busy = true;
    await slipThrough(g, { x: 0, z1: -1.7, last: hurry, pinch: v => (pinch = v), seam: { x: 0, y: 1, z: -1.6 } });
    pinch = null;
    g.save.firstStop = true;
    g.emit('getoff', sim.at);
  }
  return self as Place & { sim: typeof sim };
}
