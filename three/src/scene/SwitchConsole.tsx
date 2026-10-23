import { RoundedBox } from '@react-three/drei';
import { tag } from '../input/picking';
import { consoleSize } from '../rig/dimensions';
import { useRig } from '../rig/RigProvider';
import { palette } from '../theme/palette';

const { body } = consoleSize;
const screenSize = { width: body.width * 0.76, height: body.height * 0.74 };

export function SwitchConsole() {
  const rig = useRig();
  return (
    <primitive object={rig.console} userData={tag('switch')}>
      <primitive object={rig.body}>
        <RoundedBox args={[body.width, body.height, body.depth]} radius={0.004} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={palette.consoleBody} roughness={0.65} />
        </RoundedBox>
      </primitive>
      <primitive object={rig.screen} userData={tag('switchScreen')} position={[0, 0, body.depth / 2 + 0.0004]}>
        <mesh>
          <planeGeometry args={[screenSize.width, screenSize.height]} />
          <meshStandardMaterial color={palette.glass} roughness={0.35} envMapIntensity={0.35} />
        </mesh>
      </primitive>
    </primitive>
  );
}
