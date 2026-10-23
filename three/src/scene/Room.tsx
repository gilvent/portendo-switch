import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { BufferAttribute, CanvasTexture, CatmullRomCurve3, Color, ExtrudeGeometry, PlaneGeometry, RepeatWrapping, SRGBColorSpace, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three';
import { palette } from '../theme/palette';
import { layout } from './layout';
import { roundedDisc, roundedRect } from './shapes';

const { left, right, back, front, ceiling } = layout.room;
const width = right - left;
const length = front - back;
const centreX = (left + right) / 2;
const centreZ = (back + front) / 2;
const wallThickness = 0.06;
const wainscotHeight = 0.9;
const skirtingHeight = 0.09;

export const windowOpening = { zMin: -0.5, zMax: 0.42, yMin: 1.02, yMax: 1.86 };

function plankTexture(): CanvasTexture {
  const size = 1024;
  const planks = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('plankTexture: 2d canvas context unavailable');
  const base = new Color(palette.floor);
  const dark = new Color(palette.floorDark);
  const rowHeight = size / planks;
  for (let row = 0; row < planks; row++) {
    const shade = base.clone().lerp(dark, (row * 37) % 5 / 8);
    context.fillStyle = `#${shade.getHexString()}`;
    context.fillRect(0, row * rowHeight, size, rowHeight);
    context.fillStyle = `#${dark.clone().multiplyScalar(0.85).getHexString()}`;
    context.fillRect(0, row * rowHeight, size, 3);
    const joint = ((row * 389) % size) + 40;
    context.fillRect(joint % size, row * rowHeight, 3, rowHeight);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(width / 1.1, length / 1.1);
  texture.anisotropy = 8;
  return texture;
}

function leftWallGeometry(): ExtrudeGeometry {
  const shape = new Shape();
  shape.moveTo(-front, 0);
  shape.lineTo(-back + wallThickness, 0);
  shape.lineTo(-back + wallThickness, ceiling);
  shape.lineTo(-front, ceiling);
  shape.closePath();
  shape.holes.push(
    roundedRect(windowOpening.zMax - windowOpening.zMin, windowOpening.yMax - windowOpening.yMin, 0.001, [
      -(windowOpening.zMin + windowOpening.zMax) / 2,
      (windowOpening.yMin + windowOpening.yMax) / 2,
    ]),
  );
  return new ExtrudeGeometry(shape, { depth: wallThickness, bevelEnabled: false });
}

function skyGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(8, 6, 1, 8);
  const top = new Color(palette.sky);
  const horizon = new Color(palette.cloudLight);
  const positions = geometry.getAttribute('position');
  const colours = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    const t = Math.min(Math.max((positions.getY(i) + 1.2) / 3.4, 0), 1);
    horizon.clone().lerp(top, Math.pow(t, 0.7)).toArray(colours, i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colours, 3));
  return geometry;
}

type Puff = readonly [number, number, number];
const cloudBank: readonly Puff[] = [
  [-0.2, 0.55, 0.5], [0.45, 0.75, 0.45], [1.05, 0.6, 0.5], [1.7, 0.8, 0.55], [2.4, 0.62, 0.5], [3.1, 0.75, 0.55],
];
const cloudBankBack: readonly Puff[] = [
  [0.1, 0.95, 0.45], [0.8, 1.1, 0.5], [1.4, 1.0, 0.42], [2.05, 1.15, 0.5], [2.8, 1.0, 0.45],
];
const smallCloud: readonly Puff[] = [
  [0, 0, 0.14], [0.16, 0.05, 0.17], [0.33, 0, 0.12], [0.16, -0.06, 0.12],
];

function Cloud({ puffs, colour, z, offset = [0, 0] }: { puffs: readonly Puff[]; colour: string; z: number; offset?: readonly [number, number] }) {
  return (
    <group position={[offset[0], offset[1], z]}>
      {puffs.map(([x, y, r]) => (
        <mesh key={`${x}:${y}`} position={[x, y, 0]}>
          <circleGeometry args={[r, 40]} />
          <meshBasicMaterial color={colour} />
        </mesh>
      ))}
    </group>
  );
}

