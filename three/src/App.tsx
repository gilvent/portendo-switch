import { Canvas } from '@react-three/fiber';
import { use } from 'react';
import { CameraRig } from './camera/CameraRig';
import { ConsoleProvider } from './console/ConsoleProvider';
import { Interaction } from './input/Interaction';
import { useKeyboard } from './input/useKeyboard';
import { useIdles } from './motion/useIdles';
import { useTransitionDirector } from './motion/useTransitionDirector';
import { RigProvider } from './rig/RigProvider';
import { Scene } from './scene/Scene';
import { screenAssets } from './screens/screenAssets';
import { HintStrip } from './ui/HintStrip';
import { TouchButtonBar } from './ui/TouchButtonBar';

function Director() {
  useTransitionDirector();
  useIdles();
  return null;
}

function Keyboard() {
  useKeyboard();
  return null;
}

export function App() {
  use(screenAssets());
  return (
    <ConsoleProvider>
      <Keyboard />
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
    </ConsoleProvider>
  );
}
