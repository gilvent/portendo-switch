import { Bloom, EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

const multisampling = window.devicePixelRatio > 1 ? 0 : 4;

export function Effects() {
  return (
    <EffectComposer multisampling={multisampling}>
      <N8AO aoRadius={0.12} distanceFalloff={0.6} intensity={1.6} quality="medium" halfRes />
      <Bloom luminanceThreshold={2.2} luminanceSmoothing={0.3} intensity={0.4} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
