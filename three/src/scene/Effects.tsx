import { Bloom, EffectComposer, N8AO, wrapEffect } from '@react-three/postprocessing';
import { HalfFloatType } from 'three';
import { NeutralToneMappingExceptDisplays } from '../screens/display';

const multisampling = window.devicePixelRatio > 1 ? 0 : 4;
const ToneMapping = wrapEffect(NeutralToneMappingExceptDisplays);

export function Effects() {
  return (
    <EffectComposer multisampling={multisampling} frameBufferType={HalfFloatType}>
      <N8AO aoRadius={0.12} distanceFalloff={0.6} intensity={1.6} quality="medium" halfRes />
      <Bloom luminanceThreshold={2.2} luminanceSmoothing={0.3} intensity={0.4} mipmapBlur />
      <ToneMapping />
    </EffectComposer>
  );
}
