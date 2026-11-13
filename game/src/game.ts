import type { Content, Stop, WorldId } from './schema.ts';

export type Spot =
  | { k: 'walk'; world: WorldId; stop: string; near: boolean }
  | { k: 'letter'; world: WorldId; stop: string }
  | { k: 'lost'; path: string };
export type Place = Spot | { k: 'routeSheet'; back: Spot };
export type ControllerMode = 'handheld' | 'docking' | 'docked';
// toys: the state of every in-scene interactive piece, keyed `${world}/${toy}`. Missing means state 0.
export type Game = { place: Place; controller: { mode: ControllerMode; visible: boolean }; stamps: string[]; toys: Record<string, number> };
export type Action =
  | { a: 'arrive'; stop: string | null } | { a: 'confirm' } | { a: 'back' } | { a: 'map' }
  | { a: 'toggleController' } | { a: 'dockDone' } | { a: 'goto'; place: Spot };
export type Effect = { open: string } | null;

const INTRO: Spot = { k: 'walk', world: 'intro', stop: 'road-end', near: false };
const HOME: Spot = { k: 'walk', world: 'crossroads', stop: 'crossing', near: true };
export const toysOf = (g: Game, w: WorldId): Record<string, number> => Object.fromEntries(Object.entries(g.toys).filter(([k]) => k.startsWith(`${w}/`)).map(([k, v]) => [k.slice(w.length + 1), v]));
export const stopOf = (c: Content, w: WorldId, id: string): Stop | undefined => c.worlds[w].stops.find(s => s.id === id);

export function pathOf(p: Place): string {
  switch (p.k) {
    case 'walk': return p.world === 'intro' ? '/' : `/round/${p.world}/${p.stop}`;
    case 'letter': return `/round/${p.world}/${p.stop}/read`;
    case 'routeSheet': return '/route';
    case 'lost': return p.path;
  }
}
const isPlayable = (c: Content, id: string): id is WorldId => id in c.worlds && id !== 'intro';
const firstLetter = (c: Content, w: WorldId) => c.worlds[w].stops.find(s => s.action.kind === 'letter');
// Where an old /work/<project> URL lands: the project's first letter, or its first stop that is not a road when the
// world tells everything by play and has no letter.
const landing = (c: Content, w: WorldId) => firstLetter(c, w) ?? c.worlds[w].stops.find(s => s.action.kind !== 'road');
export function parsePath(c: Content, path: string): Place {
  const seg = path.split('/').filter(Boolean);
  if (!seg.length) return INTRO;
  if (seg.length === 1 && seg[0] === 'route') return { k: 'routeSheet', back: HOME };
  if (seg[0] === 'work' && seg[1] && isPlayable(c, seg[1]) && seg[1] !== 'crossroads') {
    const s = landing(c, seg[1]), l = firstLetter(c, seg[1]);
    if (seg.length === 2 && s) return { k: 'walk', world: seg[1], stop: s.id, near: true };
    if (seg.length === 3 && seg[2] === 'highlight' && l) return { k: 'letter', world: seg[1], stop: l.id };
  }
  if (seg[0] === 'round' && seg[1] && isPlayable(c, seg[1])) {
    const world = seg[1], s = seg[2] ? stopOf(c, world, seg[2]) : undefined;
    if (seg.length === 3 && s) return { k: 'walk', world, stop: s.id, near: true };
    if (seg.length === 4 && s && seg[3] === 'read' && s.action.kind === 'letter') return { k: 'letter', world, stop: s.id };
  }
  return { k: 'lost', path };
}
export const start = (c: Content, path: string, visible = true): Game => {
  const place = parsePath(c, path);
  return { place, controller: { mode: place === INTRO ? 'handheld' : 'docked', visible }, stamps: [], toys: {} };
};
const docked = (g: Game, place: Place): Game => ({ ...g, place, controller: { ...g.controller, mode: 'docked' } });

export function reduce(c: Content, g: Game, x: Action): [Game, Effect] {
  if (x.a === 'toggleController') return [{ ...g, controller: { ...g.controller, visible: !g.controller.visible } }, null];
  if (g.controller.mode === 'docking') return x.a === 'dockDone' ? [docked(g, HOME), null] : [g, null];
  if (x.a === 'dockDone') return [g, null];
  if (x.a === 'goto') return [docked(g, x.place), null];
  const p = g.place;
  if (x.a === 'map') {
    if (p.k === 'routeSheet') return [{ ...g, place: p.back }, null];
    const back = p.k === 'lost' || (p.k === 'walk' && p.world === 'intro') ? HOME : p;
    return [docked(g, { k: 'routeSheet', back }), null];
  }
  switch (p.k) {
    case 'walk': {
      if (x.a === 'arrive') {
        if (x.stop === null) return [p.near ? { ...g, place: { ...p, near: false } } : g, null];
        const a = stopOf(c, p.world, x.stop)?.action;
        if (!a) throw new Error(`arrive: no stop ${x.stop} in ${p.world}`);
        if (a.kind === 'road') return [{ ...g, place: { k: 'walk', world: a.to, stop: a.stop, near: true } }, null];
        return [{ ...g, place: { ...p, stop: x.stop, near: true } }, null];
      }
      if (x.a === 'back') {
        const up = c.worlds[p.world].back;
        return up ? [{ ...g, place: { k: 'walk', world: up.world, stop: up.stop, near: true } }, null] : [g, null];
      }
      if (!p.near) return [g, null];
      const act = stopOf(c, p.world, p.stop)?.action;
      if (!act) throw new Error(`confirm: no stop ${p.stop} in ${p.world}`);
      if (act.kind === 'letter') return [{ ...g, place: { k: 'letter', world: p.world, stop: p.stop } }, null];
      if (act.kind === 'dock') return [{ ...g, controller: { ...g.controller, mode: 'docking' } }, null];
      if (act.kind === 'link') return [g, { open: act.href }];
      if (act.kind === 'toy') {
        const key = `${p.world}/${act.toy}`, id = `${p.world}/${p.stop}`;
        return [{ ...g, toys: { ...g.toys, [key]: ((g.toys[key] ?? 0) + 1) % act.states }, stamps: g.stamps.includes(id) ? g.stamps : [...g.stamps, id] }, null];
      }
      return [g, null];
    }
    case 'letter': {
      if (x.a !== 'back') return [g, null];
      const id = `${p.world}/${p.stop}`;
      return [{ ...g, place: { k: 'walk', world: p.world, stop: p.stop, near: true }, stamps: g.stamps.includes(id) ? g.stamps : [...g.stamps, id] }, null];
    }
    case 'routeSheet': return x.a === 'back' ? [{ ...g, place: p.back }, null] : [g, null];
    case 'lost': return x.a === 'back' || x.a === 'confirm' ? [docked(g, HOME), null] : [g, null];
  }
}