function Outside() {
  const sky = useMemo(skyGeometry, []);
  return (
    <group position={[left - 2.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={sky} position={[1.2, 1.8, 0]}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <Cloud puffs={cloudBankBack} colour={palette.cloudLight} z={0.01} />
      <Cloud puffs={cloudBank} colour={palette.cloudDark} z={0.02} />
      <Cloud puffs={smallCloud} colour="#ffffff" z={0.02} offset={[0.55, 2.55]} />
      <Cloud puffs={smallCloud} colour={palette.cloudLight} z={0.02} offset={[1.9, 2.95]} />
    </group>
  );
}

function WindowFrame() {
  const zMid = (windowOpening.zMin + windowOpening.zMax) / 2;
  const yMid = (windowOpening.yMin + windowOpening.yMax) / 2;
  const w = windowOpening.zMax - windowOpening.zMin;
  const h = windowOpening.yMax - windowOpening.yMin;
  const bar = 0.045;
  const x = left - wallThickness / 2;
  const frameDepth = wallThickness + 0.02;
  const bars: { key: string; position: [number, number, number]; size: [number, number, number] }[] = [
    { key: 'top', position: [x, windowOpening.yMax - bar / 2, zMid], size: [frameDepth, bar, w] },
    { key: 'bottom', position: [x, windowOpening.yMin + bar / 2, zMid], size: [frameDepth, bar, w] },
    { key: 'back', position: [x, yMid, windowOpening.zMin + bar / 2], size: [frameDepth, h, bar] },
    { key: 'front', position: [x, yMid, windowOpening.zMax - bar / 2], size: [frameDepth, h, bar] },
    { key: 'mullion', position: [x - 0.01, yMid, zMid], size: [0.03, h - bar, 0.026] },
    { key: 'transom', position: [x - 0.01, yMid + 0.08, zMid], size: [0.03, 0.026, w - bar] },
  ];
  return (
    <group>
      {bars.map((b) => (
        <RoundedBox key={b.key} args={b.size} radius={0.008} smoothness={3} position={b.position} castShadow receiveShadow>
          <meshStandardMaterial color={palette.trim} roughness={0.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.11, 0.03, w + 0.12]} radius={0.01} position={[left + 0.03, windowOpening.yMin - 0.012, zMid]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.trim} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}

function Trim({ position, size, colour = palette.trim }: { position: [number, number, number]; size: [number, number, number]; colour?: string }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={colour} roughness={0.65} />
    </mesh>
  );
}

function WallBands() {
  const lowDepth = 0.008;
  const rail = { height: 0.03, depth: 0.02 };
  const runs = [
    { key: 'back', along: 'x', at: back, inward: 1, from: left, to: right },
    { key: 'front', along: 'x', at: front, inward: -1, from: left, to: right },
    { key: 'left', along: 'z', at: left, inward: 1, from: back, to: front },
    { key: 'right', along: 'z', at: right, inward: -1, from: back, to: front },
  ] as const;
  return (
    <>
      {runs.map((run) => {
        const span = run.to - run.from;
        const mid = (run.to + run.from) / 2;
        const place = (offset: number, y: number): [number, number, number] =>
          run.along === 'x' ? [mid, y, run.at + run.inward * offset] : [run.at + run.inward * offset, y, mid];
        const box = (thickness: number, height: number): [number, number, number] =>
          run.along === 'x' ? [span, height, thickness] : [thickness, height, span];
        return (
          <group key={run.key}>
            <Trim position={place(lowDepth / 2, wainscotHeight / 2)} size={box(lowDepth, wainscotHeight)} colour={palette.wallLow} />
            <Trim position={place(rail.depth / 2, wainscotHeight)} size={box(rail.depth, rail.height)} />
            <Trim position={place(0.012, skirtingHeight / 2)} size={box(0.024, skirtingHeight)} />
            <Trim position={place(0.02, ceiling - 0.03)} size={box(0.04, 0.06)} />
          </group>
        );
      })}
    </>
  );
}

function WallPrint() {
  return (
    <group position={[right - 0.012, 1.5, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[0.52, 0.4, 0.024]} radius={0.01} castShadow>
        <meshStandardMaterial color={palette.trim} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0125]}>
        <planeGeometry args={[0.44, 0.32]} />
        <meshStandardMaterial color={palette.sky} roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.05, 0.013]}>
        <circleGeometry args={[0.05, 40]} />
        <meshStandardMaterial color={palette.sun} roughness={0.7} />
      </mesh>
      <mesh position={[-0.07, -0.16, 0.014]} scale={[1.2, 1, 1]}>
        <circleGeometry args={[0.12, 48, 0, Math.PI]} />
        <meshStandardMaterial color={palette.hill} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, -0.16, 0.0145]} scale={[1.1, 1, 1]}>
        <circleGeometry args={[0.1, 48, 0, Math.PI]} />
        <meshStandardMaterial color={palette.leaf} roughness={0.7} />
      </mesh>
    </group>
  );
}

