export type WorldId = 'intro' | 'mrt' | 'blibli' | 'blibli-shop' | 'blibli-storeroom' | 'moperty' | 'radjastone';
export type Span = { t: string; strong?: boolean; em?: boolean };
export type Rich = Span[];
export type Image = { asset: string; alt: string };
export type Tech = { name: string; logo: string; color: string };
export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: Rich }
  | { kind: 'list'; title?: string; items: Rich[] }
  | { kind: 'pages'; pages: { tab: string; blocks: Block[] }[] }
  | { kind: 'reviewDesk' }
  | { kind: 'specSheet' }
  | { kind: 'tech'; items: Tech[] }
  | { kind: 'links'; items: { label: string; href: string; icon: string }[] };
export type Surface = 'note' | 'catalog' | 'monitor' | 'label';
export type Letter = { id: string; title: string; surface: Surface; blocks: Block[] };
export type StopAction =
  | { kind: 'letter'; letter: string }
  | { kind: 'road'; to: WorldId; stop: string }
  | { kind: 'link'; href: string }
  | { kind: 'dock' }
  | { kind: 'toy'; toy: string; states: number }
  // The train doors: A gets off at whichever destination the sign over them shows. State `${world}/${toy}` holds the choice.
  | { kind: 'ride'; toy: string; to: { world: WorldId; stop: string; label: string }[] };
// focus: the camera leans in while the courier stands at this stop (zoom multiplies the world zoom), centred on
// `look`, the x of the thing being used, so the courier can stand beside it rather than in front of it.
// mark: how high above the ground the thing to use reaches, when it hangs on a wall: the tap area and its marker rise to it.
export type Stop = { id: string; label: string; x: number; z: number; reach?: number; focus?: number; look?: number; mark?: number; action: StopAction };
export type Rect = { x0: number; x1: number; z0: number; z1: number };
// A bump is not a stop: it has no marker and no stamp. A jump within `r` of it steps its toy (the mango tree).
export type Bump = { id: string; label: string; x: number; z: number; r?: number; toy: string; states: number };
// Presence: toy `toy` reads 1 while he stands inside the rect and 0 once he has left (the garden gate).
export type Zone = Rect & { id: string; toy: string };
// The people who come to look (crowd.ts). They are in the lane only while toy `toy` is not 0. Each spot is where they
// stand to look at one listing: `appeal` (how much it draws them) and `says` (the tag they answer with) are read at
// the state of the spot's own toy, one entry per state. `side` is the way a second and third visitor line up.
export type CrowdSpot = { id: string; x: number; z: number; toy: string; appeal: number[]; says: string[]; side: 1 | -1; places: number };
export type Crowd = { toy: string; ends: [number, number]; people: { id: string; speed: number; z: number; h: number; mood: string }[]; spots: CrowdSpot[] };
export type World = {
  id: WorldId; title: string; art: 'blockout' | 'street' | 'shop' | 'storeroom' | 'train' | 'lane'; back?: { world: WorldId; stop: string }; // ahead: on a wide screen the view leads the walker by this much along x (the train's camera looks toward its front).
  // zoomWide: the zoom on a landscape screen, where a room has space to fill the frame; stops' `focus` close-ups stay as framed for `zoom`.
  camera?: { zoom: number; zoomWide?: number; x0: number; x1: number; lift?: number; liftTall?: number; ahead?: number }; path: 'round' | 'street' | 'store' | 'climb'; bounds: Rect; solid: Rect[];
  // Floor the camera cannot see because something tall stands in front of it. While the salaryman is there, a marker
  // hangs over him, clear of whatever hides him.
  hidden?: Rect[];
  // No train stops here: the world keeps its content and its deep links, but the route sheet leaves it out.
  offLine?: boolean;
  url?: string; role?: string; description?: string; logo?: string; color: string;
  stops: Stop[]; letters: Letter[];
  bumps?: Bump[]; zones?: Zone[]; crowd?: Crowd;
  // Fenced ground with one way in. A tap that would walk him across the fence takes him round by the gate: to the
  // point `out` in front of it, through to `in`, or the other way.
  yards?: (Rect & { gate: { x: number; out: number; in: number } })[];
  // Facts this world shows by play instead of text: each names the stops where it is acted out. Never displayed.
  encoded?: { fact: string; at: string[] }[];
};
export type Content = { worlds: Record<WorldId, World> };

