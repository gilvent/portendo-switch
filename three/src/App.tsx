import { Canvas } from '@react-three/fiber';
import { palette } from './theme/palette';

export function App() {
  return (
    <Canvas className="stage">
      <color attach="background" args={[palette.wall]} />
    </Canvas>
  );
}
