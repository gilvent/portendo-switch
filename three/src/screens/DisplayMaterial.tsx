import type { ComponentProps } from 'react';
import type { WebGLProgramParametersWithUniforms } from 'three';

// Screens show display-referred sRGB pixels, but the whole frame then passes through the
// composer's Neutral tone curve. Feeding the curve its exact inverse makes the curve hand
// back the authored pixel. Peaks are capped where the inverse stays below the bloom threshold.
const inverseNeutral = /* glsl */ `
vec3 inverseNeutralToneMapping( vec3 color ) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  const float d = 1. - startCompression;
  const float ceiling = 0.96;
  color = min( color, vec3( ceiling ) );
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
    .replace('void main() {', `${inverseNeutral}\nvoid main() {`)
    .replace('#include <opaque_fragment>', 'outgoingLight = inverseNeutralToneMapping( outgoingLight );\n#include <opaque_fragment>');
}

const cacheKey = () => 'display-referred';

export function DisplayMaterial(props: Omit<ComponentProps<'meshBasicMaterial'>, 'onBeforeCompile' | 'customProgramCacheKey' | 'toneMapped'>) {
  return <meshBasicMaterial {...props} toneMapped={false} onBeforeCompile={compensateToneMapping} customProgramCacheKey={cacheKey} />;
}
