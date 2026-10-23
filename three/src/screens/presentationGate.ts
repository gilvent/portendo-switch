export type ScreenGate = { block(blocker: string, isBlocking: () => boolean): () => void; invalidate(): void };

export type Presentation = { kind: 'idle' } | { kind: 'present' } | { kind: 'hold' } | { kind: 'stuck'; error: Error };

export type PresentationGate = ScreenGate & { next(now: number): Presentation };

export function createPresentationGate(screen: string, boundMs: number): PresentationGate {
  const blockers = new Set<{ blocker: string; isBlocking: () => boolean }>();
  let dirty = true;
  let heldSince: number | null = null;
  return {
    block(blocker, isBlocking) {
      const entry = { blocker, isBlocking };
      blockers.add(entry);
      return () => {
        blockers.delete(entry);
        dirty = true;
      };
    },
    invalidate() {
      dirty = true;
    },
    next(now) {
      if (!dirty) return { kind: 'idle' };
      const blocking = [...blockers].filter(({ isBlocking }) => isBlocking()).map(({ blocker }) => blocker);
      if (blocking.length === 0) {
        dirty = false;
        heldSince = null;
        return { kind: 'present' };
      }
      heldSince ??= now;
      if (now - heldSince < boundMs) return { kind: 'hold' };
      return { kind: 'stuck', error: new Error(`useScreenTexture: screen "${screen}" blocked for ${boundMs} ms by ${blocking.join(', ')}`) };
    },
  };
}
