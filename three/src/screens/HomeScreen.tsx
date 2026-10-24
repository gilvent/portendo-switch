import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleGeometry, Mesh, NotEqualStencilFunc, ReplaceStencilOp, ShapeGeometry, type Group, type Material } from 'three';
import { Text } from 'troika-three-text';
import { useRig } from '../rig/RigProvider';
import { roundedRect } from '../scene/shapes';
import { palette } from '../theme/palette';
import { cloudLayers, intro, referenceSize, stickerPadding, stickerRadius, stickers, toScreen, type CloudLayer, type Sticker } from './homeLayout';
import { createHomeParts, enterHome, type Fade, type HomeParts } from './homeMotion';
import { ScreenImage, ScreenText } from './primitives';
import { useScreenGate, type ScreenSize } from './useScreenTexture';

const unitCircle = new CircleGeometry(1, 96);
const depth = { sky: 0, layerStep: 2, text: 6, sticker: 7 } as const;
const cloudShadow = { spread: 4, drop: 2, opacity: 0.06 } as const;

export function HomeScreen({ size }: { size: ScreenSize }) {
  const [width, height] = size;
  if (height !== referenceSize[1]) throw new Error(`HomeScreen: content height must be ${referenceSize[1]}, got ${height}`);
  const [parts] = useState(createHomeParts);
  useHomeMotion(parts);
  return (
    <>
      <mesh position-z={depth.sky}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={palette.sky} toneMapped={false} />
      </mesh>
      {cloudLayers.map((layer, index) => (
        <CloudLayerMeshes key={layer.id} layer={layer} index={index} width={width} parts={parts} />
      ))}
      <Intro width={width} parts={parts} />
      {stickers.map((sticker, index) => (
        <StickerCard key={sticker.id} sticker={sticker} width={width} parts={parts} index={index} />
      ))}
    </>
  );
}

function applyFade({ group, value }: Fade) {
  group.traverse((object) => {
    if (object instanceof Text) {
      object.fillOpacity = value.opacity;
      return;
    }
    if (!(object instanceof Mesh)) return;
    const material: Material = object.material;
    if (!material.transparent) throw new Error(`HomeScreen: a faded mesh needs a transparent material`);
    material.opacity = value.opacity;
  });
}

function useHomeMotion(parts: HomeParts) {
  const rig = useRig();
  const { invalidate } = useScreenGate();
  const motion = useRef<ReturnType<typeof enterHome> | null>(null);
  const wasHidden = useRef(false);

  useLayoutEffect(() => {
    motion.current = enterHome(parts);
    return () => {
      motion.current?.timeline.kill();
      motion.current = null;
    };
  }, [parts]);

  useFrame(() => {
    if (motion.current === null) throw new Error('HomeScreen: home motion is not running');
    const hidden = rig.tvInput.mix >= 1;
    if (wasHidden.current && !hidden) {
      motion.current.timeline.kill();
      motion.current = enterHome(parts);
    }
    wasHidden.current = hidden;
    if (hidden) return;
    for (const fade of motion.current.fades) applyFade(fade);
    invalidate();
  });
}

function Slot({ into, at, children }: { into: (Group | null)[]; at: number; children: ReactNode }) {
  return (
    <group
      ref={(group) => {
        into[at] = group;
      }}
    >
      {children}
    </group>
  );
}

function CloudLayerMeshes({ layer, index: layerIndex, width, parts }: { layer: CloudLayer; index: number; width: number; parts: HomeParts }) {
  const stencilRef = layerIndex + 1;
  const cloudSlots = parts.clouds[layerIndex];
  if (cloudSlots === undefined) throw new Error(`HomeScreen: no cloud slots for layer ${layer.id}`);
  const [, baseY] = toScreen('spread', [0, layer.baseTop], width);
  const bottom = -referenceSize[1] / 2;
  return (
    <group position-z={depth.sky + (layerIndex + 1) * depth.layerStep}>
      <Slot into={parts.layers} at={layerIndex}>
        <mesh position={[0, (baseY + bottom) / 2, 0]}>
          <planeGeometry args={[width, baseY - bottom]} />
          <meshBasicMaterial color={layer.colour} toneMapped={false} />
        </mesh>
        {layer.clouds.map(({ at, radii: [rx, ry] }, index) => (
          <group key={`${at[0]},${at[1]}`} position={[...toScreen('spread', at, width), 0]}>
            <Slot into={cloudSlots} at={index}>
              <mesh geometry={unitCircle} scale={[rx, ry, 1]}>
                <meshBasicMaterial color={layer.colour} toneMapped={false} />
              </mesh>
              <mesh geometry={unitCircle} scale={[rx + cloudShadow.spread, ry + cloudShadow.spread, 1]} position={[0, -cloudShadow.drop, -1]}>
                <meshBasicMaterial
                  color="#000000"
                  transparent
                  opacity={cloudShadow.opacity}
                  depthWrite={false}
                  toneMapped={false}
                  stencilWrite
                  stencilRef={stencilRef}
                  stencilFunc={NotEqualStencilFunc}
                  stencilZPass={ReplaceStencilOp}
                />
              </mesh>
            </Slot>
          </group>
        ))}
      </Slot>
    </group>
  );
}

function Intro({ width, parts }: { width: number; parts: HomeParts }) {
  const { greeting, lines, lineFontSize } = intro;
  return (
    <group position-z={depth.text}>
      <group position={[...toScreen('centre', greeting.at, width), 0]}>
        <Slot into={parts.intro} at={0}>
          <ScreenText font="fredoka700" fontSize={greeting.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle">
            {greeting.text}
          </ScreenText>
        </Slot>
      </group>
      {lines.map((line, index) => (
        <group key={line.text} position={[...toScreen('centre', line.at, width), 0]}>
          <Slot into={parts.intro} at={index + 1}>
            <ScreenText font="fredoka600" fontSize={lineFontSize} color={palette.ink} anchorX="center" anchorY="middle">
              {line.text}
            </ScreenText>
          </Slot>
        </group>
      ))}
    </group>
  );
}

function StickerCard({ sticker, width, parts, index }: { sticker: Sticker; width: number; parts: HomeParts; index: number }) {
  const card = useMemo(() => new ShapeGeometry(roundedRect(sticker.size, sticker.size, stickerRadius), 8), [sticker.size]);
  return (
    <group position={[...toScreen(sticker.anchor, sticker.at, width), depth.sticker]} rotation-z={(sticker.counterClockwiseDegrees * Math.PI) / 180}>
      <Slot into={parts.stickers} at={index}>
        <mesh geometry={card}>
          <meshBasicMaterial color={palette.screenWhite} transparent toneMapped={false} />
        </mesh>
        <ScreenImage image={sticker.image} width={sticker.size - stickerPadding * 2} z={0.5} />
      </Slot>
    </group>
  );
}
