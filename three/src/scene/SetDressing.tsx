import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { DoubleSide, Euler, Quaternion, Vector3 } from 'three';
import type { Vec3 } from '../rig/poses';
import { palette } from '../theme/palette';
import { layout } from './layout';
import { between, lathe, roundedDisc } from './shapes';

function Rod({ from, to, radius, colour }: { from: Vec3; to: Vec3; radius: number; colour: string }) {
  const { position, quaternion, length } = between(from, to);
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <capsuleGeometry args={[radius, length, 6, 16]} />
      <meshStandardMaterial color={colour} roughness={0.55} />
    </mesh>
  );
}

const shadeGeometry = lathe([
  [0.07, 0],
  [0.066, 0.02],
  [0.05, 0.06],
  [0.03, 0.09],
  [0.022, 0.1],
  [0, 0.102],
]);

function Lamp() {
  const { base, elbow, head, aim } = layout.lamp;
  const baseGeometry = useMemo(() => roundedDisc(0.075, 0.022, 0.009, 48), []);
  const headQuaternion = useMemo(() => {
    const direction = new Vector3(...head).sub(new Vector3(...aim)).normalize();
    return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction);
  }, [head, aim]);
  const baseTop: Vec3 = [base[0], base[1] + 0.022, base[2]];
  return (
    <group>
      <mesh geometry={baseGeometry} position={base} castShadow receiveShadow>
        <meshStandardMaterial color={palette.lampBody} roughness={0.55} />
      </mesh>
      <Rod from={baseTop} to={elbow} radius={0.011} colour={palette.lampBody} />
      <Rod from={elbow} to={head} radius={0.011} colour={palette.lampBody} />
      <mesh position={elbow} castShadow>
        <sphereGeometry args={[0.018, 20, 16]} />
        <meshStandardMaterial color={palette.trim} roughness={0.55} />
      </mesh>
      <group position={head} quaternion={headQuaternion}>
        <mesh geometry={shadeGeometry} position={[0, -0.09, 0]}>
          <meshStandardMaterial color={palette.lampBody} roughness={0.55} side={DoubleSide} />
        </mesh>
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.026, 24, 16]} />
          <meshStandardMaterial color={palette.bulb} emissive={palette.bulb} emissiveIntensity={7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.012, 0]} castShadow>
          <sphereGeometry args={[0.02, 20, 16]} />
          <meshStandardMaterial color={palette.trim} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

const potGeometry = lathe([
  [0, 0],
  [0.06, 0],
  [0.068, 0.012],
  [0.08, 0.1],
  [0.088, 0.106],
  [0.088, 0.125],
  [0.078, 0.128],
  [0.074, 0.12],
  [0, 0.12],
]);

const leaves: readonly { yaw: number; tilt: number; length: number; dark: boolean }[] = Array.from({ length: 11 }, (_, i) => ({
  yaw: i * 2.39996,
  tilt: 0.25 + ((i * 7) % 5) * 0.12,
  length: 0.13 + ((i * 3) % 4) * 0.025,
  dark: i % 2 === 0,
}));

function Plant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh geometry={potGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={palette.pot} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.076, 32]} />
        <meshStandardMaterial color={palette.soil} roughness={0.8} />
      </mesh>
      {leaves.map((leaf, i) => {
        const rotation = new Euler(leaf.tilt, leaf.yaw, 0, 'YXZ');
        return (
          <group key={i} position={[0, 0.11, 0]} rotation={rotation}>
            <mesh position={[0, leaf.length / 2, 0]} scale={[0.32, 1, 0.12]} castShadow>
              <sphereGeometry args={[leaf.length / 2, 18, 12]} />
              <meshStandardMaterial color={leaf.dark ? palette.leafDark : palette.leaf} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const shelf = { x: 0.9, y: 1.27, width: 0.66, depth: 0.17, thickness: 0.026 };

function Shelf() {
  const z = layout.room.back + shelf.depth / 2;
  const top = shelf.y + shelf.thickness / 2;
  const books = [
    { x: -0.25, width: 0.035, height: 0.16, colour: palette.bookBlue, lean: 0 },
    { x: -0.21, width: 0.03, height: 0.145, colour: palette.bookYellow, lean: 0 },
    { x: -0.172, width: 0.04, height: 0.17, colour: palette.bookRed, lean: 0 },
    { x: -0.12, width: 0.032, height: 0.14, colour: palette.toyMint, lean: -0.32 },
  ];
  const blocks = [
    { position: [0.03, 0.03, 0], colour: palette.bookRed, turn: 0.2 },
    { position: [0.095, 0.03, 0.005], colour: palette.toyMint, turn: -0.15 },
    { position: [0.062, 0.09, 0], colour: palette.bookYellow, turn: 0.5 },
  ] as const;
  return (
    <group>
      <RoundedBox args={[shelf.width, shelf.thickness, shelf.depth]} radius={0.008} position={[shelf.x, shelf.y, z]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.desk} roughness={0.62} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.022, 0.09, 0.12]}
          radius={0.006}
          position={[shelf.x + side * (shelf.width / 2 - 0.07), shelf.y - 0.055, layout.room.back + 0.06]}
          castShadow
        >
          <meshStandardMaterial color={palette.deskLeg} roughness={0.62} />
        </RoundedBox>
      ))}
      <group position={[shelf.x, top, z]}>
        {books.map((book) => (
          <RoundedBox
            key={book.x}
            args={[book.width, book.height, 0.13]}
            radius={0.005}
            position={[book.x + (book.lean === 0 ? 0 : 0.03), book.height / 2 - (book.lean === 0 ? 0 : 0.012), 0]}
            rotation={[0, 0, book.lean]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={book.colour} roughness={0.6} />
          </RoundedBox>
        ))}
        {blocks.map((block) => (
          <RoundedBox key={block.colour} args={[0.06, 0.06, 0.06]} radius={0.01} position={block.position} rotation={[0, block.turn, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={block.colour} roughness={0.6} />
          </RoundedBox>
        ))}
        <mesh position={[0.22, 0.045, 0.01]} castShadow>
          <sphereGeometry args={[0.045, 32, 24]} />
          <meshStandardMaterial color={palette.bookBlue} roughness={0.55} />
        </mesh>
        <mesh position={[0.22, 0.045, 0.01]} rotation={[0.4, 0, 0.3]} scale={1.004}>
          <torusGeometry args={[0.045, 0.006, 10, 40]} />
          <meshStandardMaterial color={palette.trim} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

export function SetDressing() {
  return (
    <>
      <Lamp />
      <Plant position={[-0.64, layout.deskTop, -0.48]} />
      <Shelf />
    </>
  );
}