export const WORLD_IDS = ['intro', 'mrt', 'blibli', 'blibli-shop', 'blibli-storeroom', 'moperty', 'radjastone'] as const;
export class ContentError extends Error {}
const fail = (at: string, why: string): never => { throw new ContentError(`content ${at}: ${why}`); };
export function validateContent(c: Content): Content {
  for (const id of WORLD_IDS) {
    const w = c.worlds[id];
    if (!w) fail(`worlds.${id}`, 'missing world');
    if (w.id !== id) fail(`worlds.${id}.id`, `is ${w.id}`);
    if (!w.title) fail(`worlds.${id}.title`, 'missing');
    if (!w.bounds) fail(`worlds.${id}.bounds`, 'missing');
    if (!w.art) fail(`worlds.${id}.art`, 'missing');
    if (!w.stops?.length) fail(`worlds.${id}.stops`, 'needs at least one stop');
    const letterIds = new Set<string>(); const used = new Set<string>(); const stopIds = new Set<string>();
    w.letters.forEach((l, i) => {
      const at = `worlds.${id}.letters[${i}]`;
      if (!l.id) fail(`${at}.id`, 'missing');
      if (letterIds.has(l.id)) fail(`${at}.id`, `duplicate ${l.id}`);
      letterIds.add(l.id);
      if (!l.title) fail(`${at}.title`, 'missing');
      if (!l.surface) fail(`${at}.surface`, 'missing');
      if (!l.blocks?.length) fail(`${at}.blocks`, 'empty letter');
    });
    w.stops.forEach((s, i) => {
      const at = `worlds.${id}.stops[${i}]`;
      if (!s.id) fail(`${at}.id`, 'missing');
      if (stopIds.has(s.id)) fail(`${at}.id`, `duplicate ${s.id}`);
      stopIds.add(s.id);
      if (!s.label) fail(`${at}.label`, 'missing');
      if (s.x < w.bounds.x0 || s.x > w.bounds.x1 || s.z < w.bounds.z0 || s.z > w.bounds.z1) fail(`${at}`, 'stands outside the walkable bounds');
      if (s.action.kind === 'letter') { if (!letterIds.has(s.action.letter)) fail(`${at}.action.letter`, `unknown letter ${s.action.letter}`); used.add(s.action.letter); }
      if (s.action.kind === 'link' && !/^https:\/\//.test(s.action.href)) fail(`${at}.action.href`, 'must be https');
      if (s.action.kind === 'ride') { if (!s.action.toy || s.action.to.length < 2) fail(`${at}.action`, 'a ride needs a name and at least two destinations'); s.action.to.forEach((d, k) => { if (!d.label) fail(`${at}.action.to[${k}].label`, 'missing'); if (!c.worlds[d.world]?.stops.some(x => x.id === d.stop)) fail(`${at}.action.to[${k}]`, `unknown stop ${d.world}/${d.stop}`); }); }
    });
    w.stops.forEach((s, i) => { if (s.action.kind === 'road') { const t = c.worlds[s.action.to]; if (!t) fail(`worlds.${id}.stops[${i}].action.to`, `unknown world ${s.action.to}`); else if (!t.stops.some(x => x.id === (s.action as { stop: string }).stop)) fail(`worlds.${id}.stops[${i}].action.stop`, 'unknown arrival stop'); } });
    if (w.back && !c.worlds[w.back.world]?.stops.some(x => x.id === w.back?.stop)) fail(`worlds.${id}.back`, 'unknown stop');
    for (const l of letterIds) if (!used.has(l)) fail(`worlds.${id}.letters.${l}`, 'no stop opens this letter');
    // Every toy of this world and how many states it has, whoever steps it: a stop, a bump or a zone.
    const toys = new Map<string, number>();
    const toy = (at: string, name: string, states: number) => { if (!name || states < 2) fail(at, 'a toy needs a name and at least two states'); if (toys.has(name)) fail(at, `toy ${name} is stepped from two places`); toys.set(name, states); };
    w.stops.forEach((s, i) => { if (s.action.kind === 'toy') toy(`worlds.${id}.stops[${i}].action`, s.action.toy, s.action.states); });
    w.bumps?.forEach((b, i) => { const at = `worlds.${id}.bumps[${i}]`; if (!b.id || !b.label) fail(at, 'needs an id and a label'); toy(at, b.toy, b.states); if (b.x < w.bounds.x0 || b.x > w.bounds.x1 || b.z < w.bounds.z0 || b.z > w.bounds.z1) fail(at, 'stands outside the walkable bounds'); const r = b.r ?? 70; for (const s of w.stops) if (Math.hypot(s.x - b.x, (s.z - b.z) * 1.5) < r + (s.reach ?? 92)) fail(at, `is in reach of stop ${s.id}: A there would use the stop, never jump`); });
    w.zones?.forEach((z, i) => { const at = `worlds.${id}.zones[${i}]`; if (!z.id) fail(at, 'needs an id'); toy(at, z.toy, 2); if (z.x0 >= z.x1 || z.z0 >= z.z1) fail(at, 'is empty'); });
    if (w.crowd) {
      const at = `worlds.${id}.crowd`, k = w.crowd;
      if (!toys.has(k.toy)) fail(`${at}.toy`, `unknown toy ${k.toy}`);
      if (!k.people.length || !k.spots.length) fail(at, 'needs people and spots');
      if (k.ends[0] >= w.bounds.x0 || k.ends[1] <= w.bounds.x1) fail(`${at}.ends`, 'must lie outside the walkable bounds, out of sight');
      k.spots.forEach((s, i) => { const n = toys.get(s.toy); if (!n) fail(`${at}.spots[${i}].toy`, `unknown toy ${s.toy}`); if (s.appeal.length !== n || s.says.length !== n) fail(`${at}.spots[${i}]`, `needs one appeal and one tag for each of the ${n} states of ${s.toy}`); });
    }
    w.encoded?.forEach((e, i) => { if (!e.fact) fail(`worlds.${id}.encoded[${i}].fact`, 'missing'); for (const a of e.at) if (!stopIds.has(a)) fail(`worlds.${id}.encoded[${i}].at`, `unknown stop ${a}`); });
  }
  return c;
}
