export type ScreenGate = { block(blocker: string, isBlocking: () => boolean): () => void; invalidate(): void };

export type Presentation = { kind: 'idle' } | { kind: 'present' } | { kind: 'hold' } | { kind: 'stuck'; error: Error };

export type PresentationGate = ScreenGate & { next(frameMs: number): Presentation };

const maxCountedFrameMs = 100;

export function createPresentationGate(screen: string, boundMs: number): PresentationGate {
  const blockers = new Set<{ blocker: string; isBlocking: () => boolean; blockedMs: number }>();
  let dirty = true;
  return {
    block(blocker, isBlocking) {
      const entry = { blocker, isBlocking, blockedMs: 0 };
      blockers.add(entry);
      return () => {
        blockers.delete(entry);
        dirty = true;
      };
    },
    invalidate() {
      dirty = true;
    },
    next(frameMs) {
      if (!dirty) return { kind: 'idle' };
      const liveMs = Math.min(frameMs, maxCountedFrameMs);
      const blocking = [...blockers].filter((entry) => {
        const isBlocking = entry.isBlocking();
        entry.blockedMs = isBlocking ? entry.blockedMs + liveMs : 0;
        return isBlocking;
      });
      if (blocking.length === 0) {
        dirty = false;
        return { kind: 'present' };
      }
      const stuck = blocking.filter(({ blockedMs }) => blockedMs >= boundMs).map(({ blocker }) => blocker);
      if (stuck.length === 0) return { kind: 'hold' };
      return { kind: 'stuck', error: new Error(`useScreenTexture: screen "${screen}" blocked for ${boundMs} ms by ${stuck.join(', ')}`) };
    },
  };
}
