import { describe, expect, it } from 'vitest';
import { createPresentationGate } from './presentationGate';

describe('createPresentationGate', () => {
  it('presents once per invalidation while nothing blocks', () => {
    const gate = createPresentationGate('switch', 10_000);
    expect(gate.next(0)).toEqual({ kind: 'present' });
    expect(gate.next(16)).toEqual({ kind: 'idle' });
    gate.invalidate();
    expect(gate.next(32)).toEqual({ kind: 'present' });
  });

  it('holds while a blocker blocks and presents once it lifts', () => {
    const gate = createPresentationGate('switch', 10_000);
    let syncing = true;
    gate.block('text "WORK" in gaban', () => syncing);
    expect(gate.next(0)).toEqual({ kind: 'hold' });
    expect(gate.next(9_999)).toEqual({ kind: 'hold' });
    syncing = false;
    expect(gate.next(10_016)).toEqual({ kind: 'present' });
  });

  it('names the screen and every blocker once a block outlasts the bound', () => {
    const gate = createPresentationGate('switch', 10_000);
    gate.block('text "WORK" in gaban', () => true);
    gate.block('text "Press B to start" in fredoka500', () => true);
    gate.block('suspended content', () => false);
    expect(gate.next(1_000)).toEqual({ kind: 'hold' });
    const presentation = gate.next(11_000);
    expect(presentation.kind).toBe('stuck');
    expect(presentation.kind === 'stuck' && presentation.error.message).toBe(
      'useScreenTexture: screen "switch" blocked for 10000 ms by text "WORK" in gaban, text "Press B to start" in fredoka500',
    );
  });

  it('starts the bound afresh after a presentation', () => {
    const gate = createPresentationGate('tvConsole', 10_000);
    let syncing = true;
    gate.block('text "WORK" in gaban', () => syncing);
    expect(gate.next(0)).toEqual({ kind: 'hold' });
    syncing = false;
    expect(gate.next(5_000)).toEqual({ kind: 'present' });
    syncing = true;
    gate.invalidate();
    expect(gate.next(12_000)).toEqual({ kind: 'hold' });
    expect(gate.next(21_999)).toEqual({ kind: 'hold' });
  });

  it('presents again when a blocker is released', () => {
    const gate = createPresentationGate('switch', 10_000);
    const release = gate.block('suspended content', () => true);
    expect(gate.next(0)).toEqual({ kind: 'hold' });
    release();
    expect(gate.next(16)).toEqual({ kind: 'present' });
  });
});
