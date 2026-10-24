import { FloatType, HalfFloatType, UnsignedByteType, type WebGLRenderer } from 'three';
import { describe, expect, it } from 'vitest';
import { NeutralToneMappingExceptDisplays } from './display';

const noRenderer = null as unknown as WebGLRenderer;

describe('NeutralToneMappingExceptDisplays', () => {
  it('refuses an 8-bit composer buffer, which would clamp the display marker and tone-map the screens', () => {
    expect(() => new NeutralToneMappingExceptDisplays().initialize(noRenderer, false, UnsignedByteType)).toThrow(
      'NeutralToneMappingExceptDisplays: the composer buffer must be HalfFloat or Float to carry the display alpha marker 2',
    );
  });

  it('accepts half-float and float composer buffers', () => {
    expect(() => new NeutralToneMappingExceptDisplays().initialize(noRenderer, false, HalfFloatType)).not.toThrow();
    expect(() => new NeutralToneMappingExceptDisplays().initialize(noRenderer, false, FloatType)).not.toThrow();
  });
});
