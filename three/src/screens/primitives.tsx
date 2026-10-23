import { use, useLayoutEffect, useState } from 'react';
import { Text } from 'troika-three-text';
import type { FontId } from './fonts';
import { screenAssets, type ImageId } from './screenAssets';
import { useScreenGate } from './useScreenTexture';

type ScreenTextProps = {
  font: FontId;
  children: string;
  fontSize: number;
  color: string;
  anchorX: 'left' | 'center' | 'right';
  anchorY: 'top' | 'middle' | 'bottom';
  position?: readonly [x: number, y: number, z: number];
  onSync?: (text: Text) => void;
};

export function ScreenText({ font, children, fontSize, color, anchorX, anchorY, position = [0, 0, 0], onSync }: ScreenTextProps) {
  const fontUrl = use(screenAssets()).fonts[font];
  const { block, invalidate } = useScreenGate();
  const [{ text, syncs }] = useState(() => {
    const troikaText = new Text();
    const inFlight = { count: 0 };
    troikaText.addEventListener('syncstart', () => {
      inFlight.count += 1;
    });
    troikaText.addEventListener('synccomplete', () => {
      inFlight.count -= 1;
      invalidate();
    });
    return { text: troikaText, syncs: inFlight };
  });
  useLayoutEffect(() => block(`text "${children}" in ${font}`, () => syncs.count > 0), [block, syncs, children, font]);
  useLayoutEffect(() => {
    Object.assign(text, { text: children, font: fontUrl, fontSize, color, anchorX, anchorY });
    text.sync(() => onSync?.(text));
  });
  useLayoutEffect(() => () => text.dispose(), [text]);
  return <primitive object={text} position={position} />;
}

export function ScreenImage({ image, width, z = 0 }: { image: ImageId; width: number; z?: number }) {
  const { texture, aspect } = use(screenAssets()).images[image];
  return (
    <mesh position-z={z}>
      <planeGeometry args={[width, width * aspect]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
