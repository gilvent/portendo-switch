import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { MathUtils, PerspectiveCamera, Vector2 } from 'three';
import { clampLook, dragLook } from '../camera/look';
import { useConsole } from '../console/ConsoleProvider';
import { exposeDevHandle } from '../dev/devHandle';
import { lookMode } from '../rig/poses';
import { useRig } from '../rig/RigProvider';
import { findTagged, pickInput, worldCentre } from './picking';
import { usePointerIntent } from './usePointerIntent';

export function Interaction() {
  const rig = useRig();
  const { model, send } = useConsole();
  const { gl, scene, camera, size } = useThree();
  const { phase } = model;
  const settledState = phase.kind === 'settled' ? phase.state : null;

  usePointerIntent(gl.domElement, {
    onLook(dx, dy) {
      if (settledState === null || lookMode(settledState) === 'locked') return;
      if (!(camera instanceof PerspectiveCamera)) throw new Error('Interaction: the default camera is not a PerspectiveCamera');
      const radiansPerPixel = MathUtils.degToRad(camera.fov) / size.height;
      Object.assign(rig.look.target, dragLook(rig.look.target, dx, dy, radiansPerPixel));
    },
    onClick(clientX, clientY) {
      if (settledState === null) return;
      const bounds = gl.domElement.getBoundingClientRect();
      const ndc = new Vector2(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -((clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      const input = pickInput(settledState, scene, camera, ndc, rig);
      if (input !== undefined) send(input);
    },
  });

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    return exposeDevHandle({
      screenPoint(target) {
        const point = worldCentre(findTagged(scene, target)).project(camera);
        const bounds = gl.domElement.getBoundingClientRect();
        return {
          x: Math.round(bounds.left + ((point.x + 1) / 2) * bounds.width),
          y: Math.round(bounds.top + ((1 - point.y) / 2) * bounds.height),
        };
      },
      setLook(yawDegrees, pitchDegrees) {
        const look = clampLook({ yaw: MathUtils.degToRad(yawDegrees), pitch: MathUtils.degToRad(pitchDegrees) });
        Object.assign(rig.look.target, look);
        Object.assign(rig.look.current, look);
      },
    });
  }, [scene, camera, gl, rig]);

  return null;
}
