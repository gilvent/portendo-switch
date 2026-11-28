import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { Spring } from '../core/math.ts';
import { input } from '../core/input.ts';
import { sfx } from '../game/sfx.ts';
import { bed, buzz, noise } from '../core/audio.ts';
import { reducedMotion } from '../core/stage.ts';
import { LINE, PERSON } from '../game/content.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';
import type { Solid } from '../game/body.ts';

// The opening, on the handheld's screen: one platform, one job. The station sign says who; the departure board is the
// only tutorial voice; the shut gate teaches A; the train arrives as wind; the doors are the first, soft, challenge.
export const PLATFORM = {
  gateX: -2, doorX: 4.6, arrive: 2.5, doorsOpen: 8, nextTrain: 2.5, wind: .3
};
type TrainState = 'away' | 'arriving' | 'open' | 'closing' | 'leaving';

export function platform(): Place & { train: { state: TrainState; x: number; t: number } } {
  const P = PLATFORM;
  const group = new THREE.Group();
  // Floor, edge, track bed, far wall.
  group.add(box(16.5, .4, 3.8, '#c9ccd1', 0, -.4, -.35));
  group.add(box(16.5, .02, .25, '#f2c230', 0, 0, -2.1));
  group.add(box(16.5, .2, 3, '#4a4d52', 0, -1.5, -3.8));
  const wall = box(30, 6, .3, '#dfe2e6', 0, -1.4, -6.2); wall.castShadow = false; group.add(wall);
  group.add(box(30, .5, .32, '#e8552d', 0, 1.0, -6.2));
  // Stairs he came down, at the left.
  for (let i = 0; i < 6; i++) group.add(box(1.4, .3 + i * .3, .6, '#b9bdc3', -8.2 + i * .0, 0, -1.6 + i * .0).translateX(-.0));
  // The station sign: who and what, before any input.
  const sign = new THREE.Group(); sign.position.set(-3.6, 4.1, -1.5);
  const signCard = card(4.2, 1.35, (g, W, H) => {
    rrect(g, 0, 0, W, H, 18, '#fffaf0'); g.fillStyle = '#e8552d'; g.fillRect(0, H - 22, W, 12); g.fillStyle = '#35b58a'; g.fillRect(0, H - 10, W, 10);
    label(g, PERSON.name, W / 2, H * .36, H * .38, '#23262b', 'center', 700); label(g, PERSON.trade, W / 2, H * .72, H * .16, '#62676f', 'center', 600);
  });
  signCard.position.y = -1.35; signCard.rotation.x = 0;
  const rods = [-1.5, 1.5].map(x => { const r = box(.04, 1.2, .04, '#5c6168', x, -.15, 0); sign.add(r); return r; });
  void rods; sign.add(signCard); group.add(sign);
  const signSwing = new Spring(0, 30, 1.6);
  // The departure board: the only tutorial voice.
  const board = new THREE.Group(); board.position.set(3.4, 4.2, -1.5);
  let boardText = ['', ''];
  const boardCard = card(3.6, 1.05, (g, W, H) => {
    rrect(g, 0, 0, W, H, 12, '#1d2026');
    label(g, `To ${LINE[0].name}`, 20, H * .3, H * .24, '#f6b73c', 'left', 600); label(g, 'MRT', W - 20, H * .3, H * .18, '#f6b73c', 'right', 700);
    label(g, boardText[0], 20, H * .68, H * .25, '#ffd27a', 'left', 600); label(g, boardText[1], W - 20, H * .68, H * .2, '#ffd27a', 'right', 500);
  }, { rim: .02 });
  boardCard.position.y = -1.1; board.add(boardCard, box(.04, .9, .04, '#5c6168', -1.2, -.1, 0), box(.04, .9, .04, '#5c6168', 1.2, -.1, 0)); group.add(board);
  const say = (a: string, b = '') => { if (a !== boardText[0] || b !== boardText[1]) { boardText = [a, b]; boardCard.redraw(); } };
  // The gate: shut, it stops him. Two paddles that swing open.
  const gate = new THREE.Group(); gate.position.set(P.gateX, 0, 0);
  gate.add(box(.35, 1.05, .5, '#eef0f2', 0, 0, -.75), box(.35, 1.05, .5, '#eef0f2', 0, 0, .75));
  const reader = box(.25, .06, .25, '#35b58a', 0, 1.05, -.75); gate.add(reader);
  const paddles = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(0, .55, s * .5); const pd = box(.06, .5, .48, '#e8552d', 0, -.25, -s * .24); pv.add(pd); gate.add(pv); return { pv, s }; });
  group.add(gate);
  let gateOpen = false; const gateSpring = new Spring(0, 160, 10);
  const gateSolid: Solid = { x0: P.gateX - .2, x1: P.gateX + .2, z0: -2, z1: 2, h: 3, id: 'gate' };
  // A commuter dozing on the bench: free juice, not recorded.
  const bench = box(1.8, .45, .5, '#2f6f9f', 1.1, 0, -1.3); group.add(bench);
  const sleeper = card(.95, 1.25, (g, W, H) => {
    const s = W / 95;
    g.fillStyle = '#3a4150'; g.beginPath(); g.roundRect(22 * s, H - 70 * s, 52 * s, 50 * s, 10 * s); g.fill();
    g.fillStyle = '#f0c8a0'; g.beginPath(); g.ellipse(48 * s, H - 92 * s, 27 * s, 26 * s, 0, 0, 7); g.fill();
    g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(48 * s, H - 104 * s, 28 * s, 16 * s, 0, Math.PI, 0); g.fill();
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 2.5 * s; g.beginPath(); g.arc(38 * s, H - 90 * s, 5 * s, .3, Math.PI - .3); g.arc(58 * s, H - 90 * s, 5 * s, .3, Math.PI - .3); g.stroke();
    g.fillStyle = '#f4f1e8'; g.fillRect(14 * s, H - 62 * s, 66 * s, 36 * s); g.fillStyle = '#9aa0a8'; for (let i = 0; i < 4; i++) g.fillRect(20 * s, H - (56 - i * 8) * s, 54 * s, 3 * s);
  });
  sleeper.position.set(1.1, .3, -1.25); group.add(sleeper);
  let sleeperAwake = 0; const sleeperHop = new Spring(0, 200, 8);
  // The train: a long greybox car that slides in, its door lined up with the door mark.
  const train = { state: 'away' as TrainState, x: 60, t: 0, v: 0 };
  const tg = new THREE.Group(); tg.position.set(60, 0, -3.8);
  const car = box(36, 3.1, 2.6, '#e9edf1', 0, -.9, 0); tg.add(car);
  tg.add(box(36.02, .18, 2.62, '#e8552d', 0, .15, 0), box(36.02, .08, 2.62, '#35b58a', 0, .38, 0));
  for (let i = -4; i <= 4; i++) if (i !== 0) tg.add(box(1.5, 1, .05, '#2b3038', i * 3.6, .75, 1.31));
  const doorL = box(.62, 2.1, .06, '#cfd5dc', -.32, -.1, 1.32), doorR = box(.62, 2.1, .06, '#cfd5dc', .32, -.1, 1.32);
  const doorGap = box(1.26, 2.1, .04, '#2b3038', 0, -.1, 1.3);
  // The bar over the door: it lights with every tick of the countdown (the eye's twin of the sound).
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.3, .1, .05), new THREE.MeshStandardMaterial({ color: '#5c6168', emissive: '#000' }));
  lamp.position.set(0, 2.2, 1.35);
  const doorG = new THREE.Group(); doorG.add(doorGap, doorL, doorR, lamp); tg.add(doorG); doorG.position.x = 0;
  group.add(tg);
  // The door mark on the floor.
  const mark = box(1.3, .015, .5, '#f2c230', P.doorX, 0, -1.7); group.add(mark);
  let doorOpen = 0, lastTick = -1, gust = 0, called = false, flash = 0, squealed = false, littered = false, lurched = false;
  // The air a train pushes, and its wheels on the rail: two held sounds set every frame.
  const windBed = bed(700, .6), railBed = bed(380, .7);
  const door: Mech = { id: 'door', x: P.doorX, reach: 1.1, at: new THREE.Vector3(P.doorX, 2.3, -1), label: 'Board', up: true, on: () => train.state === 'open', use: g => void board_(g) };
  const tap: Mech = { id: 'gate', x: P.gateX - .55, reach: 1, at: new THREE.Vector3(P.gateX, 1.6, 0), label: 'Tap in', on: () => !called, use: g => openGate(g) };
  let boarding = false;
  const self = {
    id: 'platform', group, lane: { x0: -7.4, x1: 7.4, z: 0 }, solids: [gateSolid] as Solid[], mechs: [tap, door], train,
    enter(g: Game) { g.hero.place(-6.6, 0, 1); g.stage.scene.background = new THREE.Color('#2a2e35'); say('Walk to the gate', input.source === 'touch' ? 'tap floor' : '→'); },
    exit() { windBed.set(0); railBed.set(0); },
    camera(g: Game) { g.stage.want = { x: .2, y: 2.2, z: 0, dist: 16.5, pitch: .1, yaw: 0 }; },
    update(dt: number, g: Game) {
      // The gate's paddles.
      const gp = gateSpring.step(gateOpen ? 1 : 0, dt);
      for (const { pv, s } of paddles) pv.rotation.y = s * gp * 1.45;
      // The train.
      train.t += dt;
      if (train.state === 'arriving') {
        const k = Math.min(1, train.t / P.arrive), x = P.doorX + 42 * Math.pow(1 - k, 2.2);
        train.v = (x - train.x) / dt; train.x = x;
        if (!squealed && train.t > 1.5) { squealed = true; sfx.squeal(.9); }
        if (!littered && train.x < 20) { littered = true; g.fx.gust(-8, 8, -1); }
        if (k >= 1) { train.state = 'open'; train.t = 0; train.v = 0; sfx.doors(); g.stage.shake(.3); buzz(15); squealed = false; littered = false; }
      } else if (train.state === 'open') {
        doorOpen = Math.min(1, doorOpen + dt * 3);
        const left = Math.max(0, P.doorsOpen - train.t), sec = Math.ceil(left);
        if (!boarding) say(`Doors close 0:0${sec}`, input.source === 'touch' ? 'tap door' : 'A: board');
        // The countdown ticks, quicker in the last three seconds, and the lamp flashes.
        const rate = left < 3 ? 4 : 1, tick = Math.floor(train.t * rate);
        if (tick !== lastTick) { lastTick = tick; if (!boarding) { sfx.tick(left < 3); flash = .08; if (left < 3 && tick % 4 === 0) buzz(8); } }
        flash -= dt; const lit = flash > 0 || (reducedMotion && left < 3);
        (lamp.material as THREE.MeshStandardMaterial).emissive.set(lit ? '#e8552d' : '#000'); (mark.material as THREE.MeshStandardMaterial).emissive.set(lit ? '#7a3a00' : '#000');
        if (left <= 0 && !boarding) { train.state = 'closing'; train.t = 0; sfx.doors(); (lamp.material as THREE.MeshStandardMaterial).emissive.set('#000'); (mark.material as THREE.MeshStandardMaterial).emissive.set('#000'); }
      } else if (train.state === 'closing') {
        doorOpen = Math.max(0, doorOpen - dt * 2.5);
        if (train.t > .9) { train.state = 'leaving'; train.t = 0; lurched = false; }
      } else if (train.state === 'leaving') {
        const x = P.doorX - 2.2 * train.t * train.t * 4; train.v = (x - train.x) / dt; train.x = x;
        if (!lurched) { lurched = true; sfx.lurch(); }
        say(`Next train 0:0${Math.max(0, Math.ceil(P.nextTrain - train.t))}`, '');
        if (train.t > P.nextTrain) { train.state = 'arriving'; train.t = 0; train.x = 60; lastTick = -1; say('Train arriving', ''); }
      }
      tg.position.x = train.x - 0;
      doorL.position.x = -.32 - doorOpen * .6; doorR.position.x = .32 + doorOpen * .6;
      // Wind: a moving train pushes the air along the platform; he leans and slides, the sign swings.
      const wind = Math.abs(train.v) > 1.5 ? Math.sign(train.v) * Math.min(1, Math.abs(train.v) / 25) : 0;
      gust += (wind - gust) * Math.min(1, dt * 4);
      g.hero.push = gust * P.wind * 14 * (train.state === 'leaving' ? .5 : 1); g.hero.grip = .35;
      if (gateOpen && !behind && g.hero.body.x > P.gateX + .5) { behind = true; self.solids = [gateSolid]; gateOpen = false; }
      windBed.set(Math.abs(gust) * .35, .6 + Math.abs(gust) * .8); railBed.set(Math.min(.3, Math.abs(train.v) / 25 * .3), .8 + Math.min(1, Math.abs(train.v) / 25) * .6);
      if (Math.abs(gust) > .2 && Math.random() < dt * 30) g.fx.puff(g.hero.body.x - 1.5 * Math.sign(gust), .3, -.5, 1, .8);
      signSwing.kick(-gust * dt * 2.2); sign.rotation.x = 0; sign.rotation.z = reducedMotion ? 0 : signSwing.step(0, dt) * .3;
      board.rotation.z = sign.rotation.z * .6;
      if (Math.abs(gust) > .3 && sleeperAwake <= 0 && train.state === 'leaving') { sleeperAwake = 1.2; g.fx.burst(1.1, 1, -1.2, ['#f4f1e8', '#d9dcdf'], 10, .8); sfx.paper(); }
      // The sleeper: jump beside him and he startles.
      if (!g.hero.body.ground && Math.abs(g.hero.body.x - 1.1) < 1 && sleeperAwake <= 0 && g.hero.body.vy < 0) { sleeperAwake = 1.6; sleeperHop.kick(5); sfx.bonk(.2); g.caption('Huh? …zzz', new THREE.Vector3(1.1, 2.1, -1.2), 1400); }
      sleeperAwake -= dt; sleeper.position.y = .3 + Math.max(0, sleeperHop.step(0, dt)) * .2;
      // Bumping into the shut gate: it says no.
      if (!called && Math.abs(g.hero.body.x - (P.gateX - .48)) < .05 && input.move.x > .2) {
        if (!bumped) { bumped = true; sfx.bonk(.2); gateSpring.kick(2); g.stage.nudge(.08, 0); (reader.material as THREE.MeshStandardMaterial).color.set('#e8552d'); setTimeout(() => (reader.material as THREE.MeshStandardMaterial).color.set('#35b58a'), 350); }
      } else if (g.hero.body.x < P.gateX - 1.2) bumped = false;
      if (!called) say(g.hero.body.x > P.gateX - 2.2 ? 'Tap in at the gate' : 'Walk to the gate', g.hero.body.x > P.gateX - 2.2 ? (input.source === 'touch' ? 'tap gate' : 'A') : (input.source === 'touch' ? 'tap floor' : '→'));
    }
  };
  let bumped = false, behind = false;
  function openGate(g: Game) {
    gateOpen = true; called = true; self.solids = [];
    // The reader beeps, the printer chatters, the ticket comes out, and the first ka-chunk lands on it.
    sfx.beep(); gateSpring.kick(6);
    [60, 130, 200, 270].forEach(ms => setTimeout(() => noise({ d: .05, f: 3000, q: 1.5, v: .12 }), ms));
    g.save.ticket = true; g.emit('ticket-print');
    g.punch('line', 'ticket', false, 750);
    setTimeout(() => g.caption('Tap in. Coffee can wait.', new THREE.Vector3(P.gateX, 2.2, 0)), 1300);
    say('Train arriving', '');
    setTimeout(() => { train.state = 'arriving'; train.t = 0; }, 1400);
  }
  async function board_(g: Game) {
    if (boarding) return; boarding = true; g.busy = true;
    const last = train.state === 'open' && P.doorsOpen - train.t < 1;
    say('Doors closing', last ? 'just made it!' : '');
    // He turns edge-on and slips in (paper-thin when it is close).
    const h = g.hero; const x0 = h.body.x, t0 = performance.now(); sfx.fwip();
    await new Promise<void>(res => { const f = () => { const k = Math.min(1, (performance.now() - t0) / 380); h.body.x = x0 + (P.doorX - x0) * k; h.body.z = -2.4 * k; h.thin = k * (last ? .95 : .8); if (k < 1) requestAnimationFrame(f); else res(); }; f(); });
    sfx.doors();
    g.emit('board');
  }
  return self;
}
