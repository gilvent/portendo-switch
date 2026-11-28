import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { clamp, Spring } from '../core/math.ts';
import { bed, buzz, noise, tone } from '../core/audio.ts';
import { sfx } from '../game/sfx.ts';
import { HELLO, LINE } from '../game/content.ts';
import { reducedMotion } from '../core/stage.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';

// The hub: the inside of a moving car. One force, the train's acceleration, moves everything loose at once. The ride
// runs by itself (chime, pull-away, cruise, chime, brake, doors); holding a strap through the pull-away or the brake is
// the one skill, and missing it throws him down the car, which is the joke and the lesson.
export const RIDE = {
  closing: .7, chime: .8, accel: 1.2, cruise: 4, brake: 1.5, dwell: 6, warn: 2,
  a: 3.2,            // m/s² while pulling away and braking
  throw: 4.6,        // how hard the train's push acts on him
  grip: .12,         // how well his shoes hold on the vinyl
  reach: 1.45,        // A this close to a strap grabs it
  strapL: .55, railY: 2.95, joint: 9
};
type Phase = 'closing' | 'chime' | 'accel' | 'cruise' | 'warn' | 'brake' | 'stand' | 'leave';
const W = 15.6, H = 3.3, D = 3.2;

export function trainCar(): Place & { sim: { phase: Phase; t: number; v: number; a: number; at: number } } {
  const R = RIDE, group = new THREE.Group();
  // Shell: floor, back wall with windows and the doors in the middle, end walls, a strip of ceiling.
  group.add(box(W + .6, .3, D, '#9aa3ad', 0, -.3, -.2));
  group.add(box(W + .6, .04, .2, '#e8552d', 0, -.04, D / 2 - .2));
  const backZ = -1.75;
  group.add(box(W, 1.05, .14, '#e9edf1', 0, 0, backZ), box(W, .95, .14, '#e9edf1', 0, 2.35, backZ));
  for (const x of [-7.3, -4.4, -1.45, 1.45, 4.4, 7.3]) group.add(box(x === -1.45 || x === 1.45 ? .5 : .4, 1.3, .14, '#e9edf1', x, 1.05, backZ));
  group.add(box(.3, H, D, '#dfe4ea', -W / 2 - .15, 0, -.2), box(.3, H, D, '#dfe4ea', W / 2 + .15, 0, -.2));
  group.add(box(W, .12, .9, '#f4f6f8', 0, H, backZ + .4));
  // Seats under the windows.
  for (const x of [-5.85, -2.95, 2.95, 5.85]) group.add(box(2.5, .48, .6, '#2f6f9f', x, 0, backZ + .38), box(2.5, .5, .12, '#2f6f9f', x, .48, backZ + .12));
  // The doors.
  const doorL = box(.86, 2.25, .06, '#cfd5dc', -.45, 0, backZ + .1), doorR = box(.86, 2.25, .06, '#cfd5dc', .45, 0, backZ + .1);
  group.add(doorL, doorR, box(1.9, .1, .2, '#3d444e', 0, 2.25, backZ + .1));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.08, 12, 8), new THREE.MeshStandardMaterial({ color: '#f6b73c', emissive: '#000' }));
  lamp.position.set(.85, 2.45, backZ + .15); group.add(lamp);
  // Over the doors: the next-stop sign.
  let signText = { top: 'Next stop', name: LINE[0].name, color: LINE[0].color };
  const sign = card(1.9, .5, (g, Wd, Ht) => {
    rrect(g, 0, 0, Wd, Ht, 10, '#1d2026'); label(g, signText.top, Wd / 2, Ht * .27, Ht * .22, '#9aa3ad', 'center', 600);
    label(g, signText.name, Wd / 2, Ht * .68, Ht * .4, signText.color === '#e8552d' ? '#ff8a5c' : '#ffd27a', 'center', 700);
  }, { rim: .02 });
  sign.position.set(0, 2.45, backZ + .12); group.add(sign);
  const setSign = (top: string, i: number) => { const s = LINE[i]; if (signText.top !== top || signText.name !== s.name) { signText = { top, name: s.name, color: s.color }; sign.redraw(); } };
  // The ad panel over the left seats: on the first ride it says hello, a line at a time.
  let ad = 0;
  const adCard = card(2.6, .62, (g, Wd, Ht) => { rrect(g, 0, 0, Wd, Ht, 10, '#f6b73c'); label(g, HELLO[ad], Wd / 2, Ht / 2, Ht * .42, '#23262b', 'center', 700); }, { rim: .03 });
  adCard.position.set(-4.4, 2.42, backZ + .12); group.add(adCard);
  // Three poster frames, empty at first: each project he visits puts its poster up.
  let visited: string[] = [];
  const POSTER: Record<string, { mark: string; line: string }> = { blibli: { mark: '🛍', line: 'Product pages' }, moperty: { mark: '⌂', line: 'Homes near you' }, radjastone: { mark: '◆', line: 'Natural stone' } };
  const posters = [2.6, 4.6, 6.6].map((x, j) => { const c = card(1.7, .55, (g, Wd, Ht) => {
    const id = visited[j], st = LINE.find(l => l.id === id);
    if (!st) { rrect(g, 0, 0, Wd, Ht, 8, '#d4d9df'); g.setLineDash([6, 5]); g.strokeStyle = '#b3bac2'; g.lineWidth = 3; g.strokeRect(8, 8, Wd - 16, Ht - 16); return; }
    rrect(g, 0, 0, Wd, Ht, 8, st.color); label(g, POSTER[id].mark, Ht * .45, Ht / 2, Ht * .5, '#fffaf0'); label(g, st.name, Ht * .9, Ht * .38, Ht * .3, '#fffaf0', 'left', 700); label(g, POSTER[id].line, Ht * .9, Ht * .7, Ht * .2, '#fffaf0cc', 'left', 500);
  }, { rim: .02 }); c.position.set(x, 2.45, backZ + .12); group.add(c); return c; });
  // The clock over the far seats: the day goes on, ride by ride. (Underground has no daylight; the clock is the day.)
  const TIMES = ['8:52', '12:10', '15:24', '18:47', '21:05', '22:30'];
  let clockText = TIMES[0];
  const clock = card(.62, .62, (g, Wd, Ht) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(Wd / 2, Ht / 2, Wd / 2, 0, 7); g.fill(); g.strokeStyle = '#3d444e'; g.lineWidth = 6; g.stroke(); label(g, clockText, Wd / 2, Ht / 2, Ht * .26, '#23262b', 'center', 700); }, { rim: .02 });
  clock.position.set(-6.75, 2.32, backZ + .12); group.add(clock);
  // Souvenirs from each stop ride on the free end of a seat, and slide with the train like everything loose.
  const souvenirs = [
    { id: 'blibli', x0: 1.75, x1: 3.05, m: box(.32, .38, .18, '#0092da') },
    { id: 'moperty', x0: 4.65, x1: 5.85, m: box(.26, .12, .06, '#f6b73c') },
    { id: 'radjastone', x0: -4.15, x1: -2.85, m: box(.34, .06, .26, '#d8c390') }
  ].map(sv => { sv.m.position.set((sv.x0 + sv.x1) / 2, .48, backZ + .4); sv.m.visible = false; group.add(sv.m); return { ...sv, x: (sv.x0 + sv.x1) / 2, v: 0 }; });
  // Outside: the tunnel's lamps rush past; at a stop, the station wall stands in the windows with its name.
  const outside = new THREE.Group(); outside.position.z = -2.9; group.add(outside);
  const tunnel = box(60, 3.6, .1, '#101318', 0, -.1, -.6); tunnel.castShadow = false; outside.add(tunnel);
  const lamps: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.7, .12, .05), new THREE.MeshBasicMaterial({ color: '#ffe3a0' })); l.position.set(-30 + i * 5, 2.2, -.5); outside.add(l); lamps.push(l); }
  const station = new THREE.Group(); outside.add(station);
  const stWall = box(40, 3.6, .1, '#dfe2e6', 0, -.1, -.4); stWall.castShadow = false; station.add(stWall);
  const stBand = box(40, .4, .12, '#0092da', 0, .9, -.38); station.add(stBand);
  let stName = LINE[0];
  const stSigns = [-9, 0, 9].map(x => { const c = card(2.8, .7, (g, Wd, Ht) => { rrect(g, 0, 0, Wd, Ht, 10, '#fffaf0'); g.fillStyle = stName.color; g.fillRect(0, Ht - 12, Wd, 12); label(g, stName.name, Wd / 2, Ht * .45, Ht * .45, '#23262b', 'center', 700); }, { rim: .02 }); c.position.set(x, 1.45, -.3); station.add(c); return c; });
  // Nothing outside shows past the car's end walls.
  const clip = [new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2)];
  const clipAll = () => outside.traverse(o => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.clippingPlanes = clip; });
  clipAll();
  const setStation = (i: number) => { stName = LINE[i]; (stBand.material as THREE.MeshStandardMaterial).color.set(stName.color); stSigns.forEach(c => c.redraw()); };
  // Straps over the aisle, clear of the doors.
  const straps: { x: number; th: number; w: number; mesh: THREE.Group }[] = [];
  for (let x = -6.6; x <= 6.61; x += 1.1) {
    if (Math.abs(x) < .9) continue;
    const m = new THREE.Group(); m.position.set(x, R.railY, .1);
    const band = box(.05, R.strapL - .12, .03, '#e9edf1', 0, -(R.strapL - .12), 0); const ring = new THREE.Mesh(new THREE.TorusGeometry(.09, .022, 6, 14), new THREE.MeshStandardMaterial({ color: '#f6b73c' }));
    ring.position.y = -R.strapL + .04; ring.castShadow = true; m.add(band, ring); group.add(m); straps.push({ x, th: 0, w: 0, mesh: m });
  }
  group.add(box(13.8, .05, .05, '#b7bec7', 0, R.railY, .1));
  // Passengers: seated ones jolt; two standees grab their straps just before the pull, so a watcher learns from them.
  const folk = [-6.6, -5.2, -2.3, 3.6, 6.4].map((x, i) => {
    const c = card(.85, 1.2, (g, Wd, Ht) => { const s = Wd / 85; g.fillStyle = ['#7b4b8f', '#3f7a5b', '#a0522d', '#35577f', '#8f6b3f'][i]; g.beginPath(); g.roundRect(18 * s, Ht - 72 * s, 50 * s, 60 * s, 10 * s); g.fill(); g.fillStyle = ['#f0c8a0', '#c68e63', '#f3d2b3', '#8d5b3c', '#e9bf98'][i]; g.beginPath(); g.ellipse(43 * s, Ht - 94 * s, 24 * s, 24 * s, 0, 0, 7); g.fill(); g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(43 * s, Ht - 104 * s, 25 * s, 14 * s, 0, Math.PI, 0); g.fill(); g.fillRect(34 * s, Ht - 96 * s, 4 * s, 5 * s); g.fillRect(48 * s, Ht - 96 * s, 4 * s, 5 * s); });
    c.position.set(x, .25, backZ + .55); group.add(c); return { c, x, jolt: new Spring(0, 120, 7), delay: Math.abs(x) * .03 };
  });
  const standees = [-3.85, 4.95].map((x, i) => {
    const c = card(.95, 1.45, (g, Wd, Ht) => { const s = Wd / 95; g.fillStyle = i ? '#4a5a6a' : '#6a4a5a'; g.beginPath(); g.roundRect(22 * s, Ht - 80 * s, 50 * s, 64 * s, 10 * s); g.fill(); g.fillRect(64 * s, Ht - 126 * s, 9 * s, 50 * s); g.fillStyle = '#f0c8a0'; g.beginPath(); g.ellipse(47 * s, Ht - 104 * s, 24 * s, 24 * s, 0, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.ellipse(47 * s, Ht - 114 * s, 25 * s, 13 * s, 0, Math.PI, 0); g.fill(); g.fillRect(40 * s, Ht - 106 * s, 4 * s, 5 * s); g.fillRect(54 * s, Ht - 106 * s, 4 * s, 5 * s); });
    c.position.set(x, 0, -.3); group.add(c); return { c, x, hold: 0 };
  });
  // The sim.
  const sim = { phase: 'stand' as Phase, t: 0, v: 0, a: 0, at: 0, dist: 0, stopAt: 0, express: false };
  const rumble = bed(180);
  let hold: typeof straps[number] | null = null, held = false, lastJoint = 0, doorOpen = 1, clapped = false, rideNo = 0;
  const holdWindow = () => sim.phase === 'chime' || sim.phase === 'accel' || sim.phase === 'warn' || sim.phase === 'brake';
  const door: Mech = {
    id: 'doors', x: 0, reach: 1.25, at: new THREE.Vector3(0, 2.0, -1), up: true,
    label: () => `Get off: ${LINE[sim.at].name}`, on: () => sim.phase === 'stand' && doorOpen > .9, use: g => void getOff(g)
  };
  const go = (p: Phase) => { sim.phase = p; sim.t = 0; };
  const self = {
    id: 'car', group, lane: { x0: -W / 2 + .1, x1: W / 2 - .1, z: .1 }, solids: [], mechs: [door], sim,
    enter(g: Game, from: string | null) {
      g.hero.place(0, .1, 1); g.hero.grip = R.grip;
      g.stage.scene.background = new THREE.Color('#0b0d10');
      rideNo = ++g.save.rides; ad = 0; adCard.redraw();
      visited = g.save.visited.filter(v => v !== 'home'); posters.forEach(p => p.redraw());
      clockText = TIMES[Math.min(TIMES.length - 1, rideNo - 1)]; clock.redraw();
      souvenirs.forEach(sv => (sv.m.visible = visited.includes(sv.id as never)));
      // Boarding (from the platform or a station): the doors shut behind him and the train pulls away at once.
      sim.at = from === 'platform' ? 0 : g.save.next; setStation(sim.at); setSign('Next stop', sim.at);
      sim.v = 0; sim.a = 0; doorOpen = 1; go('closing'); held = false; clapped = false;
      station.position.x = 0; lamps.forEach(l => (l.visible = false));
    },
    camera(g: Game) { g.stage.want = { x: clamp(g.hero.body.x * .12, -1, 1), y: 1.75, z: 0, dist: 22.5, pitch: .13, yaw: 0 }; },
    onA(g: Game) {
      // In the hold window, A reaches for the nearest strap; while hanging, A lets go.
      if (hold) { letGo(g, false); return true; }
      if (!holdWindow() || g.near) return false;
      let best = null, bd = R.reach;
      for (const s of straps) { const d = Math.abs(s.x - g.hero.body.x); if (d < bd) { bd = d; best = s; } }
      if (!best) return false;
      hold = best; held = true; sfx.pop(); buzz(10);
      const s = best; g.hero.hang = () => ({ x: s.mesh.position.x + Math.sin(s.th) * R.strapL, y: R.railY - Math.cos(s.th) * R.strapL - 1.42 });
      s.w += -g.hero.body.vx * .5;
      return true;
    },
    update(dt: number, g: Game) {
      sim.t += dt;
      const ph = sim.phase;
      // Phases.
      if (ph === 'closing') { doorOpen = Math.max(0, doorOpen - dt / R.closing); if (sim.t > R.closing) { go('chime'); sfx.chime(); g.emit('ride', rideNo); } }
      else if (ph === 'chime') { if (sim.t > R.chime) { go('accel'); g.stage.nudge(-.15, 0); } }
      else if (ph === 'accel') { sim.a = R.a; if (sim.t > R.accel) { go('cruise'); sim.a = 0; endHold(g); } }
      else if (ph === 'cruise') { sim.a = Math.sin(sim.t * 2.3) * .25; if (sim.t > R.cruise) { go('warn'); setSign('Arriving', sim.at); const j = LINE[sim.at].jingle; j.forEach((f, i) => tone({ f, d: .5, type: 'sine', v: .2, at: i * .22 })); g.emit('arriving', sim.at); } }
      else if (ph === 'warn') { sim.a = 0; if (sim.t > R.chime) { go('brake'); sim.stopAt = sim.dist + sim.v * sim.v / (2 * R.a * 1.1); } }
      else if (ph === 'brake') {
        sim.a = -R.a * 1.1;
        if (sim.v + sim.a * dt <= 0) { sim.v = 0; sim.a = 0; go('stand'); g.stage.shake(.25); g.stage.nudge(.2, 0); sfx.doors(); noise({ d: .3, f: 300, q: .7, v: .4 }); endHold(g); folk.forEach(f => f.jolt.kick(-4)); setSign('This stop', sim.at); g.emit('stand', sim.at); }
      } else if (ph === 'stand') {
        doorOpen = Math.min(1, doorOpen + dt * 2.2);
        // The doors wait at the first stop ever, and at the terminus; anywhere else they close after the dwell.
        const waits = !g.save.firstStop || LINE[sim.at].id === 'home';
        if (!waits && !leaving) {
          const left = R.dwell + R.warn - sim.t;
          (lamp.material as THREE.MeshStandardMaterial).emissive.set(left < R.warn && Math.floor(sim.t * 6) % 2 ? '#f6b73c' : '#000');
          if (left < R.warn && !warned) { warned = true; sfx.chime(); }
          if (left <= 0) { warned = false; (lamp.material as THREE.MeshStandardMaterial).emissive.set('#000'); sim.at = (sim.at + 1) % LINE.length; g.save.next = sim.at; setSign('Next stop', sim.at); go('closing'); doorOpen = 1; g.emit('missed'); }
        }
      }
      // Speed and distance; the tunnel lamps rush past, and the station slides in to stand at the windows.
      sim.v = Math.max(0, sim.v + sim.a * dt);
      sim.dist += sim.v * dt;
      const vis = sim.v * 4.5;
      lamps.forEach((l, i) => { l.visible = sim.phase !== 'stand' && sim.phase !== 'closing'; l.position.x = ((-30 + i * 5 - sim.dist * 4.5) % 60 + 90) % 60 - 30; });
      if (sim.phase === 'brake' || sim.phase === 'stand') station.position.x = (sim.stopAt - sim.dist) * 4.5 * (sim.phase === 'stand' ? 0 : 1);
      else if (sim.phase === 'closing' || sim.phase === 'chime') station.position.x = 0;
      else station.position.x = -sim.dist * 4.5 - 1;
      station.visible = Math.abs(station.position.x) < 60;
      tunnel.visible = !station.visible || Math.abs(station.position.x) > 1;
      void vis;
      // Rumble as loud as it is fast; two knocks at each rail joint.
      rumble.set(Math.min(.5, sim.v * .06), .7 + sim.v * .1);
      if (sim.dist - lastJoint > R.joint && sim.v > 1) { lastJoint = sim.dist; noise({ d: .05, f: 160, q: 1, v: .35 }); noise({ d: .05, f: 150, q: 1, v: .3, at: .11 }); }
      doorL.position.x = -.45 - doorOpen * .82; doorR.position.x = .45 + doorOpen * .82;
      // The push: -a acts on everything loose. He slides unless he is holding on.
      g.hero.push = -sim.a * R.throw; g.hero.grip = R.grip;
      for (const s of straps) {
        const alpha = -(9.8 / R.strapL) * Math.sin(s.th) - (sim.a / R.strapL) * Math.cos(s.th) - 1.4 * s.w;
        s.w += alpha * dt; s.th += s.w * dt; s.mesh.rotation.z = reducedMotion ? 0 : s.th;
      }
      // Souvenirs slide along their seat and knock at its ends.
      for (const sv of souvenirs) {
        if (!sv.m.visible) continue;
        sv.v += -sim.a * .9 * dt; sv.v *= Math.exp(-dt * (Math.abs(sim.a) > .5 ? .6 : 3)); sv.x += sv.v * dt;
        if (sv.x < sv.x0 || sv.x > sv.x1) { sv.x = Math.max(sv.x0, Math.min(sv.x1, sv.x)); if (Math.abs(sv.v) > .4) { noise({ d: .04, f: 900, q: 2, v: Math.min(.3, Math.abs(sv.v) * .2) }); } sv.v *= -.35; }
        sv.m.position.x = sv.x; sv.m.rotation.z = reducedMotion ? 0 : -sv.v * .15;
      }
      // His head knocks a strap when he jumps under it.
      if (!hold && g.hero.body.vy > 2 && g.hero.body.y > .5) for (const s of straps) if (Math.abs(s.x - g.hero.body.x) < .4 && Math.abs(s.w) < 2) { s.w += 4 * (Math.random() < .5 ? 1 : -1); sfx.bonk(.2); }
      // Passengers jolt with the train; standees grab straps half a second before the pull.
      for (const f of folk) { f.jolt.kick(-sim.a * dt * 2.5); f.c.rotation.z = reducedMotion ? 0 : f.jolt.step(0, dt) * .12; }
      for (const s of standees) {
        const want = holdWindow() || (sim.phase === 'closing' && sim.t > R.closing - .5) ? 1 : 0;
        s.hold += (want - s.hold) * Math.min(1, dt * 10);
        const st = straps.reduce((a, b) => (Math.abs(b.x - s.x) < Math.abs(a.x - s.x) ? b : a));
        s.c.position.x = s.x + Math.sin(st.th) * R.strapL * s.hold; s.c.position.y = s.hold * .12;
      }
      // Thrown into the end wall: he crumples flat and pops back.
      if (!hold && Math.abs(g.hero.body.vx) > 2.4 && (g.hero.body.x < self.lane.x0 + .35 || g.hero.body.x > self.lane.x1 - .35)) { g.hero.crumple(); g.hero.body.vx = 0; sfx.bonk(.9); g.stage.shake(.3); g.fx.burst(g.hero.body.x, 1, .1, ['#fffaf0', '#d9dde2'], 6, .5); g.emit('crumple'); }
      // The first ride's ad panel says hello by itself.
      if (rideNo === 1) { const n = Math.min(HELLO.length - 1, Math.floor((sim.phase === 'closing' || sim.phase === 'chime' ? 0 : (sim.phase === 'accel' ? .5 : sim.phase === 'cruise' ? 1 + sim.t / 2 : 3)))); if (n !== ad) { ad = n; adCard.redraw(); sfx.paper(); } }
      if (sim.phase !== 'stand') leaving = false;
    }
  };
  let warned = false, leaving = false;
  function endHold(g: Game) {
    if (hold && held) {
      g.save.holds++;
      g.hero.hang = null; g.hero.kick(0, 4.5); hold = null; sfx.jump();
      if (g.punch('line', 'hold', true)) { g.caption('Held on! You ride like a local.', new THREE.Vector3(g.hero.body.x, 2.6, .1)); }
      if (!clapped) { clapped = true; standees[0].c.position.y += .3; }
    }
    held = false;
  }
  function letGo(g: Game, kept: boolean) { if (!hold) return; hold = null; held = kept; g.hero.hang = null; g.hero.body.vy = 1; }
  async function getOff(g: Game) {
    leaving = true; g.busy = true;
    const h = g.hero, x0 = h.body.x, t0 = performance.now();
    await new Promise<void>(res => { const f = () => { const k = Math.min(1, (performance.now() - t0) / 360); h.body.x = x0 * (1 - k); h.body.z = .1 - 1.8 * k; h.thin = k * .85; if (k < 1) requestAnimationFrame(f); else res(); }; f(); });
    g.save.firstStop = true;
    g.emit('getoff', sim.at);
  }
  return self as Place & { sim: typeof sim };
}
