// The Moperty lane's rules, run without a page: `node tests/rules.ts`. Every row of the chain-reaction table in
// docs/MOPERTY_DESIGN.md that does not need paper to show it is proved here.
import { content } from '../src/content.ts';
import { reduce, start, type Action, type Game } from '../src/game.ts';
import { makeCrowd, stepCrowd, type Crowd, type CrowdEvent } from '../src/crowd.ts';

let failed = 0;
const check = (name: string, f: () => void) => { try { f(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, (e as Error).message); } };
const eq = (a: unknown, b: unknown, what: string) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: ${JSON.stringify(a)} is not ${JSON.stringify(b)}`); };
const W = content.worlds.moperty, toy = (g: Game, t: string) => g.toys[`moperty/${t}`] ?? 0;
const at = (stop: string): Game => start(content, `/round/moperty/${stop}`);
const act = (g: Game, ...xs: Action[]) => xs.reduce((s, x) => reduce(content, s, x)[0], g);
const A: Action = { a: 'confirm' };

check('every stop is a toy with its own name; nothing is read', () => {
  eq(W.letters.length, 0, 'letters');
  const toys = W.stops.flatMap(s => (s.action.kind === 'toy' ? [s.action.toy] : []));
  eq(toys, ['post', 'build', 'board', 'door', 'ask'], 'toys');
});
check('each toy steps round and comes back to where it began', () => {
  for (const s of W.stops) { if (s.action.kind !== 'toy') continue; let g = at(s.id); for (let i = 1; i <= s.action.states; i++) { g = act(g, A); eq(toy(g, s.action.toy), i % s.action.states, `${s.id} press ${i}`); } }
});
check('no toy needs another: each works from a cold start and leaves the others alone', () => {
  for (const s of W.stops) { if (s.action.kind !== 'toy') continue; const g = act(at(s.id), A); eq(Object.keys(g.toys), [`moperty/${s.action.toy}`], s.id); }
});
check('each toy stamps the pass once, however often it is used; the bump and the gate never stamp', () => {
  let g = at('plot'); for (let i = 0; i < 7; i++) g = act(g, A);
  eq(g.stamps, ['moperty/plot'], 'stamps');
  g = act(g, { a: 'bump', id: 'mango-tree' }, { a: 'zone', id: 'garden-gate', on: true });
  eq(g.stamps, ['moperty/plot'], 'stamps after bump and zone');
});
check('the mango tree drops three and clears on the fourth jump', () => {
  let g = at('board'); const seen: number[] = [];
  for (let i = 0; i < 5; i++) { g = act(g, { a: 'bump', id: 'mango-tree' }); seen.push(toy(g, 'mango')); }
  eq(seen, [1, 2, 3, 0, 1], 'mangoes');
});
check('the garden gate is open only while he is at it', () => {
  let g = act(at('board'), { a: 'zone', id: 'garden-gate', on: true }); eq(toy(g, 'gate'), 1, 'in');
  const same = act(g, { a: 'zone', id: 'garden-gate', on: true }); if (same !== g) throw new Error('re-entering made a new state');
  g = act(g, { a: 'zone', id: 'garden-gate', on: false }); eq(toy(g, 'gate'), 0, 'out');
});
check('the office door opens the site and changes nothing', () => {
  const g = at('office-door'), [next, effect] = reduce(content, g, A);
  eq(effect, { open: 'https://moperty.id' }, 'effect'); if (next !== g) throw new Error('state changed');
});
check('the train sets him down at the road sign, and B from the lane is the way back', () => {
  let g = start(content, '/round/mrt/door'); g = act(g, { a: 'line', step: 1 }, A);
  eq(g.place, { k: 'walk', world: 'moperty', stop: 'road-sign', near: true }, 'arrival');
  g = act(g, { a: 'back' }); eq(g.place, { k: 'walk', world: 'mrt', stop: 'door', near: true }, 'back');
});

// The crowd, stepped at 60 frames a second.
const run = (c: Crowd, secs: number, toys: Record<string, number>, each?: (t: number, ev: CrowdEvent[]) => void) => { for (let f = 0; f < secs * 60; f++) { const ev = stepCrowd(c, 1 / 60, W, toys, null); each?.(f / 60, ev); } };
const inLane = (c: Crowd) => c.people.filter(v => v.mode !== 'away').length;
check('nobody comes while the road sign is down', () => { const c = makeCrowd(W.crowd!); run(c, 30, {}); eq(inLane(c), 0, 'in the lane'); });
check('raising the sign brings the first visitor in within half a second, and all three within five', () => {
  const c = makeCrowd(W.crowd!); let first = -1, all = -1;
  run(c, 6, { post: 1 }, t => { const n = inLane(c); if (n && first < 0) first = t; if (n === 3 && all < 0) all = t; });
  if (first < 0 || first > .5) throw new Error(`first at ${first}`); if (all < 0 || all > 5) throw new Error(`all at ${all}`);
});
check('they spread: the first three listings looked at are three different ones', () => {
  const c = makeCrowd(W.crowd!), firsts: string[] = [];
  run(c, 14, { post: 1 }, () => { for (const v of c.people) if (v.mode === 'look' && firsts[v.i] === undefined) firsts[v.i] = v.spot!; });
  eq([...firsts].sort(), ['house', 'office', 'plot'], 'first looks');
});
check('a visitor answers with the tag for the state the listing is in', () => {
  for (const [toys, spot, glyph] of [[{ post: 1 }, 'plot', '?'], [{ post: 1, build: 2 }, 'plot', '…'], [{ post: 1, build: 4 }, 'plot', '!'], [{ post: 1 }, 'house', '?'], [{ post: 1, door: 1 }, 'house', '♥'], [{ post: 1 }, 'office', '…'], [{ post: 1, ask: 2 }, 'office', '♪']] as const) {
    const c = makeCrowd(W.crowd!); let got = '';
    run(c, 16, toys, (_t, ev) => { for (const e of ev) if (e.k === 'say' && c.people[e.i].spot === spot && !got) got = e.glyph; });
    eq(got, glyph, `${spot} ${JSON.stringify(toys)}`);
  }
});
check('a listing that changes while it is looked at is answered at once, with a hop', () => {
  const c = makeCrowd(W.crowd!), toys: Record<string, number> = { post: 1 }; let who = -1;
  for (let f = 0; who < 0 && f < 3000; f++) { stepCrowd(c, 1 / 60, W, toys, null); who = c.people.findIndex(v => v.mode === 'look' && v.spot === 'house'); }
  if (who < 0) throw new Error('nobody reached the house');
  const before = c.people[who].t; toys.door = 1; const ev = stepCrowd(c, 1 / 60, W, toys, null).filter(e => e.i === who);
  eq(ev, [{ k: 'hop', i: who }, { k: 'say', i: who, glyph: '♥' }], 'answer'); if (c.people[who].t <= before) throw new Error('did not stay longer');
});
check('an open house draws the next visitor before anything else', () => {
  const c = makeCrowd(W.crowd!); stepCrowd(c, 1 / 60, W, { post: 1, door: 1, build: 4, ask: 1 }, null); let first = '';
  run(c, 3, { post: 1, door: 1, build: 4, ask: 1 }, () => { if (!first) first = c.people.find(v => v.spot)?.spot ?? ''; });
  eq(first, 'house', 'first choice');
});
check('visitors move on: over two minutes each has looked at every listing, and each has left and come back', () => {
  const c = makeCrowd(W.crowd!), seen = c.people.map(() => new Set<string>()), left = c.people.map(() => 0), was = c.people.map(() => 'away');
  run(c, 120, { post: 1 }, () => { for (const v of c.people) { if (v.mode === 'look') seen[v.i].add(v.spot!); if (v.mode === 'away' && was[v.i] !== 'away') left[v.i]++; was[v.i] = v.mode; } });
  seen.forEach((s, i) => eq([...s].sort(), ['house', 'office', 'plot'], `visitor ${i} saw`)); left.forEach((n, i) => { if (!n) throw new Error(`visitor ${i} never left`); });
});
check('two visitors never stand on the same spot, and never more than two look at one listing', () => {
  for (const toys of [{ post: 1 }, { post: 1, door: 1 }, { post: 1, build: 4 }, { post: 1, ask: 1, door: 1, build: 4 }] as Record<string, number>[]) {
    const c = makeCrowd(W.crowd!); let worst = 1e9, most = 0;
    run(c, 150, toys, () => { const l = c.people.filter(v => v.mode === 'look'); for (const a of l) { most = Math.max(most, l.filter(b => b.spot === a.spot).length); for (const b of l) if (a.i < b.i) worst = Math.min(worst, Math.abs(a.x - b.x)); } });
    if (worst < 40) throw new Error(`two visitors ${worst.toFixed(0)} apart with ${JSON.stringify(toys)}`); if (most > 2) throw new Error(`${most} at one listing with ${JSON.stringify(toys)}`);
  }
});
check('lowering the sign sends everyone home within the time it takes to walk out', () => {
  const c = makeCrowd(W.crowd!); run(c, 20, { post: 1 }); if (inLane(c) < 2) throw new Error('lane was not full'); let gone = -1;
  run(c, 20, { post: 0 }, t => { if (!inLane(c) && gone < 0) gone = t; });
  if (gone < 0 || gone > 12) throw new Error(`still ${inLane(c)} in the lane, gone at ${gone}`);
});
check('brushed by the salaryman, a visitor hops and answers with their own mood, then not again for a moment', () => {
  const c = makeCrowd(W.crowd!); run(c, 12, { post: 1 }); const v = c.people.find(k => k.mode === 'look')!, hero = { x: v.x + 10, z: v.z, moving: true };
  const first = stepCrowd(c, 1 / 60, W, { post: 1 }, hero).filter(e => e.i === v.i), again = stepCrowd(c, 1 / 60, W, { post: 1 }, hero).filter(e => e.i === v.i);
  eq(first, [{ k: 'hop', i: v.i }, { k: 'say', i: v.i, glyph: W.crowd!.people[v.i].mood }], 'brush'); eq(again, [], 'again');
});
check('reduced motion: nobody walks; with the sign up one visitor stands at each listing', () => {
  const c = makeCrowd(W.crowd!); stepCrowd(c, 1 / 60, W, { post: 1 }, null, true);
  eq(c.people.map(v => [v.mode, v.spot, v.moving]), [['look', 'plot', false], ['look', 'house', false], ['look', 'office', false]], 'standing');
  stepCrowd(c, 1 / 60, W, {}, null, true); eq(inLane(c), 0, 'sign down');
});
check('no viewing spot stands in front of a stop: the thing used and its marker stay in view', () => {
  for (const s of W.crowd!.spots) for (let n = 0; n < 2; n++) { const x = s.x + s.side * 46 * n; for (const st of [...W.stops, ...W.bumps!]) if (Math.abs(('look' in st ? st.look ?? st.x : st.x) - x) < 60) throw new Error(`${s.id} place ${n} at ${x} hides ${st.id}`); }
});
console.log(failed ? `\n${failed} failed` : '\nall rules hold'); process.exit(failed ? 1 : 0);