function WallClock() {
  const face = useMemo(() => roundedDisc(0.11, 0.03, 0.012, 48).rotateX(Math.PI / 2), []);
  return (
    <group position={[-0.7, 1.4, back]}>
      <mesh geometry={face} castShadow>
        <meshStandardMaterial color={palette.bookBlue} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <circleGeometry args={[0.088, 48]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI) / 2) * 0.07, Math.cos((i * Math.PI) / 2) * 0.07, 0.032]}>
          <circleGeometry args={[0.006, 16]} />
          <meshStandardMaterial color={palette.ink} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.018, 0.012, 0.034]} rotation={[0, 0, -0.95]}>
        <boxGeometry args={[0.006, 0.05, 0.002]} />
        <meshStandardMaterial color={palette.ink} roughness={0.7} />
      </mesh>
      <mesh position={[-0.012, 0.025, 0.035]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.005, 0.065, 0.002]} />
        <meshStandardMaterial color={palette.bookRed} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.037]}>
        <circleGeometry args={[0.007, 16]} />
        <meshStandardMaterial color={palette.ink} roughness={0.7} />
      </mesh>
    </group>
  );
}

const flagColours = [palette.bookRed, palette.bookYellow, palette.toyMint, palette.bookBlue, palette.trim] as const;

function Bunting() {
  const { string, flags, flag } = useMemo(() => {
    const span = 0.62;
    const sag = 0.13;
    const z = back + 0.03;
    const curve = new CatmullRomCurve3(
      Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        return new Vector3(-span + 2 * span * t, 1.98 - sag * 4 * t * (1 - t), z);
      }),
    );
    const shape = new Shape();
    shape.moveTo(-0.045, 0);
    shape.lineTo(0.045, 0);
    shape.lineTo(0, -0.1);
    shape.closePath();
    const count = 11;
    return {
      string: new TubeGeometry(curve, 48, 0.0025, 6),
      flag: new ShapeGeometry(shape),
      flags: Array.from({ length: count }, (_, i) => {
        const point = curve.getPointAt((i + 0.5) / count);
        const tangent = curve.getTangentAt((i + 0.5) / count);
        return { point: [point.x, point.y, point.z + 0.002] as const, tilt: Math.atan2(tangent.y, tangent.x), colour: flagColours[i % flagColours.length] };
      }),
    };
  }, []);
  return (
    <group>
      <mesh geometry={string}>
        <meshStandardMaterial color={palette.ink} roughness={0.7} />
      </mesh>
      {flags.map((f, i) => (
        <mesh key={i} geometry={flag} position={f.point} rotation={[0, 0, f.tilt]} castShadow>
          <meshStandardMaterial color={f.colour} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function Room() {
  const floorTexture = useMemo(plankTexture, []);
  const leftWall = useMemo(leftWallGeometry, []);
  const rugGeometry = useMemo(() => roundedDisc(1, 0.012, 0.005, 64), []);
  const lampGeometry = useMemo(() => roundedDisc(0.2, 0.04, 0.015, 48).rotateX(Math.PI), []);
  return (
    <group>
      <mesh position={[centreX, -0.02, centreZ]} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.04, length + 0.2]} />
        <meshStandardMaterial map={floorTexture} roughness={0.7} />
      </mesh>
      <mesh position={[centreX, ceiling + 0.03, centreZ]}>
        <boxGeometry args={[width + 0.2, 0.06, length + 0.2]} />
        <meshStandardMaterial color={palette.ceiling} roughness={0.7} />
      </mesh>
      <mesh position={[centreX, ceiling / 2, back - wallThickness / 2]} receiveShadow>
        <boxGeometry args={[width + 2 * wallThickness, ceiling, wallThickness]} />
        <meshStandardMaterial color={palette.wall} roughness={0.7} />
      </mesh>
      <mesh position={[centreX, ceiling / 2, front + wallThickness / 2]}>
        <boxGeometry args={[width + 2 * wallThickness, ceiling, wallThickness]} />
        <meshStandardMaterial color={palette.wall} roughness={0.7} />
      </mesh>
      <mesh position={[right + wallThickness / 2, ceiling / 2, centreZ]} receiveShadow>
        <boxGeometry args={[wallThickness, ceiling, length]} />
        <meshStandardMaterial color={palette.wall} roughness={0.7} />
      </mesh>
      <mesh geometry={leftWall} position={[left - wallThickness, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <meshStandardMaterial color={palette.wall} roughness={0.7} />
      </mesh>
      <WallBands />
      <WindowFrame />
      <Outside />
      <WallPrint />
      <WallClock />
      <Bunting />
      <group position={[0, 0.001, 0.95]} scale={[0.95, 1, 0.7]}>
        <mesh geometry={rugGeometry} receiveShadow>
          <meshStandardMaterial color={palette.rugEdge} roughness={0.7} />
        </mesh>
        <mesh geometry={rugGeometry} position={[0, 0.002, 0]} scale={[0.86, 1, 0.86]} receiveShadow>
          <meshStandardMaterial color={palette.rug} roughness={0.7} />
        </mesh>
      </group>
      <mesh geometry={lampGeometry} position={[0, ceiling, 0.35]}>
        <meshStandardMaterial color={palette.bulb} emissive={palette.bulb} emissiveIntensity={4} roughness={0.5} />
      </mesh>
    </group>
  );
}
