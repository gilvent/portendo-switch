export type WorldId = 'intro' | 'crossroads' | 'blibli' | 'blibli-shop' | 'blibli-storeroom' | 'moperty' | 'radjastone';
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
  | { kind: 'toy'; toy: string; states: number };
// focus: the camera leans in while the courier stands at this stop (zoom multiplies the world zoom), centred on
// `look`, the x of the thing being used, so the courier can stand beside it rather than in front of it.
export type Stop = { id: string; label: string; x: number; z: number; reach?: number; focus?: number; look?: number; action: StopAction };
export type Rect = { x0: number; x1: number; z0: number; z1: number };
export type World = {
  id: WorldId; title: string; art: 'blockout' | 'street' | 'shop' | 'storeroom' | 'hometown'; back?: { world: WorldId; stop: string }; camera?: { zoom: number; x0: number; x1: number }; path: 'round' | 'street' | 'store' | 'climb'; bounds: Rect; solid: Rect[];
  url?: string; role?: string; description?: string; logo?: string; color: string;
  stops: Stop[]; letters: Letter[];
  // Facts this world shows by play instead of text: each names the stops where it is acted out. Never displayed.
  encoded?: { fact: string; at: string[] }[];
};
export type Content = { worlds: Record<WorldId, World> };

export const WORLD_IDS = ['intro', 'crossroads', 'blibli', 'blibli-shop', 'blibli-storeroom', 'moperty', 'radjastone'] as const;
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
      if (s.action.kind === 'toy' && (!s.action.toy || s.action.states < 2)) fail(`${at}.action`, 'a toy needs a name and at least two states');
    });
    w.stops.forEach((s, i) => { if (s.action.kind === 'road') { const t = c.worlds[s.action.to]; if (!t) fail(`worlds.${id}.stops[${i}].action.to`, `unknown world ${s.action.to}`); else if (!t.stops.some(x => x.id === (s.action as { stop: string }).stop)) fail(`worlds.${id}.stops[${i}].action.stop`, 'unknown arrival stop'); } });
    if (w.back && !c.worlds[w.back.world]?.stops.some(x => x.id === w.back?.stop)) fail(`worlds.${id}.back`, 'unknown stop');
    for (const l of letterIds) if (!used.has(l)) fail(`worlds.${id}.letters.${l}`, 'no stop opens this letter');
    w.encoded?.forEach((e, i) => { if (!e.fact) fail(`worlds.${id}.encoded[${i}].fact`, 'missing'); for (const a of e.at) if (!stopIds.has(a)) fail(`worlds.${id}.encoded[${i}].at`, `unknown stop ${a}`); });
  }
  return c;
}
