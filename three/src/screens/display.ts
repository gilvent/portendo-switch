import { useEffect, useMemo } from 'react';
import { BlendFunction, Effect } from 'postprocessing';
import { ShaderMaterial, type IUniform, type Texture } from 'three';

const sceneAlphaCeiling = 1;
const displayMarkerAlpha = 2;

const displayVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const displayFragmentShader = /* glsl */ `
uniform sampler2D inputA;
uniform sampler2D inputB;
uniform float inputMix;
uniform float power;
varying vec2 vUv;
vec3 encodeSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 decodeSRGB(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main() {
  vec3 shown = mix(encodeSRGB(texture2D(inputA, vUv).rgb), encodeSRGB(texture2D(inputB, vUv).rgb), inputMix);
  gl_FragColor = vec4(decodeSRGB(shown) * power, ${displayMarkerAlpha.toFixed(1)});
}
`;

const neutralToneMappingExceptDisplaysShader = /* glsl */ `
#include <tonemapping_pars_fragment>
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 unbloomed = texture2D(inputBuffer, uv);
  float display = clamp((unbloomed.a - ${sceneAlphaCeiling.toFixed(1)}) / ${(displayMarkerAlpha - sceneAlphaCeiling).toFixed(1)}, 0.0, 1.0);
  outputColor = vec4(mix(NeutralToneMapping(inputColor.rgb), unbloomed.rgb, display), inputColor.a);
}
`;

export class NeutralToneMappingExceptDisplays extends Effect {
  constructor() {
    super('NeutralToneMappingExceptDisplays', neutralToneMappingExceptDisplaysShader, { blendFunction: BlendFunction.SRC });
  }
}

type DisplayUniforms = {
  inputA: IUniform<Texture>;
  inputB: IUniform<Texture>;
  inputMix: IUniform<number>;
  power: IUniform<number>;
};

export function useDisplayMaterial(inputA: Texture, inputB: Texture): { material: ShaderMaterial; uniforms: DisplayUniforms } {
  const display = useMemo(() => {
    const uniforms: DisplayUniforms = { inputA: { value: inputA }, inputB: { value: inputB }, inputMix: { value: 0 }, power: { value: 1 } };
    return { material: new ShaderMaterial({ uniforms, vertexShader: displayVertexShader, fragmentShader: displayFragmentShader }), uniforms };
  }, [inputA, inputB]);
  useEffect(() => () => display.material.dispose(), [display]);
  return display;
}
