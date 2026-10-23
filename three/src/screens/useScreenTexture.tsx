import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { createContext, Suspense, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LinearMipmapLinearFilter, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderTarget, type Texture } from 'three';
import { exposeDevHandle } from '../dev/devHandle';

export type ScreenSize = readonly [width: number, height: number];

const longestSideTexels = 2048;

const renderCounts: Record<string, number> = {};
const liveLabels = new Set<string>();
if (import.meta.env.DEV) exposeDevHandle({ screenRenders: () => ({ ...renderCounts }) });

const InvalidateContext = createContext<(() => void) | null>(null);

export function useScreenInvalidate(): () => void {
  const invalidate = useContext(InvalidateContext);
  if (invalidate === null) throw new Error('useScreenInvalidate: called outside a useScreenTexture portal');
  return invalidate;
}

function InvalidateOnReveal() {
  const invalidate = useScreenInvalidate();
  useLayoutEffect(invalidate);
  return null;
}

export function useScreenTexture(content: ReactNode, size: ScreenSize, label: string): { texture: Texture; portal: ReactNode } {
  const [width, height] = size;
  const gl = useThree((state) => state.gl);
  const [scene] = useState(() => new Scene());
  const camera = useMemo(() => {
    const ortho = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    ortho.position.z = 50;
    return ortho;
  }, [width, height]);
  const target = useMemo(() => {
    const texels = longestSideTexels / Math.max(width, height);
    return new WebGLRenderTarget(Math.round(width * texels), Math.round(height * texels), {
      colorSpace: SRGBColorSpace,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      anisotropy: gl.capabilities.getMaxAnisotropy(),
      stencilBuffer: true,
    });
  }, [width, height, gl]);
  useEffect(() => () => target.dispose(), [target]);

  useEffect(() => {
    if (liveLabels.has(label)) throw new Error(`useScreenTexture: two live screens share the label "${label}"`);
    liveLabels.add(label);
    renderCounts[label] ??= 0;
    return () => {
      liveLabels.delete(label);
    };
  }, [label]);

  const dirty = useRef(true);
  const [invalidate] = useState(() => () => {
    dirty.current = true;
  });
  useLayoutEffect(() => {
    dirty.current = true;
  });

  useFrame(({ gl: renderer }) => {
    if (!dirty.current) return;
    dirty.current = false;
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    // The effect composer turns renderer.autoClear off, so stale depth would hide the redraw.
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(previous);
    renderCounts[label] = (renderCounts[label] ?? 0) + 1;
  });

  const portal = createPortal(
    <InvalidateContext.Provider value={invalidate}>
      <Suspense fallback={null}>
        <InvalidateOnReveal />
        {content}
      </Suspense>
    </InvalidateContext.Provider>,
    scene,
  );
  return { texture: target.texture, portal };
}
