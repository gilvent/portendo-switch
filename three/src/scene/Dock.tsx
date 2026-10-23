import { RoundedBox, Svg } from '@react-three/drei';
import { Suspense } from 'react';
import { tag } from '../input/picking';
import { useRig } from '../rig/RigProvider';
import { palette } from '../theme/palette';
import { layout } from './layout';
import { beveledSlab } from './shapes';

const width = 0.142;
const wallDepth = 0.03;
const slotGap = 0.024;
const baseHeight = 0.04;
const front = { height: 0.08, z: slotGap / 2 + wallDepth / 2 };
const back = { height: 0.11, z: -(slotGap / 2 + wallDepth / 2) };
const frontFaceZ = front.z + wallDepth / 2;
const logoSize = 0.028;
const logoViewBox = 700;

const frontGeometry = beveledSlab(width, front.height, wallDepth, { topLeft: 0.01, topRight: 0.01, bottomLeft: 0.004, bottomRight: 0.004 }, 0.004);
const backGeometry = beveledSlab(width, back.height, wallDepth, { topLeft: 0.012, topRight: 0.012, bottomLeft: 0.004, bottomRight: 0.004 }, 0.004);

export function Dock() {
  const rig = useRig();
  return (
    <group position={layout.dock.position} rotation={[0, layout.dock.yaw, 0]} userData={tag('dock')}>
      <primitive object={rig.dockBack}>
        <mesh geometry={backGeometry} position={[0, back.height / 2, back.z]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.dockBack} roughness={0.62} />
        </mesh>
        <RoundedBox args={[width - 0.006, baseHeight, slotGap + 0.004]} radius={0.002} position={[0, baseHeight / 2, 0]} receiveShadow>
          <meshStandardMaterial color={palette.dockBack} roughness={0.62} />
        </RoundedBox>
      </primitive>
      <primitive object={rig.dockFront}>
        <mesh geometry={frontGeometry} position={[0, front.height / 2, front.z]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.dock} roughness={0.6} />
        </mesh>
        <Suspense fallback={null}>
          <Svg
            src="/av-logo.svg"
            scale={[logoSize / logoViewBox, logoSize / logoViewBox, 1]}
            position={[-logoSize / 2, front.height * 0.5 + logoSize / 2, frontFaceZ + 0.0004]}
            fillMaterial={{ color: palette.ink }}
          />
        </Suspense>
      </primitive>
      <primitive object={rig.led} position={[-width / 2 + 0.014, 0.011, frontFaceZ]}>
        <RoundedBox args={[0.009, 0.0035, 0.002]} radius={0.0008} smoothness={2}>
          <meshStandardMaterial color={palette.ledOff} roughness={0.4} />
        </RoundedBox>
      </primitive>
      <primitive object={rig.anchors.dockSlot} position={[0, baseHeight, 0]} />
    </group>
  );
}
