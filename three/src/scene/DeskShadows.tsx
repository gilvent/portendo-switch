import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Mesh,
  MeshDepthMaterial,
  PlaneGeometry,
  ShaderMaterial,
  WebGLRenderTarget,
  type Group,
  type OrthographicCamera,
} from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';
import { useConsole } from '../console/ConsoleProvider';
import { useRig } from '../rig/RigProvider';
import { desk } from './Desk';
import { layout } from './layout';

const resolution = 512;
const width = desk.width;
const height = desk.depth;
const far = 0.3;
const blur = 2.2;
const position: [number, number, number] = [0, layout.deskTop + 0.0008, desk.back + desk.depth / 2];

const depthOutput = 'vec4( vec3( 1.0 - fragCoordZ ), opacity );';

function createPass() {
  const depthTarget = new WebGLRenderTarget(resolution, resolution);
  const blurTarget = new WebGLRenderTarget(resolution, resolution);
  depthTarget.texture.generateMipmaps = blurTarget.texture.generateMipmaps = false;
  const plane = new PlaneGeometry(width, height).rotateX(Math.PI / 2);
  const blurPlane = new Mesh(plane);
  const depthMaterial = new MeshDepthMaterial({ depthTest: false, depthWrite: false });
  depthMaterial.onBeforeCompile = (shader) => {
    if (!shader.fragmentShader.includes('void main() {') || !shader.fragmentShader.includes(depthOutput)) {
      throw new Error('DeskShadows: the depth shader no longer has the output line the shadow tint replaces');
    }
    shader.uniforms.ucolor = { value: new Color('#5a4330') };
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform vec3 ucolor;\nvoid main() {')
      .replace(depthOutput, 'vec4( ucolor * fragCoordZ * 2.0, 1.0 - fragCoordZ );');
  };
  const horizontal = { tDiffuse: { value: depthTarget.texture }, h: { value: 0 } };
  const vertical = { tDiffuse: { value: blurTarget.texture }, v: { value: 0 } };
  const { vertexShader: hVertex, fragmentShader: hFragment } = HorizontalBlurShader;
  const { vertexShader: vVertex, fragmentShader: vFragment } = VerticalBlurShader;
  const horizontalBlur = new ShaderMaterial({ vertexShader: hVertex, fragmentShader: hFragment, uniforms: horizontal, depthTest: false });
  const verticalBlur = new ShaderMaterial({ vertexShader: vVertex, fragmentShader: vFragment, uniforms: vertical, depthTest: false });
  return { depthTarget, blurTarget, plane, blurPlane, depthMaterial, horizontal, vertical, horizontalBlur, verticalBlur };
}

export function DeskShadows() {
  const rig = useRig();
  const { phase } = useConsole().model;
  const { gl, scene, size } = useThree();
  const pass = useMemo(createPass, []);
  const group = useRef<Group>(null);
  const camera = useRef<OrthographicCamera>(null);
  const needsRender = useRef(true);
  const transitioning = phase.kind === 'transitioning';
  const clearColor = useMemo(() => new Color(), []);

  useLayoutEffect(() => {
    needsRender.current = true;
  }, [phase, size]);

  useEffect(
    () => () => {
      for (const resource of [pass.depthTarget, pass.blurTarget, pass.plane, pass.depthMaterial, pass.horizontalBlur, pass.verticalBlur]) {
        resource.dispose();
      }
    },
    [pass],
  );

  useFrame(() => {
    const { current, target } = rig.look;
    const looking = current.yaw !== target.yaw || current.pitch !== target.pitch;
    if (!looking && !transitioning && !needsRender.current) return;
    needsRender.current = looking || transitioning;
    if (group.current === null || camera.current === null) throw new Error('DeskShadows: shadow plane or camera not mounted');
    const shadowCamera = camera.current;

    const blurOnce = (amount: number) => {
      pass.blurPlane.visible = true;
      pass.blurPlane.material = pass.horizontalBlur;
      pass.horizontal.h.value = amount / 256;
      gl.setRenderTarget(pass.blurTarget);
      gl.render(pass.blurPlane, shadowCamera);
      pass.blurPlane.material = pass.verticalBlur;
      pass.vertical.v.value = amount / 256;
      gl.setRenderTarget(pass.depthTarget);
      gl.render(pass.blurPlane, shadowCamera);
      pass.blurPlane.visible = false;
    };

    const background = scene.background;
    const overrideMaterial = scene.overrideMaterial;
    gl.getClearColor(clearColor);
    const clearAlpha = gl.getClearAlpha();
    group.current.visible = false;
    scene.background = null;
    scene.overrideMaterial = pass.depthMaterial;
    gl.setRenderTarget(pass.depthTarget);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, shadowCamera);
    blurOnce(blur);
    blurOnce(blur * 0.4);
    gl.setRenderTarget(null);
    gl.setClearColor(clearColor, clearAlpha);
    group.current.visible = true;
    scene.overrideMaterial = overrideMaterial;
    scene.background = background;
  });

  return (
    <group ref={group} position={position} rotation-x={Math.PI / 2}>
      <mesh geometry={pass.plane} scale={[1, -1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial transparent map={pass.depthTarget.texture} opacity={0.42} depthWrite={false} />
      </mesh>
      <orthographicCamera ref={camera} args={[-width / 2, width / 2, height / 2, -height / 2, 0, far]} />
    </group>
  );
}
