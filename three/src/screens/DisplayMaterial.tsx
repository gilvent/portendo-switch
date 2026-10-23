import type { ComponentProps } from 'react';
import type { WebGLProgramParametersWithUniforms } from 'three';

const bloomSafePeak = 0.96;

const inverseNeutralToneMappingGlsl = /* glsl */ `
vec3 inverseNeutralToneMapping( vec3 color ) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  const float d = 1. - startCompression;
  color = min( color, vec3( ${bloomSafePeak.toFixed(2)} ) );
  float newPeak = max( color.r, max( color.g, color.b ) );
  if ( newPeak >= startCompression ) {
    float peak = d * d / ( 1. - newPeak ) - d + startCompression;
    float g = 1. - 1. / ( desaturation * ( peak - newPeak ) + 1. );
    color = ( color - g * newPeak ) / ( 1. - g ) * ( peak / newPeak );
  }
  float low = min( color.r, min( color.g, color.b ) );
  float offset = low < 0.04 ? sqrt( max( low, 0. ) / 6.25 ) - low : 0.04;
  return color + offset;
}
`;

function compensateToneMapping(shader: WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader
    .replace('void main() {', `${inverseNeutralToneMappingGlsl}\nvoid main() {`)
    .replace('#include <opaque_fragment>', 'outgoingLight = inverseNeutralToneMapping( outgoingLight );\n#include <opaque_fragment>');
}

const cacheKey = () => 'display-referred';

export function DisplayMaterial(props: Omit<ComponentProps<'meshBasicMaterial'>, 'onBeforeCompile' | 'customProgramCacheKey' | 'toneMapped'>) {
  return <meshBasicMaterial {...props} toneMapped={false} onBeforeCompile={compensateToneMapping} customProgramCacheKey={cacheKey} />;
}
