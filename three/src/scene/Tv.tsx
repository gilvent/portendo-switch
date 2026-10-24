import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useConsole } from '../console/ConsoleProvider';
import { useRig } from '../rig/RigProvider';
import { ConsoleScreen, consoleScreenSize } from '../screens/ConsoleScreen';
import { useDisplayMaterial } from '../screens/display';
import { HomeScreen } from '../screens/HomeScreen';
import { referenceSize } from '../screens/homeLayout';
import { useScreenTexture } from '../screens/useScreenTexture';
import { palette } from '../theme/palette';
import { layout } from './layout';
import { roundedDisc } from './shapes';

const screen = { width: 0.66, height: 0.37 };
const shell = { width: 0.76, height: 0.47, depth: 0.08 };
const shellCentreY = layout.tvScreenCentre[1] - 0.012;
const neckHeight = shellCentreY - shell.height / 2 - layout.deskTop;
const footGeometry = roundedDisc(0.13, 0.014, 0.006, 48);
const screenAspect = screen.width / screen.height;
const homeSize = [referenceSize[1] * screenAspect, referenceSize[1]] as const;
const tvConsoleContentSize = consoleScreenSize(screenAspect);
const homeContent = <HomeScreen size={homeSize} />;

export function Tv() {
  const rig = useRig();
  const { model } = useConsole();
  const home = useScreenTexture(homeContent, homeSize, 'tvHome');
  const menuContent = useMemo(() => <ConsoleScreen page={model.menu} size={tvConsoleContentSize} />, [model.menu]);
  const menu = useScreenTexture(menuContent, tvConsoleContentSize, 'tvConsole');
  const display = useDisplayMaterial(home.texture, menu.texture);
  useFrame(() => {
    display.uniforms.inputMix.value = rig.tvInput.mix;
  });
  const [x, , z] = layout.tvScreenCentre;
  const shellFront = z - 0.002;
  const shellZ = shellFront - shell.depth / 2;
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[shell.width, shell.height, shell.depth]} radius={0.04} smoothness={6} position={[0, shellCentreY, shellZ]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.tvShell} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[screen.width + 0.02, screen.height + 0.02, 0.008]} radius={0.004} smoothness={4} position={[0, layout.tvScreenCentre[1], shellFront - 0.002]}>
        <meshStandardMaterial color={palette.tvTrim} roughness={0.6} />
      </RoundedBox>
      {home.portal}
      {menu.portal}
      <mesh position={[0, layout.tvScreenCentre[1], shellFront + 0.0026]} material={display.material}>
        <planeGeometry args={[screen.width, screen.height]} />
      </mesh>
      <mesh position={[0.31, shellCentreY - shell.height / 2 + 0.022, shellFront + 0.0005]}>
        <circleGeometry args={[0.005, 20]} />
        <meshStandardMaterial color={palette.ledOff} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.12, neckHeight + 0.02, 0.04]} radius={0.012} position={[0, layout.deskTop + (neckHeight + 0.02) / 2, shellZ]} castShadow>
        <meshStandardMaterial color={palette.tvTrim} roughness={0.6} />
      </RoundedBox>
      <mesh geometry={footGeometry} position={[0, layout.deskTop, shellZ]} scale={[1, 1, 0.55]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.tvShell} roughness={0.55} />
      </mesh>
    </group>
  );
}
