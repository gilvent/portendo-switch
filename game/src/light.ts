// The one light both diorama layers share. Each value is per unit of height above the surface behind.
export const LIGHT = { dx: .62, dy: 1, blur: 1.1, alpha: .32 };
// Toward the sun in world space: x right, y up, z to the camera. Every shadow, face tone and bake comes from this.
export const SUN_TO_LIGHT = [-LIGHT.dx, 1, LIGHT.dy] as const;
export const LIFTS = { sm: 3, md: 8, lg: 14 } as const;

export function applyLight(root: HTMLElement) {
  for (const [name, h] of Object.entries(LIFTS)) {
    root.style.setProperty(`--shadow-${name}`, `${(LIGHT.dx * h).toFixed(1)}px ${(LIGHT.dy * h).toFixed(1)}px ${(LIGHT.blur * h).toFixed(1)}px rgba(10,13,18,${LIGHT.alpha})`);
  }
  root.style.setProperty('--ground-dx', `${-SUN_TO_LIGHT[0] / SUN_TO_LIGHT[1] * LIFTS.md}px`);
  root.style.setProperty('--ground-dz', `${-SUN_TO_LIGHT[2] / SUN_TO_LIGHT[1] * LIFTS.md}px`);
}
export const shadowFilter = (name: keyof typeof LIFTS) => {
  const h = LIFTS[name];
  return { dx: LIGHT.dx * h, dy: LIGHT.dy * h, stdDeviation: LIGHT.blur * h / 2, floodColor: 'rgb(10,13,18)', floodOpacity: LIGHT.alpha };
};
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const FACE = { top: 1.1, front: 1, left: .94, right: .76 } as const;
export function tone(hex: string, face: keyof typeof FACE) {
  const n = parseInt(hex.slice(1), 16), f = FACE[face];
  const ch = (v: number) => Math.min(255, Math.round(v * f)).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}
