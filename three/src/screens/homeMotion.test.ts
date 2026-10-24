import gsap from 'gsap';
import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import { cloudLayers, intro, stickers } from './homeLayout';
import { enterHome, type HomeParts } from './homeMotion';

function mountedParts(): HomeParts {
  return {
    layers: cloudLayers.map(() => new Group()),
    clouds: cloudLayers.map((layer) => layer.clouds.map(() => new Group())),
    intro: [intro.greeting, ...intro.lines].map(() => new Group()),
    stickers: stickers.map(() => new Group()),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

function reading(parts: HomeParts, fades: ReturnType<typeof enterHome>['fades']) {
  const opacityOf = (group: Group | null) => round(fades.find((fade) => fade.group === group)?.value.opacity ?? NaN);
  return {
    cloudHeights: parts.clouds.flat().map((cloud) => round(cloud?.position.y ?? NaN)),
    layerHeights: parts.layers.map((layer) => round(layer?.position.y ?? NaN)),
    introHeights: parts.intro.map((line) => round(line?.position.y ?? NaN)),
    introOpacity: parts.intro.map(opacityOf),
    stickerScale: parts.stickers.map((sticker) => round(sticker?.scale.x ?? NaN)),
    stickerOpacity: parts.stickers.map(opacityOf),
  };
}

describe('enterHome', () => {
  it('starts with the clouds sunk, the intro lowered and hidden, and the stickers enlarged and hidden', () => {
    const parts = mountedParts();
    const { timeline, fades } = enterHome(parts);
    timeline.pause(0);
    expect(reading(parts, fades)).toEqual({
      cloudHeights: [-80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80],
      layerHeights: [-40, -40],
      introHeights: [-50, -50, -50],
      introOpacity: [0, 0, 0],
      stickerScale: [1.2, 1.2, 1.2, 1.2],
      stickerOpacity: [0, 0, 0, 0],
    });
    timeline.kill();
  });

  it('has everything entered by four seconds, with the clouds floating within 15 units below their rest', () => {
    const parts = mountedParts();
    const { timeline, fades } = enterHome(parts);
    timeline.pause(4);
    const { cloudHeights, ...rest } = reading(parts, fades);
    expect(rest).toEqual({
      layerHeights: [0, 0],
      introHeights: [0, 0, 0],
      introOpacity: [1, 1, 1],
      stickerScale: [1, 1, 1, 1],
      stickerOpacity: [1, 1, 1, 1],
    });
    expect(cloudHeights.filter((y) => y > 0 || y < -15)).toEqual([]);
    timeline.kill();
  });

  it('keeps the clouds drifting and the stickers bobbing and swaying after the entrance', () => {
    const parts = mountedParts();
    const { timeline } = enterHome(parts);
    const clouds = parts.clouds.flat();
    const lowest = clouds.map(() => 0);
    for (let seconds = 4; seconds <= 14; seconds += 0.25) {
      timeline.pause(seconds);
      clouds.forEach((cloud, index) => (lowest[index] = Math.min(lowest[index] ?? 0, cloud?.position.y ?? 0)));
    }
    timeline.pause(3);
    const bobbing = parts.stickers.filter((sticker) => (sticker?.position.y ?? 0) > 1 && Math.abs(sticker?.rotation.z ?? 0) > 0.01).length;
    expect({ drifting: lowest.filter((y) => y < -0.1).length >= 12, bobbing }).toEqual({ drifting: true, bobbing: 4 });
    timeline.kill();
  });

  it('names the part that is missing instead of animating around it', () => {
    const parts = mountedParts();
    parts.stickers[2] = null;
    expect(() => enterHome(parts)).toThrow('enterHome: sticker github is not mounted');
  });

  it('leaves no tween behind once killed, floats included', () => {
    const parts = mountedParts();
    const { timeline, fades } = enterHome(parts);
    timeline.pause(10);
    timeline.kill();
    const targets = [
      ...parts.clouds.flat().map((cloud) => cloud?.position),
      ...parts.stickers.flatMap((sticker) => [sticker?.position, sticker?.rotation, sticker?.scale]),
      ...fades.map((fade) => fade.value),
    ];
    expect(gsap.getTweensOf(targets)).toEqual([]);
  });
});
