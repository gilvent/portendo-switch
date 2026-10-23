import { Text } from '@react-three/drei';
import { use, useCallback, type ComponentProps } from 'react';
import type { EventDispatcher } from 'three';
import type { FontId } from './fonts';
import { screenAssets, type ImageId } from './screenAssets';
import { useScreenGate } from './useScreenTexture';

type TroikaText = EventDispatcher<{ syncstart: object; synccomplete: object }>;

const syncsInFlight = new WeakMap<TroikaText, { count: number }>();

function watchSyncs(text: TroikaText, invalidate: () => void): { count: number } {
  const known = syncsInFlight.get(text);
  if (known !== undefined) return known;
  const syncs = { count: 0 };
  text.addEventListener('syncstart', () => {
    syncs.count += 1;
  });
  text.addEventListener('synccomplete', () => {
    syncs.count -= 1;
    invalidate();
  });
  syncsInFlight.set(text, syncs);
  return syncs;
}

export function ScreenText({ font, children, ...props }: Omit<ComponentProps<typeof Text>, 'font' | 'children'> & { font: FontId; children: string }) {
  const fontUrl = use(screenAssets()).fonts[font];
  const { block, invalidate } = useScreenGate();
  const blockWhileSyncing = useCallback(
    (text: TroikaText | null) => {
      if (text === null) return;
      const syncs = watchSyncs(text, invalidate);
      return block(`text "${children}" in ${font}`, () => syncs.count > 0);
    },
    [block, invalidate, children, font],
  );
  return (
    <Text ref={blockWhileSyncing} font={fontUrl} {...props}>
      {children}
    </Text>
  );
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
