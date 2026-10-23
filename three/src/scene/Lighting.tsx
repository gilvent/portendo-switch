import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Object3D, type Group, type SpotLight } from 'three';
import { palette } from '../theme/palette';
import { desk } from './Desk';
import { layout } from './layout';

function Unpickable({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useLayoutEffect(() => {
    if (group.current === null) throw new Error('Unpickable: group not mounted');
    group.current.traverse((object) => {
      object.raycast = () => {};
    });
  });
  return <group ref={group}>{children}</group>;
}

function LampLight() {
  const light = useRef<SpotLight>(null);
  const target = useRef<Object3D>(null);
  useLayoutEffect(() => {
    if (light.current === null || target.current === null) throw new Error('LampLight: spot light or target not mounted');
    light.current.target = target.current;
  }, []);
  return (
    <>
      <spotLight
        ref={light}
        position={layout.lamp.head}
        color={palette.lampLight}
        intensity={0.9}
        distance={2.4}
        decay={2}
        angle={0.95}
        penumbra={0.85}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.012}
        shadow-radius={6}
        shadow-camera-near={0.05}
        shadow-camera-far={3}
      />
      <object3D ref={target} position={layout.lamp.aim} />
      <pointLight position={layout.lamp.head} color={palette.lampLight} intensity={0.15} distance={1.2} decay={2} />
    </>
  );
}

export function Lighting() {
  const deskCentreZ = desk.back + desk.depth / 2;
  return (
    <>
      <color attach="background" args={[palette.wall]} />
      <hemisphereLight args={['#ffffff', '#f1e6d6', 1.7]} />
      <directionalLight position={[-3.2, 2.4, 0.1]} color={palette.windowLight} intensity={1.5} />
      <directionalLight position={[3, 2.2, 1.2]} color="#fff4e6" intensity={0.6} />
      <pointLight position={[0, layout.room.ceiling - 0.25, 0.35]} color="#fff6ea" intensity={1.6} distance={4} decay={2} />
      <LampLight />
      <Environment resolution={128} environmentIntensity={0.8}>
        <Lightformer form="rect" intensity={2} color={palette.windowLight} position={[-4, 1.5, 0]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#fff4e2" position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color={palette.wall} position={[0, 1.2, 4]} rotation-y={Math.PI} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={0.5} color={palette.wall} position={[4, 1.2, 0]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
      </Environment>
      <Unpickable>
        <ContactShadows
          position={[0, layout.deskTop + 0.0008, deskCentreZ]}
          scale={[desk.width, desk.depth]}
          resolution={512}
          far={0.3}
          blur={2.2}
          opacity={0.42}
          color="#5a4330"
          frames={Infinity}
        />
      </Unpickable>
    </>
  );
}
