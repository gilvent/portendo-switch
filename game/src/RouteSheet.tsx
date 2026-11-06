import { useEffect, useRef } from 'react';
import { content } from './content.ts';
import { WORLD_IDS } from './schema.ts';
import type { Spot } from './game.ts';

export default function RouteSheet({ onGo, onClose }: { onGo: (p: Spot) => void; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="sheet" tabIndex={-1} ref={ref} data-testid="route-sheet">
      <h1>Route sheet</h1>
      {WORLD_IDS.filter(w => w !== 'intro').map(w => {
        const world = content.worlds[w];
        return (
          <div key={w}>
            <h2>{world.title}</h2>
            {world.description && <p>{world.description}</p>}
            <ul>{world.stops.filter(s => s.action.kind !== 'road').map(s => (
              <li key={s.id}>{s.action.kind === 'link'
                ? <a href={s.action.href} target="_blank" rel="noopener" data-testid={`route-${w}-${s.id}`}>{s.label}</a>
                : <button data-testid={`route-${w}-${s.id}`} onClick={() => onGo(s.action.kind === 'toy' ? { k: 'walk', world: w, stop: s.id, near: true } : { k: 'letter', world: w, stop: s.id })}>{s.label}</button>}</li>
            ))}</ul>
          </div>
        );
      })}
      <button data-testid="route-close" onClick={onClose}>Close</button>
    </section>
  );
}
