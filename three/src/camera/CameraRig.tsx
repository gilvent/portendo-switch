import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3, type PerspectiveCamera as PerspectiveCameraImpl } from 'three';
import { useRig } from '../rig/RigProvider';
import { layout } from '../scene/layout';
import { cameraAnchors, verticalFov } from './frame';
import { dampLook } from './look';

const seat = new Vector3(...layout.seat);
const toScreen = new Vector3(...layout.tvScreenCentre).sub(seat);
const neutralYaw = Math.atan2(-toScreen.x, -toScreen.z);
const neutralPitch = Math.atan2(toScreen.y, Math.hypot(toScreen.x, toScreen.z));

export function CameraRig() {
  const rig = useRig();
  const camera = useRef<PerspectiveCameraImpl>(null);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const anchorPositions = useMemo(() => cameraAnchors(aspect), [aspect]);

  useFrame((_, delta) => {
    if (camera.current === null) return;
    const current = dampLook(rig.look.current, rig.look.target, delta);
    Object.assign(rig.look.current, current);
    camera.current.rotation.set(neutralPitch + current.pitch, neutralYaw + current.yaw, 0, 'YXZ');
  });

  return (
    <PerspectiveCamera makeDefault ref={camera} position={layout.seat} fov={verticalFov(aspect)} near={0.05} far={30}>
      <primitive object={rig.anchors.hand} position={anchorPositions.hand} />
      <primitive object={rig.anchors.viewCentre} position={anchorPositions.viewCentre} />
      <primitive object={rig.anchors.leftHand} position={anchorPositions.leftHand} />
      <primitive object={rig.anchors.rightHand} position={anchorPositions.rightHand} />
    </PerspectiveCamera>
  );
}
