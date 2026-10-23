import { RoundedBox } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { MeshBasicMaterial } from 'three';
import { useConsole } from '../console/ConsoleProvider';
import { tag } from '../input/picking';
import { consoleSize } from '../rig/dimensions';
import { useRig } from '../rig/RigProvider';
import { DisplayMaterial } from '../screens/DisplayMaterial';
import { ConsoleScreen, consoleScreenSize } from '../screens/ConsoleScreen';
import { useScreenTexture } from '../screens/useScreenTexture';
import { palette } from '../theme/palette';

const { body } = consoleSize;
const screenSize = { width: body.width * 0.76, height: body.height * 0.74 };
const contentSize = consoleScreenSize(screenSize.width / screenSize.height);

export function SwitchConsole() {
  const rig = useRig();
  const { model } = useConsole();
  const menu = useScreenTexture(<ConsoleScreen page={model.menu} size={contentSize} />, contentSize, 'switch');
  const screenMaterial = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    if (screenMaterial.current === null) throw new Error('SwitchConsole: screen material is not mounted');
    screenMaterial.current.color.setScalar(rig.screenPower.value);
  });
  return createPortal(
    <>
      <primitive object={rig.body}>
        <RoundedBox args={[body.width, body.height, body.depth]} radius={0.004} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={palette.consoleBody} roughness={0.65} />
        </RoundedBox>
      </primitive>
      <primitive object={rig.screen} userData={tag('switchScreen')} position={[0, 0, body.depth / 2 + 0.0004]}>
        <mesh>
          <planeGeometry args={[screenSize.width, screenSize.height]} />
          <DisplayMaterial ref={screenMaterial} map={menu.texture} />
        </mesh>
      </primitive>
      {menu.portal}
    </>,
    rig.console,
  );
}
