import { RoundedBox } from '@react-three/drei';
import { palette } from '../theme/palette';
import { layout } from './layout';

export const desk = { width: 1.56, depth: 0.84, thickness: 0.045, back: layout.room.back + 0.012 };
const front = desk.back + desk.depth;
const centreZ = desk.back + desk.depth / 2;
const legHeight = layout.deskTop - desk.thickness;
const legInset = 0.06;
const drawers = { width: 0.42, x: desk.width / 2 - legInset - 0.028 - 0.21, top: legHeight - 0.005, height: 0.36 };

export function Desk() {
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (desk.width / 2 - legInset), sz] as const));
  return (
    <group>
      <RoundedBox
        args={[desk.width, desk.thickness, desk.depth]}
        radius={0.014}
        smoothness={4}
        position={[0, layout.deskTop - desk.thickness / 2, centreZ]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={palette.desk} roughness={0.62} />
      </RoundedBox>
      {legs.map(([x, sz]) => (
        <RoundedBox
          key={`${x}:${sz}`}
          args={[0.055, legHeight, 0.055]}
          radius={0.012}
          position={[x, legHeight / 2, sz < 0 ? desk.back + legInset : front - legInset]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={palette.deskLeg} roughness={0.62} />
        </RoundedBox>
      ))}
      <RoundedBox args={[desk.width - 0.2, 0.08, 0.025]} radius={0.01} position={[0, legHeight - 0.045, front - legInset]} castShadow>
        <meshStandardMaterial color={palette.deskLeg} roughness={0.62} />
      </RoundedBox>
      <group position={[drawers.x, drawers.top - drawers.height / 2, centreZ + 0.02]}>
        <RoundedBox args={[drawers.width, drawers.height, desk.depth - 0.16]} radius={0.014} castShadow receiveShadow>
          <meshStandardMaterial color={palette.desk} roughness={0.62} />
        </RoundedBox>
        {[0.085, -0.085].map((y) => (
          <group key={y} position={[0, y, (desk.depth - 0.16) / 2]}>
            <RoundedBox args={[drawers.width - 0.04, 0.15, 0.016]} radius={0.007}>
              <meshStandardMaterial color={palette.deskLeg} roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, 0.02, 0.012]}>
              <sphereGeometry args={[0.014, 20, 14]} />
              <meshStandardMaterial color={palette.trim} roughness={0.55} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
