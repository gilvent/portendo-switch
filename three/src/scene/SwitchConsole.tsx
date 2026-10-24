import { RoundedBox } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useConsole } from '../console/ConsoleProvider';
import { tag } from '../input/picking';
import { consoleSize } from '../rig/dimensions';
import { useRig } from '../rig/RigProvider';
import { ConsoleScreen, consoleScreenSize } from '../screens/ConsoleScreen';
import { useDisplayMaterial } from '../screens/display';
import { useScreenTexture } from '../screens/useScreenTexture';
import { palette } from '../theme/palette';

const { body } = consoleSize;
const screenSize = { width: body.width * 0.76, height: body.height * 0.74 };
const contentSize = consoleScreenSize(screenSize.width / screenSize.height);

export function SwitchConsole() {
  const rig = useRig();
  const { model } = useConsole();
  const menuContent = useMemo(() => <ConsoleScreen page={model.menu} size={contentSize} />, [model.menu]);
  const menu = useScreenTexture(menuContent, contentSize, 'switch');
  const display = useDisplayMaterial(menu.texture, menu.texture);
  useFrame(() => {
    display.uniforms.power.value = rig.screenPower.value;
  });
  return createPortal(
    <>
      <primitive object={rig.body}>
        <RoundedBox args={[body.width, body.height, body.depth]} radius={0.004} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={palette.consoleBody} roughness={0.65} />
        </RoundedBox>
      </primitive>
      <primitive object={rig.screen} userData={tag('switchScreen')}>
        <mesh material={display.material} position-z={body.depth / 2 + 0.0004}>
          <planeGeometry args={[screenSize.width, screenSize.height]} />
        </mesh>
      </primitive>
      {menu.portal}
    </>,
    rig.console,
  );
}
