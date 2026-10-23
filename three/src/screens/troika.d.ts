declare module 'troika-three-text' {
  export function preloadFont(options: { font: string; characters: string | readonly string[]; sdfGlyphSize: number }, callback: () => void): void;
}
