import { Text } from '@react-three/drei';
import { use, type ComponentProps } from 'react';
import { screenAssets, type ImageId } from './screenAssets';
import { useScreenInvalidate } from './useScreenTexture';

export function ScreenText({ onSync, ...props }: ComponentProps<typeof Text>) {
  const invalidate = useScreenInvalidate();
  return (
    <Text
      {...props}
      onSync={(text) => {
        onSync?.(text);
        invalidate();
      }}
    />
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
