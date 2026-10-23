import { Canvas } from '@react-three/fiber';
import { ConsoleProvider } from './console/ConsoleProvider';
import { useKeyboard } from './input/useKeyboard';
import { useTransitionDirector } from './motion/useTransitionDirector';
import { palette } from './theme/palette';
import { HintStrip } from './ui/HintStrip';
import { TouchButtonBar } from './ui/TouchButtonBar';

function Scene() {
  useTransitionDirector();
  return <color attach="background" args={[palette.wall]} />;
}

function Shell() {
  useKeyboard();
  return (
    <>
      <Canvas className="stage">
        <Scene />
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
