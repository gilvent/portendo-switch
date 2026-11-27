// The people who come to look at the lane's listings. They are scenery that follows rules (docs/MOPERTY_DESIGN.md):
// they exist only while the world's crowd toy is up, each walks to the listing that draws them most, stops to look,
// answers with a tag that depends on what state the listing is in, stays longer the more it draws them, answers again
// if it changes while they look, and moves on. Nothing here touches the page: App.tsx steps the crowd each frame and draws what it returns.
import type { Crowd as Rules, CrowdSpot, World } from './schema.ts';

export type Visitor = {
  i: number; mode: 'away' | 'walk' | 'look' | 'leave'; x: number; z: number; face: 1 | -1; moving: boolean;
  // spot: the listing they are at or walking to. last: the one before. seen: the state they last answered.
  spot: string | null; last: string | null; seen: number; tx: number; place: number;
  // t: seconds left of this wait or look. looks: how many listings they have seen this visit. end: the end of the lane
  // they came in by and will come back in by. hush: seconds until they will answer a brush again.
  t: number; looks: number; end: 0 | 1; hush: number;
};
export type Crowd = { on: boolean; people: Visitor[] };
export type CrowdEvent = { k: 'say'; i: number; glyph: string } | { k: 'hop'; i: number };
export const GAP = 46, BRUSH = 44, LOOK_MORE = 1.5, LOOK_MAX = 6, HURRY = 1.35;
const ENTER = [.35, 2, 4.2];
const lookFor = (v: Visitor) => 3.5 + ((v.i * 7 + v.looks * 3) % 5) * .5, quota = (v: Visitor) => 3 + (v.i % 2), awayFor = (v: Visitor) => 2 + ((v.i * 5 + v.looks) % 3);

export const makeCrowd = (r: Rules): Crowd => ({ on: false, people: r.people.map((p, i) => ({ i, mode: 'away', x: r.ends[i % 2], z: p.z, face: i % 2 ? -1 : 1, moving: false, spot: null, last: null, seen: -1, tx: 0, place: 0, t: 0, looks: 0, end: (i % 2) as 0 | 1, hush: 0 })) });
const stateOf = (s: CrowdSpot, toys: Record<string, number>) => Math.min(s.appeal.length - 1, toys[s.toy] ?? 0);
// How many others are at this spot or on their way to it.
const taken = (c: Crowd, v: Visitor, id: string) => c.people.filter(o => o !== v && o.spot === id && (o.mode === 'walk' || o.mode === 'look')).length;
// The listing a visitor goes to next: the one that draws them most, less 1 for each visitor already there and 1.5 if
// they have just been. Never the one they are at, and never one with no place free; with nowhere to go, nothing.
export function choose(c: Crowd, v: Visitor, r: Rules, toys: Record<string, number>): CrowdSpot | null {
  let best: CrowdSpot | null = null, top = -1e9;
  // Ties go to a different spot for each visitor, so three people do not set off for the same listing.
  for (let k = 0; k < r.spots.length; k++) {
    const s = r.spots[(k + v.i) % r.spots.length], n = taken(c, v, s.id);
    if (s.id === v.spot || n >= s.places) continue;
    const score = s.appeal[stateOf(s, toys)] - n - (s.id === v.last ? 1.5 : 0);
    if (score > top) { top = score; best = s; }
  }
  return best;
}
const go = (v: Visitor, r: Rules) => { v.mode = 'leave'; v.end = Math.abs(v.x - r.ends[0]) < Math.abs(v.x - r.ends[1]) ? 0 : 1; v.tx = r.ends[v.end]; v.last = v.spot; v.spot = null; };
// They stand side by side: each takes the first place at the spot that nobody else holds or is walking to.
const head = (c: Crowd, v: Visitor, r: Rules, toys: Record<string, number>) => {
  const s = choose(c, v, r, toys);
  if (!s) { go(v, r); return; }
  const held = c.people.filter(o => o !== v && o.spot === s.id && (o.mode === 'walk' || o.mode === 'look')).map(o => o.place);
  let place = 0; while (held.includes(place)) place++;
  v.last = v.spot; v.spot = s.id; v.place = place; v.tx = s.x + s.side * GAP * place; v.mode = 'walk';
};

// One frame. `calm` is reduced motion: nobody walks; while the toy is up one visitor stands at each spot.
export function stepCrowd(c: Crowd, dt: number, w: World, toys: Record<string, number>, hero: { x: number; z: number; moving: boolean } | null, calm = false): CrowdEvent[] {
  const r = w.crowd, out: CrowdEvent[] = [];
  if (!r) return out;
  const on = (toys[r.toy] ?? 0) > 0, turned = on !== c.on;
  c.on = on;
  if (calm) {
    c.people.forEach((v, k) => { const s = r.spots[k % r.spots.length]; v.moving = false; if (on) { Object.assign(v, { mode: 'look', spot: s.id, x: s.x, seen: stateOf(s, toys) }); } else Object.assign(v, { mode: 'away', spot: null, x: r.ends[v.end] }); });
    return out;
  }
  if (turned) for (const v of c.people) {
    if (on) { if (v.mode === 'away') v.t = ENTER[v.i % ENTER.length]; else if (v.mode === 'leave') head(c, v, r, toys); }
    else if (v.mode === 'walk' || v.mode === 'look') go(v, r);
  }
  for (const v of c.people) {
    v.hush = Math.max(0, v.hush - dt); v.moving = false;
    if (v.mode === 'away') { if (!on) continue; v.t -= dt; if (v.t <= 0) { v.x = r.ends[v.end]; v.looks = 0; v.last = null; head(c, v, r, toys); } else continue; }
    if (v.mode === 'look') {
      const s = r.spots.find(k => k.id === v.spot)!, now = stateOf(s, toys);
      // The listing changed while they were looking at it: they notice at once, and stay a little longer.
      if (now !== v.seen) { v.seen = now; v.t = Math.min(LOOK_MAX, v.t + LOOK_MORE); out.push({ k: 'hop', i: v.i }, { k: 'say', i: v.i, glyph: s.says[now] }); }
      v.t -= dt;
      if (v.t <= 0) { v.looks++; if (v.looks >= quota(v)) go(v, r); else head(c, v, r, toys); }
    }
    if (v.mode === 'walk' || v.mode === 'leave') {
      const d = v.tx - v.x, stepBy = r.people[v.i].speed * (v.mode === 'leave' && !on ? HURRY : 1) * dt;
      if (Math.abs(d) > .5) v.face = d > 0 ? 1 : -1;
      if (Math.abs(d) <= stepBy) {
        v.x = v.tx;
        if (v.mode === 'leave') { v.mode = 'away'; v.t = awayFor(v); }
        else { const s = r.spots.find(k => k.id === v.spot)!; v.mode = 'look'; v.seen = stateOf(s, toys); v.t = lookFor(v) * (.55 + .3 * s.appeal[v.seen]); out.push({ k: 'say', i: v.i, glyph: s.says[v.seen] }); }
      } else { v.x += Math.sign(d) * stepBy; v.moving = true; }
    }
    if (hero?.moving && v.mode !== 'away' && !v.hush && Math.abs(hero.x - v.x) < BRUSH && Math.abs(hero.z - v.z) < BRUSH) { v.hush = 1.5; out.push({ k: 'hop', i: v.i }, { k: 'say', i: v.i, glyph: r.people[v.i].mood }); }
  }
  return out;
}
