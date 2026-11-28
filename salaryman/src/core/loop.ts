// Fixed-step simulation (60 Hz) with a free-running render. Rules run on a fixed clock so a tuned number means the
// same thing on every machine; the picture is drawn as often as the screen allows.
export const STEP = 1 / 60;
export function startLoop(update: (dt: number) => void, render: (dt: number) => void) {
  let last = performance.now(), acc = 0, stopped = false;
  const frame = (now: number) => {
    if (stopped) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now; acc += dt;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
    render(dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => { stopped = true; };
}
