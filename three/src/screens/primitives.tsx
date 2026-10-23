import { Text } from '@react-three/drei';
import { use, useCallback, type ComponentProps } from 'react';
import type { EventDispatcher } from 'three';
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

export function ScreenText(props: ComponentProps<typeof Text>) {
  const { block, invalidate } = useScreenGate();
  const blockWhileSyncing = useCallback(
    (text: TroikaText | null) => {
      if (text === null) return;
      const syncs = watchSyncs(text, invalidate);
      return block(() => syncs.count > 0);
    },
    [block, invalidate],
  );
  return <Text ref={blockWhileSyncing} {...props} />;
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
