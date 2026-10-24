import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { PlaneGeometry, Shape, ShapeGeometry, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import type { MenuPage } from '../console/model';
import type { Loading } from '../rig/rig';
import { palette } from '../theme/palette';
import { consoleScreenText } from './consoleText';
import { ScreenImage, ScreenText } from './primitives';
import { useScreenGate, type ScreenSize } from './useScreenTexture';

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

const guideRowY = { home: home.guide.y, work: work.guide.y } as const satisfies Record<MenuPage, number>;
const loadingBar = { guidePadding: 4, widthFraction: 0.8, height: 12, border: 1, coverHeight: 24, coverZ: 2, barZ: 3 } as const;

export function ConsoleScreen({ page, size, loading }: { page: MenuPage; size: ScreenSize; loading?: Loading }) {
  const [width, height] = size;
  return (
    <>
      <mesh position-z={-1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={background[page]} toneMapped={false} />
      </mesh>
      {page === 'home' ? <HomePage /> : <WorkPage />}
      {loading === undefined ? null : <LoadingBar loading={loading} page={page} width={width} />}
    </>
  );
}

function rectangle(width: number, height: number): Shape {
  return new Shape().moveTo(-width / 2, -height / 2).lineTo(width / 2, -height / 2).lineTo(width / 2, height / 2).lineTo(-width / 2, height / 2).closePath();
}

function LoadingBar({ loading, page, width }: { loading: Loading; page: MenuPage; width: number }) {
  const { invalidate } = useScreenGate();
  const { height, border } = loadingBar;
  const barWidth = loadingBar.widthFraction * (width - 2 * loadingBar.guidePadding);
  const outline = useMemo(() => {
    const shape = rectangle(barWidth + 2 * border, height + 2 * border);
    shape.holes.push(rectangle(barWidth, height));
    return new ShapeGeometry(shape);
  }, [barWidth, border, height]);
  const fillGeometry = useMemo(() => new PlaneGeometry(1, height).translate(0.5, 0, 0), [height]);
  const cover = useRef<MeshBasicMaterial>(null);
  const outlineMaterial = useRef<MeshBasicMaterial>(null);
  const fill = useRef<Mesh>(null);
  const fillMaterial = useRef<MeshBasicMaterial>(null);
  const shown = useRef<Loading | null>(null);

  useFrame(() => {
    const last = shown.current;
    if (last !== null && last.guide === loading.guide && last.bar === loading.bar && last.progress === loading.progress) return;
    if (cover.current === null || outlineMaterial.current === null || fill.current === null || fillMaterial.current === null) {
      throw new Error('LoadingBar: meshes are not mounted');
    }
    cover.current.opacity = 1 - loading.guide;
    outlineMaterial.current.opacity = loading.bar;
    fillMaterial.current.opacity = loading.bar;
    fill.current.visible = loading.progress > 0;
    fill.current.scale.x = loading.progress * barWidth;
    shown.current = { ...loading };
    invalidate();
  });

  return (
    <group position-y={fromTop(guideRowY[page])}>
      <mesh position-z={loadingBar.coverZ}>
        <planeGeometry args={[width, loadingBar.coverHeight]} />
        <meshBasicMaterial ref={cover} color={background[page]} transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh geometry={outline} position-z={loadingBar.barZ}>
        <meshBasicMaterial ref={outlineMaterial} color={palette.screenWhite} transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={fill} geometry={fillGeometry} position={[-barWidth / 2, 0, loadingBar.barZ]} visible={false}>
        <meshBasicMaterial ref={fillMaterial} color={palette.screenWhite} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
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
      <ScreenText font="fredoka500" fontSize={guide.badgeFontSize} color={palette.badgeInk} anchorX="center" anchorY="middle" position={[guide.badgeRadius, 0, 1]}>
        {consoleScreenText.homeBadge}
      </ScreenText>
      <ScreenText
        font="fredoka500"
        fontSize={guide.fontSize}
        color={palette.screenWhite}
        anchorX="left"
        anchorY="middle"
        position={[badgeWidth + guide.gap, 0, 1]}
        onSync={centreRow}
      >
        {consoleScreenText.homeGuide}
      </ScreenText>
    </group>
  );
}

function WorkPage() {
  return (
    <>
      <ScreenText font="gaban" fontSize={work.title.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle" position={[0, fromTop(work.title.y), 0]}>
        {consoleScreenText.workTitle}
      </ScreenText>
      <ScreenText font="fredoka500" fontSize={work.guide.fontSize} color={palette.screenWhite} anchorX="center" anchorY="middle" position={[0, fromTop(work.guide.y), 0]}>
        {consoleScreenText.workGuide}
      </ScreenText>
    </>
  );
}
