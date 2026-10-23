import { Canvas } from '@react-three/fiber';
import { CameraRig } from './camera/CameraRig';
import { ConsoleProvider } from './console/ConsoleProvider';
import { Interaction } from './input/Interaction';
import { useKeyboard } from './input/useKeyboard';
import { useTransitionDirector } from './motion/useTransitionDirector';
import { RigProvider } from './rig/RigProvider';
import { Scene } from './scene/Scene';
import { HintStrip } from './ui/HintStrip';
import { TouchButtonBar } from './ui/TouchButtonBar';

function Director() {
  useTransitionDirector();
  return null;
}

function Shell() {
  useKeyboard();
  return (
    <>
      <Canvas shadows dpr={[1, 2]} style={{ position: 'fixed', inset: 0, touchAction: 'none' }}>
        <RigProvider>
          <CameraRig />
          <Scene />
          <Interaction />
          <Director />
        </RigProvider>
      </Canvas>
      <HintStrip />
      <TouchButtonBar />
    </>
  );
}

export function App() {
  return (
    <ConsoleProvider>
      <Shell />
    </ConsoleProvider>
  );
}
