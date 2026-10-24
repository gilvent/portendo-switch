import type { ConsoleModel } from '../console/model';
import type { ClickTarget } from '../input/bindings';

export type DevHandle = {
  model(): ConsoleModel;
  screenPoint(target: ClickTarget): { x: number; y: number };
  setLook(yawDegrees: number, pitchDegrees: number): void;
  screenRenders(): Record<string, number>;
};

declare global {
  interface Window {
    __portendo?: Partial<DevHandle>;
  }
}

export function exposeDevHandle(part: Partial<DevHandle>): () => void {
  const handle = (window.__portendo ??= {});
  Object.assign(handle, part);
  return () => {
    for (const key of Object.keys(part) as (keyof DevHandle)[]) delete handle[key];
  };
}
