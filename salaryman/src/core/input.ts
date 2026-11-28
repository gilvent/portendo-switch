// One set of verbs, whatever the hands are on: keyboard, a gamepad, the on-screen console, or a finger on the scene.
// Rules read `move`, `a`, `b`; the console reads `held` to press its own buttons down so a player sees their hands.
export type Button = 'A' | 'B' | 'X' | 'UP';
export type Source = 'keys' | 'pad' | 'touch';
const MOVE: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1]
};
const BTN: Record<string, Button> = { Space: 'A', Enter: 'A', KeyZ: 'A', KeyJ: 'A', Escape: 'B', KeyK: 'B', Backspace: 'B', KeyX: 'X', KeyL: 'X', ArrowUp: 'UP', KeyW: 'UP' };

export class Input {
  move = { x: 0, z: 0 };
  held = { A: false, B: false, X: false, UP: false };
  source: Source = 'keys';
  // A finger on the scene: walk toward this point on the floor until reached or overridden.
  target: { x: number; z: number } | null = null;
  private keys = new Set<string>();
  private edges: Button[] = [];
  private stick = { x: 0, z: 0 };
  private padPrev = { A: false, B: false, X: false };
  private listeners: ((b: Button) => void)[] = [];
  enabled = true;

  constructor() {
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.('input,textarea')) return;
      const b = BTN[e.code];
      if (MOVE[e.code] || b) e.preventDefault();
      this.source = 'keys';
      if (b && !e.repeat) this.press(b);
      if (b && b !== 'UP') return;
      if (MOVE[e.code]) { this.keys.add(e.code); this.target = null; }
    });
    addEventListener('keyup', e => { const b = BTN[e.code]; if (b) this.release(b); this.keys.delete(e.code); });
    addEventListener('blur', () => { this.keys.clear(); this.held = { A: false, B: false, X: false, UP: false }; this.stick = { x: 0, z: 0 }; });
  }
  onPress(f: (b: Button) => void) { this.listeners.push(f); }
  press(b: Button) { if (this.held[b]) return; this.held[b] = true; this.edges.push(b); this.listeners.forEach(f => f(b)); }
  release(b: Button) { this.held[b] = false; }
  setStick(x: number, z: number) { this.stick = { x, z }; if (x || z) { this.target = null; this.source = 'touch'; } }
  // Read once per step. Returns the buttons pressed since the last read.
  poll(): Button[] {
    let x = 0, z = 0;
    for (const k of this.keys) { x += MOVE[k][0]; z += MOVE[k][1]; }
    x += this.stick.x; z += this.stick.z;
    for (const p of navigator.getGamepads?.() ?? []) {
      if (!p) continue;
      const ax = Math.abs(p.axes[0]) > .25 ? p.axes[0] : 0, az = Math.abs(p.axes[1]) > .25 ? p.axes[1] : 0;
      const dx = (p.buttons[15]?.pressed ? 1 : 0) - (p.buttons[14]?.pressed ? 1 : 0), dz = (p.buttons[13]?.pressed ? 1 : 0) - (p.buttons[12]?.pressed ? 1 : 0);
      if (ax || az || dx || dz) { this.source = 'pad'; this.target = null; }
      x += ax + dx; z += az + dz;
      const now = { A: !!p.buttons[0]?.pressed, B: !!p.buttons[1]?.pressed, X: !!(p.buttons[2]?.pressed || p.buttons[3]?.pressed) };
      for (const k of ['A', 'B', 'X'] as const) {
        if (now[k] && !this.padPrev[k]) { this.source = 'pad'; this.press(k); } else if (!now[k] && this.padPrev[k]) this.release(k);
      }
      this.padPrev = now;
    }
    const len = Math.hypot(x, z);
    this.move = len > 1 ? { x: x / len, z: z / len } : { x, z };
    const out = this.enabled ? this.edges : [];
    this.edges = [];
    if (!this.enabled) this.move = { x: 0, z: 0 };
    return out;
  }
}
export const input = new Input();
(window as unknown as { __input: Input }).__input = input;
