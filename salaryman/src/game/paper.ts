import * as THREE from 'three';

// Greybox paper: flat cut cards and folded boxes in plain colours, so a scene can be built and played before it is
// drawn. A card is a plane with a white core rim (the cut edge of coated card); a box is a box.
const cardGeo = new THREE.PlaneGeometry(1, 1).translate(0, .5, 0);
export function mat(color: THREE.ColorRepresentation, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: .92, metalness: 0, ...opts });
}
export function box(w: number, h: number, d: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true;
  return m;
}
// A card drawn by a 2D canvas painter: the quickest way to put a face, a sign or a label on paper.
export function card(w: number, h: number, paint: (g: CanvasRenderingContext2D, W: number, H: number) => void, opts: { rim?: number; res?: number; double?: boolean } = {}) {
  const res = opts.res ?? 160, rim = opts.rim ?? .035;
  const W = Math.ceil((w + rim * 2) * res), H = Math.ceil((h + rim * 2) * res);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => {
    g.clearRect(0, 0, W, H);
    const art = document.createElement('canvas'); art.width = W; art.height = H;
    const a = art.getContext('2d')!; a.translate(rim * res, rim * res);
    paint(a, w * res, h * res);
    // The white core: the art's silhouette grown by the rim, under the art.
    const r = Math.max(1, Math.round(rim * res));
    for (let i = 0; i < 16; i++) { const t = i / 16 * Math.PI * 2; g.drawImage(art, Math.cos(t) * r, Math.sin(t) * r); }
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fffaf0'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over'; g.drawImage(art, 0, 0);
    tex.needsUpdate = true;
  };
  redraw();
  const m = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .5, side: opts.double === false ? THREE.FrontSide : THREE.DoubleSide, roughness: .95 }));
  m.scale.set(w + rim * 2, h + rim * 2, 1); m.position.y = -rim;
  m.castShadow = true; m.receiveShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .5 });
  return Object.assign(m, { redraw });
}
export function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = '#23262b', align: CanvasTextAlign = 'center', weight = 600, maxW = 0) {
  g.font = `${weight} ${size}px Fredoka, system-ui, sans-serif`;
  // Too wide for its card: the type shrinks to fit rather than run off the paper.
  if (maxW) { const w = g.measureText(text).width; if (w > maxW) g.font = `${weight} ${Math.floor(size * maxW / w)}px Fredoka, system-ui, sans-serif`; } g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(text, x, y);
}
export function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string) {
  g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); }
}
