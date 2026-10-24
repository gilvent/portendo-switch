import gsap from 'gsap';
import { MathUtils, type Group } from 'three';
import { cloudLayers, intro as introLayout, stickers as stickerLayout } from './homeLayout';

export type CloudLayerId = (typeof cloudLayers)[number]['id'];

export type HomeParts = {
  layers: (Group | null)[];
  clouds: (Group | null)[][];
  intro: (Group | null)[];
  stickers: (Group | null)[];
};

export function createHomeParts(): HomeParts {
  return { layers: [], clouds: cloudLayers.map(() => []), intro: [], stickers: [] };
}

export type Fade = { group: Group; value: { opacity: number } };

const layerEntrance = {
  dark: { start: 0, containerSeconds: 0.5 },
  light: { start: 0.2, containerSeconds: 0.3 },
} as const satisfies Record<CloudLayerId, { start: number; containerSeconds: number }>;

const entrance = {
  cloudRise: 80,
  layerRise: 40,
  cloudSeconds: 0.5,
  cloudStagger: 0.3,
  intro: { start: 0.2, rise: 50, seconds: 0.5, stagger: 0.15 },
  stickers: { start: 0.7, scale: 1.2, seconds: 0.5, stagger: 0.12 },
} as const;

const float = {
  cloudSeconds: 5,
  cloudReach: 15,
  stickerBob: 6,
  stickerBobSeconds: 3.2,
  stickerSway: MathUtils.degToRad(3),
  stickerSwaySeconds: 4.4,
} as const;

function mounted(group: Group | null, name: string): Group {
  if (group === null) throw new Error(`enterHome: ${name} is not mounted`);
  return group;
}

export function enterHome(parts: HomeParts): { timeline: gsap.core.Timeline; fades: Fade[] } {
  const timeline = gsap.timeline();
  const fades: Fade[] = [];
  const fadeIn = (groups: Group[], at: number, stagger: number, seconds: number) => {
    const values = groups.map((group) => {
      const value = { opacity: 0 };
      fades.push({ group, value });
      return value;
    });
    timeline.fromTo(values, { opacity: 0 }, { opacity: 1, duration: seconds, ease: 'power1.out', stagger }, at);
  };

  cloudLayers.forEach(({ id, clouds: layout }, layerIndex) => {
    const { start, containerSeconds } = layerEntrance[id];
    const clouds = layout.map((_, index) => mounted(parts.clouds[layerIndex]?.[index] ?? null, `${id} cloud ${index}`));
    timeline.fromTo(
      clouds.map((cloud) => cloud.position),
      { y: -entrance.cloudRise },
      { y: 0, duration: entrance.cloudSeconds, ease: 'power1.out', stagger: entrance.cloudStagger },
      start,
    );
    timeline.fromTo(mounted(parts.layers[layerIndex] ?? null, `${id} layer`).position, { y: -entrance.layerRise }, { y: 0, duration: containerSeconds, ease: 'power1.out' }, start + entrance.cloudStagger);
    const floatsFrom = start + entrance.cloudSeconds + entrance.cloudStagger * (clouds.length - 1) + Math.random();
    for (const cloud of clouds) {
      timeline.to(cloud.position, { y: -gsap.utils.random(0, float.cloudReach), duration: float.cloudSeconds, ease: 'sine.inOut', yoyo: true, repeat: -1 }, floatsFrom);
    }
  });

  const intro = [introLayout.greeting, ...introLayout.lines].map((_, index) => mounted(parts.intro[index] ?? null, `intro line ${index}`));
  timeline.fromTo(
    intro.map((line) => line.position),
    { y: -entrance.intro.rise },
    { y: 0, duration: entrance.intro.seconds, ease: 'back.out', stagger: entrance.intro.stagger },
    entrance.intro.start,
  );
  fadeIn(intro, entrance.intro.start, entrance.intro.stagger, entrance.intro.seconds);

  const stickers = stickerLayout.map(({ id }, index) => mounted(parts.stickers[index] ?? null, `sticker ${id}`));
  const { scale } = entrance.stickers;
  timeline.fromTo(
    stickers.map((sticker) => sticker.scale),
    { x: scale, y: scale },
    { x: 1, y: 1, duration: entrance.stickers.seconds, ease: 'power1.out', stagger: entrance.stickers.stagger },
    entrance.stickers.start,
  );
  fadeIn(stickers, entrance.stickers.start, entrance.stickers.stagger, entrance.stickers.seconds);
  stickers.forEach((sticker, index) => {
    const settled = entrance.stickers.start + entrance.stickers.stagger * index + entrance.stickers.seconds;
    const side = index % 2 === 0 ? 1 : -1;
    timeline.to(sticker.position, { y: float.stickerBob, duration: float.stickerBobSeconds, ease: 'sine.inOut', yoyo: true, repeat: -1 }, settled);
    timeline.to(sticker.rotation, { z: side * float.stickerSway, duration: float.stickerSwaySeconds, ease: 'sine.inOut', yoyo: true, repeat: -1 }, settled);
  });

  return { timeline, fades };
}
