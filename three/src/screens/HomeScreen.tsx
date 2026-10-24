import { useMemo } from 'react';
import { CircleGeometry, NotEqualStencilFunc, ReplaceStencilOp, ShapeGeometry } from 'three';
import { roundedRect } from '../scene/shapes';
import { palette } from '../theme/palette';
import { cloudLayers, intro, referenceSize, stickerPadding, stickerRadius, stickers, toScreen, type CloudLayer, type Sticker } from './homeLayout';
import { ScreenImage, ScreenText } from './primitives';
import type { ScreenSize } from './useScreenTexture';

const unitCircle = new CircleGeometry(1, 96);
const depth = { sky: 0, layerStep: 2, text: 6, sticker: 7 } as const;
const cloudShadow = { spread: 4, drop: 2, opacity: 0.06 } as const;

export function HomeScreen({ size }: { size: ScreenSize }) {
  const [width, height] = size;
  if (height !== referenceSize[1]) throw new Error(`HomeScreen: content height must be ${referenceSize[1]}, got ${height}`);
  return (
    <>
      <mesh position-z={depth.sky}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={palette.sky} toneMapped={false} />
      </mesh>
      {cloudLayers.map((layer, index) => (
        <CloudLayerMeshes key={layer.id} layer={layer} stencilRef={index + 1} z={depth.sky + (index + 1) * depth.layerStep} width={width} />
      ))}
      <Intro width={width} />
      {stickers.map((sticker) => (
        <StickerCard key={sticker.id} sticker={sticker} width={width} />
      ))}
    </>
  );
}

function CloudLayerMeshes({ layer, stencilRef, z, width }: { layer: CloudLayer; stencilRef: number; z: number; width: number }) {
  const [, baseY] = toScreen('spread', [0, layer.baseTop], width);
  const bottom = -referenceSize[1] / 2;
  return (
    <group position-z={z}>
      <mesh position={[0, (baseY + bottom) / 2, 0]}>
        <planeGeometry args={[width, baseY - bottom]} />
        <meshBasicMaterial color={layer.colour} toneMapped={false} />
      </mesh>
      {layer.clouds.map(({ at, radii: [rx, ry] }) => (
        <group key={`${at[0]},${at[1]}`} position={[...toScreen('spread', at, width), 0]}>
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
        </group>
      ))}
    </group>
  );
}

function Intro({ width }: { width: number }) {
  const { greeting, lines, lineFontSize } = intro;
  return (
    <group position-z={depth.text}>
      <group position={[...toScreen('centre', greeting.at, width), 0]}>
        <ScreenText font="fredoka700" fontSize={greeting.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle">
          {greeting.text}
        </ScreenText>
      </group>
      {lines.map((line) => (
        <group key={line.text} position={[...toScreen('centre', line.at, width), 0]}>
          <ScreenText font="fredoka600" fontSize={lineFontSize} color={palette.ink} anchorX="center" anchorY="middle">
            {line.text}
          </ScreenText>
        </group>
      ))}
    </group>
  );
}

function StickerCard({ sticker, width }: { sticker: Sticker; width: number }) {
  const card = useMemo(() => new ShapeGeometry(roundedRect(sticker.size, sticker.size, stickerRadius), 8), [sticker.size]);
  return (
    <group position={[...toScreen(sticker.anchor, sticker.at, width), depth.sticker]} rotation-z={(sticker.counterClockwiseDegrees * Math.PI) / 180}>
      <mesh geometry={card}>
        <meshBasicMaterial color={palette.screenWhite} toneMapped={false} />
      </mesh>
      <ScreenImage image={sticker.image} width={sticker.size - stickerPadding * 2} z={0.5} />
    </group>
  );
}
