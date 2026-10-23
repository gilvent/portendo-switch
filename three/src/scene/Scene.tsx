import { tag } from '../input/picking';
import { consoleSize } from '../rig/dimensions';
import { useRig } from '../rig/RigProvider';
import { layout } from './layout';

export function Scene() {
  const rig = useRig();
  const { body, joycon } = consoleSize;
  return (
    <>
      <color attach="background" args={['#f3ebdf']} />
      <ambientLight intensity={1} />
      <directionalLight position={[1, 3, 2]} intensity={2} />
      <mesh position={[0, layout.deskTop - 0.02, -0.2]}>
        <boxGeometry args={[2, 0.04, 1]} />
        <meshStandardMaterial color="#e2c79f" />
      </mesh>
      <mesh position={layout.tvScreenCentre}>
        <boxGeometry args={[0.8, 0.45, 0.04]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <primitive object={rig.anchors.desk} position={layout.switchRest} />
      <group position={layout.dock.position} rotation={[0, layout.dock.yaw, 0]} userData={tag('dock')}>
        <primitive object={rig.dockBack}>
          <mesh position={[0, 0.05, -0.012]}>
            <boxGeometry args={[0.16, 0.1, 0.02]} />
            <meshStandardMaterial color="#777" />
          </mesh>
        </primitive>
        <primitive object={rig.dockFront}>
          <mesh position={[0, 0.04, 0.012]}>
            <boxGeometry args={[0.16, 0.08, 0.02]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        </primitive>
        <primitive object={rig.anchors.dockSlot} position={[0, 0.02, 0]} />
      </group>
      <primitive object={rig.console} userData={tag('switch')}>
        <primitive object={rig.body}>
          <mesh>
            <boxGeometry args={[body.width, body.height, body.depth]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </primitive>
        <primitive object={rig.screen} userData={tag('switchScreen')} position={[0, 0, body.depth / 2 + 0.001]}>
          <mesh>
            <planeGeometry args={[body.width * 0.8, body.height * 0.8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </primitive>
      </primitive>
      <primitive object={rig.leftJoycon}>
        <mesh>
          <boxGeometry args={[joycon.width, joycon.height, joycon.depth]} />
          <meshStandardMaterial color="#828282" />
        </mesh>
      </primitive>
      <primitive object={rig.rightJoycon}>
        <mesh>
          <boxGeometry args={[joycon.width, joycon.height, joycon.depth]} />
          <meshStandardMaterial color="#828282" />
        </mesh>
      </primitive>
    </>
  );
}
