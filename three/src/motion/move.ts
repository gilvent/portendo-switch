import { Euler, Quaternion, Vector3, type Object3D } from 'three';
import type { Placement } from '../rig/poses';
import type { ConsoleRig } from '../rig/rig';

export type Ease = 'none' | 'power1.out' | 'power2.out' | 'power2.in' | 'power2.inOut' | 'sine.inOut' | 'back.out';

export function move(
  timeline: gsap.core.Timeline,
  rig: ConsoleRig,
  object: Object3D,
  placement: Placement,
  tween: { duration: number; ease: Ease },
  at?: gsap.Position,
): gsap.core.Timeline {
  const fromPosition = new Vector3();
  const fromQuaternion = new Quaternion();
  const toPosition = new Vector3(...placement.position);
  const toQuaternion = new Quaternion().setFromEuler(new Euler(...placement.rotation));
  const eased = { ratio: 0 };
  return timeline.fromTo(
    eased,
    { ratio: 0 },
    {
      ratio: 1,
      ...tween,
      immediateRender: false,
      onStart() {
        rig.anchors[placement.anchor].attach(object);
        fromPosition.copy(object.position);
        fromQuaternion.copy(object.quaternion);
      },
      onUpdate(this: gsap.core.Tween) {
        // gsap updates at local time 0 without calling onStart, before the start transform is captured.
        if (this.progress() === 0) return;
        if (this.progress() === 1) {
          object.position.copy(toPosition);
          object.rotation.set(...placement.rotation);
          return;
        }
        object.position.lerpVectors(fromPosition, toPosition, eased.ratio);
        object.quaternion.slerpQuaternions(fromQuaternion, toQuaternion, eased.ratio);
      },
    },
    at,
  );
}
