import { describe, expect, it } from 'vitest';
import { createPresentationGate, type PresentationGate } from './presentationGate';

const frame = 16;

function holdFor(gate: PresentationGate, frames: number) {
  for (let i = 0; i < frames; i += 1) expect(gate.next(frame)).toEqual({ kind: 'hold' });
}

describe('createPresentationGate', () => {
  it('presents once per invalidation while nothing blocks', () => {
    const gate = createPresentationGate('switch', 10_000);
    expect(gate.next(0)).toEqual({ kind: 'present' });
    expect(gate.next(frame)).toEqual({ kind: 'idle' });
    gate.invalidate();
    expect(gate.next(frame)).toEqual({ kind: 'present' });
  });

  it('holds while a blocker blocks and presents once it lifts', () => {
    const gate = createPresentationGate('switch', 10_000);
    let syncing = true;
    gate.block('text "WORK" in gaban', () => syncing);
    expect(gate.next(0)).toEqual({ kind: 'hold' });
    holdFor(gate, 600);
    syncing = false;
    expect(gate.next(frame)).toEqual({ kind: 'present' });
  });

  it('names the screen and every blocker that blocks for the bound in live frames', () => {
    const gate = createPresentationGate('switch', 1_000);
    gate.block('text "WORK" in gaban', () => true);
    gate.block('text "Press B to start" in fredoka500', () => true);
    gate.block('suspended content', () => false);
    for (let i = 0; i < 9; i += 1) expect(gate.next(100)).toEqual({ kind: 'hold' });
    const presentation = gate.next(100);
    expect(presentation.kind).toBe('stuck');
    expect(presentation.kind === 'stuck' && presentation.error.message).toBe(
      'useScreenTexture: screen "switch" blocked for 1000 ms by text "WORK" in gaban, text "Press B to start" in fredoka500',
    );
  });

  it('does not count a suspended page toward the bound', () => {
    const gate = createPresentationGate('tvConsole', 10_000);
    let syncing = true;
    gate.block('text "WORK" in gaban', () => syncing);
    holdFor(gate, 6);
    expect(gate.next(11_000)).toEqual({ kind: 'hold' });
    expect(gate.next(60_000)).toEqual({ kind: 'hold' });
    syncing = false;
    expect(gate.next(frame)).toEqual({ kind: 'present' });
  });

  it('survives continuous re-blocking while each blocker clears', () => {
    const gate = createPresentationGate('tvConsole', 1_000);
    const first = { syncing: true };
    gate.block('text "WORK" in gaban', () => first.syncing);
    let previous = first;
    for (let i = 0; i < 1_000; i += 1) {
      const current = { syncing: true };
      gate.block(`text "flip ${i}" in fredoka500`, () => current.syncing);
      expect(gate.next(frame)).toEqual({ kind: 'hold' });
      previous.syncing = false;
      previous = current;
    }
  });

  it('names only the blocker that stays stuck while others come and go', () => {
    const gate = createPresentationGate('tvConsole', 1_000);
    gate.block('text "WORK😀" in gaban', () => true);
    let previous = { syncing: true };
    for (let i = 0; i < 62; i += 1) {
      const current = { syncing: true };
      gate.block(`text "flip ${i}" in fredoka500`, () => current.syncing);
      expect(gate.next(frame)).toEqual({ kind: 'hold' });
      previous.syncing = false;
      previous = current;
    }
    const presentation = gate.next(frame);
    expect(presentation.kind === 'stuck' && presentation.error.message).toBe('useScreenTexture: screen "tvConsole" blocked for 1000 ms by text "WORK😀" in gaban');
  });

  it('starts a blocker afresh once it is seen clear', () => {
    const gate = createPresentationGate('tvConsole', 1_000);
    let workSyncing = true;
    let guideSyncing = false;
    gate.block('text "WORK" in gaban', () => workSyncing);
    gate.block('text "Press B to start" in fredoka500', () => guideSyncing);
    for (let i = 0; i < 9; i += 1) expect(gate.next(100)).toEqual({ kind: 'hold' });
    workSyncing = false;
    guideSyncing = true;
    expect(gate.next(100)).toEqual({ kind: 'hold' });
    workSyncing = true;
    guideSyncing = false;
    for (let i = 0; i < 9; i += 1) expect(gate.next(100)).toEqual({ kind: 'hold' });
    const presentation = gate.next(100);
    expect(presentation.kind === 'stuck' && presentation.error.message).toBe('useScreenTexture: screen "tvConsole" blocked for 1000 ms by text "WORK" in gaban');
  });

  it('presents again when a blocker is released', () => {
    const gate = createPresentationGate('switch', 10_000);
    const release = gate.block('suspended content', () => true);
    expect(gate.next(0)).toEqual({ kind: 'hold' });
    release();
    expect(gate.next(frame)).toEqual({ kind: 'present' });
  });
});
