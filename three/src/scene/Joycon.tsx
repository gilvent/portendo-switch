import { Text } from '@react-three/drei';
import { createPortal } from '@react-three/fiber';
import { Suspense, use, useMemo } from 'react';
import { Color, Shape, ShapeGeometry } from 'three';
import { useConsole } from '../console/ConsoleProvider';
import type { MenuButton } from '../console/model';
import { tag } from '../input/picking';
import { consoleSize } from '../rig/dimensions';
import { useRig } from '../rig/RigProvider';
import { joyconLetters } from '../screens/consoleText';
import { screenAssets } from '../screens/screenAssets';
import { joyconSets, palette } from '../theme/palette';
import { beveledSlab, roundedDisc } from './shapes';

export type Side = 'left' | 'right';

const { joycon } = consoleSize;
const outerRadius = 0.021;
const innerRadius = 0.003;
const railWidth = 0.0045;
const buttonRadius = 0.0136;
const buttonHeight = 0.0042;
const buttonRise = 0.0035;
const buttonOffsetY = 0.0255;

const shells: Record<Side, ReturnType<typeof beveledSlab>> = {
  left: beveledSlab(joycon.width, joycon.height, joycon.depth, { topLeft: outerRadius, bottomLeft: outerRadius, topRight: innerRadius, bottomRight: innerRadius }, 0.003),
  right: beveledSlab(joycon.width, joycon.height, joycon.depth, { topLeft: innerRadius, bottomLeft: innerRadius, topRight: outerRadius, bottomRight: outerRadius }, 0.003),
};
const buttonGeometry = roundedDisc(buttonRadius, buttonHeight, 0.0016).rotateX(Math.PI / 2);

function arrow(direction: 1 | -1): ShapeGeometry {
  const size = 0.0042;
  const shape = new Shape();
  shape.moveTo(0, direction * size);
  shape.lineTo(size * 1.1, -direction * size * 0.75);
  shape.lineTo(-size * 1.1, -direction * size * 0.75);
  shape.closePath();
  return new ShapeGeometry(shape);
}
const arrows = { up: arrow(1), down: arrow(-1) };

type ButtonSpec = { id: MenuButton; y: number; glyph: { kind: 'arrow'; direction: 'up' | 'down' } | { kind: 'letter'; text: string } };

const buttons: Record<Side, readonly ButtonSpec[]> = {
  left: [
    { id: 'up', y: buttonOffsetY, glyph: { kind: 'arrow', direction: 'up' } },
    { id: 'down', y: -buttonOffsetY, glyph: { kind: 'arrow', direction: 'down' } },
  ],
  right: [
    { id: 'a', y: buttonOffsetY, glyph: { kind: 'letter', text: joyconLetters.a } },
    { id: 'b', y: -buttonOffsetY, glyph: { kind: 'letter', text: joyconLetters.b } },
  ],
};

export function Joycon({ side }: { side: Side }) {
  const rig = useRig();
  const { model } = useConsole();
  const { fonts } = use(screenAssets());
  const colour = joyconSets[model.joycons][side];
  const railColour = useMemo(() => new Color(colour).multiplyScalar(0.62), [colour]);
  const inward = side === 'left' ? 1 : -1;
  const railX = inward * (joycon.width / 2 - railWidth / 2);
  const buttonX = -inward * railWidth * 0.5;
  const faceZ = joycon.depth / 2;

  return createPortal(
    <>
      <mesh geometry={shells[side]} castShadow receiveShadow>
        <meshStandardMaterial color={colour} roughness={0.6} />
      </mesh>
      <mesh position={[railX, 0, 0]} castShadow>
        <boxGeometry args={[railWidth, joycon.height - 0.0016, joycon.depth - 0.0012]} />
        <meshStandardMaterial color={railColour} roughness={0.65} />
      </mesh>
      {buttons[side].map((button) => (
        <mesh
          key={button.id}
          geometry={buttonGeometry}
          position={[buttonX, button.y, faceZ - buttonHeight + buttonRise]}
          userData={tag(`button:${button.id}`)}
          castShadow
        >
          <meshStandardMaterial color={palette.button} roughness={0.5} />
          {button.glyph.kind === 'arrow' ? (
            <mesh geometry={arrows[button.glyph.direction]} position={[0, 0, buttonHeight + 0.0002]}>
              <meshStandardMaterial color={palette.glyph} roughness={0.6} />
            </mesh>
          ) : (
            <Suspense fallback={null}>
              <Text
                font={fonts.fredoka500}
                fontSize={0.0115}
                color={palette.buttonLabel}
                anchorX="center"
                anchorY="middle"
                position={[0, 0.0006, buttonHeight + 0.0002]}
              >
                {button.glyph.text}
              </Text>
            </Suspense>
          )}
        </mesh>
      ))}
    </>,
    side === 'left' ? rig.leftJoycon : rig.rightJoycon,
  );
}
