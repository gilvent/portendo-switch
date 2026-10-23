import { useRef } from 'react';
import type { Group } from 'three';
import type { MenuPage } from '../console/model';
import { palette } from '../theme/palette';
import { fonts } from './fonts';
import { ScreenImage, ScreenText } from './primitives';
import type { ScreenSize } from './useScreenTexture';

export const consoleScreenHeight = 112;

export function consoleScreenSize(aspect: number): ScreenSize {
  return [consoleScreenHeight * aspect, consoleScreenHeight];
}

const fromTop = (y: number) => consoleScreenHeight / 2 - y;

const home = {
  icon: { y: 47, radius: 25, ring: 2, image: 30 },
  guide: { y: 90, badgeRadius: 9, badgeFontSize: 13, gap: 4, fontSize: 14 },
} as const;

const work = {
  title: { y: 38, fontSize: 25.6 },
  guide: { y: 86.5, fontSize: 14 },
} as const;

const background = { home: palette.menuGrey, work: palette.menuBlue } as const satisfies Record<MenuPage, string>;

export function ConsoleScreen({ page, size }: { page: MenuPage; size: ScreenSize }) {
  const [width, height] = size;
  return (
    <>
      <mesh position-z={-1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={background[page]} toneMapped={false} />
      </mesh>
      {page === 'home' ? <HomePage /> : <WorkPage />}
    </>
  );
}

function HomePage() {
  const { icon } = home;
  return (
    <>
      <group position-y={fromTop(icon.y)}>
        <mesh>
          <ringGeometry args={[icon.radius - icon.ring, icon.radius, 96]} />
          <meshBasicMaterial color={palette.screenWhite} toneMapped={false} />
        </mesh>
        <ScreenImage image="home" width={icon.image} z={1} />
      </group>
      <GetStarted />
    </>
  );
}

function GetStarted() {
  const { guide } = home;
  const row = useRef<Group>(null);
  const badgeWidth = guide.badgeRadius * 2;
  const centreRow = (label: { textRenderInfo: { blockBounds: [number, number, number, number] } }) => {
    const [minX, , maxX] = label.textRenderInfo.blockBounds;
    if (row.current === null) throw new Error('GetStarted: row group is not mounted');
    row.current.position.x = -(badgeWidth + guide.gap + maxX - minX) / 2;
  };
  return (
    <group ref={row} position-y={fromTop(guide.y)}>
      <mesh position-x={guide.badgeRadius}>
        <circleGeometry args={[guide.badgeRadius, 64]} />
        <meshBasicMaterial color={palette.screenWhite} toneMapped={false} />
      </mesh>
      <ScreenText font={fonts.fredoka500} fontSize={guide.badgeFontSize} color={palette.badgeInk} anchorX="center" anchorY="middle" position={[guide.badgeRadius, 0, 1]}>
        B
      </ScreenText>
      <ScreenText
        font={fonts.fredoka500}
        fontSize={guide.fontSize}
        color={palette.screenWhite}
        anchorX="left"
        anchorY="middle"
        position={[badgeWidth + guide.gap, 0, 1]}
        onSync={centreRow}
      >
        Get started
      </ScreenText>
    </group>
  );
}

function WorkPage() {
  return (
    <>
      <ScreenText font={fonts.gaban} fontSize={work.title.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle" position={[0, fromTop(work.title.y), 0]}>
        WORK
      </ScreenText>
      <ScreenText font={fonts.fredoka500} fontSize={work.guide.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle" position={[0, fromTop(work.guide.y), 0]}>
        Press B to start
      </ScreenText>
    </>
  );
}
