import { RoundedBox } from '@react-three/drei';
import { palette } from '../theme/palette';
import { layout } from './layout';
import { roundedDisc } from './shapes';

const screen = { width: 0.66, height: 0.37 };
const shell = { width: 0.76, height: 0.47, depth: 0.08 };
const shellCentreY = layout.tvScreenCentre[1] - 0.012;
const neckHeight = shellCentreY - shell.height / 2 - layout.deskTop;
const footGeometry = roundedDisc(0.13, 0.014, 0.006, 48);

export function Tv() {
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
      <mesh position={[0, layout.tvScreenCentre[1], shellFront + 0.0026]}>
        <planeGeometry args={[screen.width, screen.height]} />
        <meshStandardMaterial color={palette.glass} roughness={0.32} envMapIntensity={0.5} />
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
