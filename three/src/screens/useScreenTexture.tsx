import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { createContext, Suspense, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { LinearMipmapLinearFilter, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderTarget, type Texture } from 'three';
import { exposeDevHandle } from '../dev/devHandle';
import { createPresentationGate, type ScreenGate } from './presentationGate';

export type ScreenSize = readonly [width: number, height: number];

const longestSideTexels = 2048;
const presentationBoundMs = 10_000;

const renderCounts: Record<string, number> = {};
const liveLabels = new Set<string>();
if (import.meta.env.DEV) exposeDevHandle({ screenRenders: () => ({ ...renderCounts }) });

const GateContext = createContext<ScreenGate | null>(null);

export function useScreenGate(): ScreenGate {
  const gate = useContext(GateContext);
  if (gate === null) throw new Error('useScreenGate: called outside a useScreenTexture portal');
  return gate;
}

function BlockWhileSuspended() {
  const { block } = useScreenGate();
  useLayoutEffect(() => block('suspended content', () => true), [block]);
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

  const [gate] = useState(() => createPresentationGate(label, presentationBoundMs));
  const [stuck, setStuck] = useState<Error | null>(null);
  useLayoutEffect(() => gate.invalidate(), [gate, content, target]);

  useEffect(() => {
    const canvas = gl.domElement;
    const redraw = () => gate.invalidate();
    canvas.addEventListener('webglcontextrestored', redraw);
    return () => canvas.removeEventListener('webglcontextrestored', redraw);
  }, [gl, gate]);

  useFrame(({ gl: renderer }, delta) => {
    const presentation = gate.next(delta * 1000);
    if (presentation.kind === 'stuck') setStuck(presentation.error);
    if (presentation.kind !== 'present') return;
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    // The effect composer turns renderer.autoClear off, so stale depth would hide the redraw.
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(previous);
    renderCounts[label] = (renderCounts[label] ?? 0) + 1;
  });

  const portal = useMemo(
    () =>
      createPortal(
        <GateContext.Provider value={gate}>
          <Suspense fallback={<BlockWhileSuspended />}>{content}</Suspense>
        </GateContext.Provider>,
        scene,
      ),
    [gate, content, scene],
  );
  if (stuck !== null) throw stuck;
  return { texture: target.texture, portal };
}
