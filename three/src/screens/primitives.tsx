import { Text, useTexture } from '@react-three/drei';
import type { ComponentProps } from 'react';
import { SRGBColorSpace } from 'three';
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

export function ScreenImage({ url, width, z = 0 }: { url: string; width: number; z?: number }) {
  const texture = useTexture(url);
  texture.colorSpace = SRGBColorSpace;
  const { width: texelsWide, height: texelsHigh } = texture.image as { width: number; height: number };
  return (
    <mesh position-z={z}>
      <planeGeometry args={[width, (width * texelsHigh) / texelsWide]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
