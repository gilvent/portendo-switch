export type AssetKind = 'font' | 'image';

const startsWith = (bytes: Uint8Array, offset: number, tag: string) => [...tag].every((char, i) => bytes[offset + i] === char.charCodeAt(0));

const signatures: Record<AssetKind, readonly ((bytes: Uint8Array) => boolean)[]> = {
  font: ['wOFF', '\x00\x01\x00\x00', 'OTTO', 'true'].map((tag) => (bytes: Uint8Array) => startsWith(bytes, 0, tag)),
  image: [(bytes) => startsWith(bytes, 0, '\x89PNG\r\n\x1a\n'), (bytes) => startsWith(bytes, 0, 'RIFF') && startsWith(bytes, 8, 'WEBP')],
};

export function verifyAsset(url: string, kind: AssetKind, bytes: Uint8Array, contentType: string | null): void {
  if (kind === 'font' && startsWith(bytes, 0, 'wOF2')) throw new Error(`screen assets: ${url} is a woff2 font, and troika cannot parse woff2`);
  if (!signatures[kind].some((matches) => matches(bytes))) {
    throw new Error(`screen assets: ${url} is not a valid ${kind} file (got ${contentType ?? 'no content type'}, ${bytes.length} bytes)`);
  }
}
