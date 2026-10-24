declare module 'troika-three-text' {
  import type { BufferGeometry, Material, Mesh, Object3DEventMap } from 'three';

  export function preloadFont(options: { font: string; characters: string | readonly string[]; sdfGlyphSize: number }, callback: () => void): void;

  export class Text extends Mesh<BufferGeometry, Material, Object3DEventMap & { syncstart: object; synccomplete: object }> {
    text: string;
    font: string;
    fontSize: number;
    color: string;
    anchorX: 'left' | 'center' | 'right';
    anchorY: 'top' | 'middle' | 'bottom';
    readonly textRenderInfo: { blockBounds: [minX: number, minY: number, maxX: number, maxY: number] };
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
