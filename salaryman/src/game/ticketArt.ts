// The ticket as paper: one die-cut sheet of cream stock printed in two inks (coral and ink), with holes that are
// really cut, so whatever is behind shows through them. One generator for the big ticket's two faces, the corner
// that shows while he plays, and the stub under the business card at the end.
const INK = '#23262b', CORAL = '#e8552d', CREAM = '#fff6e3';
export type Row = { label: string; round: number; star: number; gotRound: number; gotStar: number };
let uid = 0;
export const star = (cx: number, cy: number, R: number, r = R * .46) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * q).toFixed(2)} ${(cy + Math.sin(a) * q).toFixed(2)}`; } return d + 'Z'; };
export const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
// The cut outline: a rounded card with its top-right corner clipped, a half-round nick top and bottom where the stub
// tears off, and (once the gate has kept it) a bite out of the bottom edge.
export function outline(W: number, H: number, o: { r?: number; clip?: number; perf?: number; nick?: number; bite?: number } = {}) {
  const r = o.r ?? 10, c = o.clip ?? 16, px = o.perf ?? 0, n = o.nick ?? 6, b = o.bite ?? 0;
  let d = `M${r} 0`;
  if (px) d += `H${px - n}a${n} ${n} 0 0 0 ${n * 2} 0`;
  d += `H${W - c}L${W} ${c}V${H - r}a${r} ${r} 0 0 1 ${-r} ${r}`;
  if (px) d += `H${px + n}a${n} ${n} 0 0 0 ${-n * 2} 0`;
  if (b) d += `H${b + 9}a9 11 0 0 0 -18 0`;
  d += `H${r}a${r} ${r} 0 0 1 ${-r} ${-r}V${r}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
  return d;
}
const grain = (id: string) => `<defs><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 -1.5 .82"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>`;
// A row of targets right-aligned from x, outermost the star. Returns the printed rings and the cut holes.
function targets(r: Row, x: number, y: number, step: number, R = 7.5) {
  let print = '', holes = '';
  const cells: { star: boolean; on: boolean }[] = [];
  for (let k = 0; k < r.star; k++) cells.push({ star: true, on: k < r.gotStar });
  for (let k = r.round - 1; k >= 0; k--) cells.push({ star: false, on: k < r.gotRound });
  for (const c of cells) {
    if (c.star) { print += `<path d="${star(x, y, R + 1)}" fill="none" stroke="${CORAL}" stroke-width="1.3" stroke-linejoin="round"/>`; if (c.on) holes += star(x, y, R - 1); }
    else { print += `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${CORAL}" stroke-width="1.3" ${c.on ? '' : 'stroke-dasharray="2.4 2.2"'}/>`; if (c.on) holes += circle(x, y, R * .75); }
    x -= step;
  }
  return { print, holes, x };
}
export function front(person: { name: string; trade: string }, rows: Row[], o: { bite?: boolean } = {}) {
  const W = 380, H = 236, PX = 286, id = `tk${uid++}`;
  let holes = '', print = '';
  rows.forEach((r, i) => {
    const y = 126 + i * 26, t = targets(r, PX - 22, y, 21);
    print += `<text x="20" y="${y + 4.5}" font-size="13" font-weight="500" fill="${INK}">${r.label}</text>` + t.print;
    print += `<line x1="${20 + r.label.length * 7.4 + 8}" y1="${y}" x2="${t.x + 6}" y2="${y}" stroke="#d9c9a6" stroke-width="1.4" stroke-dasharray="1 5" stroke-linecap="round"/>`;
    holes += t.holes;
  });
  const sheet = outline(W, H, { perf: PX, bite: o.bite ? 52 : 0 }) + holes;
  return `<svg class="tkp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Day pass: ${person.name}, ${person.trade}">${grain(id + 'g')}
    <path d="${sheet}" fill="${CREAM}" fill-rule="evenodd"/>
    <clipPath id="${id}c"><path d="${sheet}" clip-rule="evenodd"/></clipPath>
    <g clip-path="url(#${id}c)" font-family="Fredoka, sans-serif">
      <rect x="${PX}" y="0" width="${W - PX}" height="${H}" fill="${CORAL}"/>
      <rect x="0" y="0" width="${PX}" height="30" fill="${CORAL}"/>
      <text x="20" y="20" font-size="11.5" font-weight="600" letter-spacing="1.6" fill="${CREAM}">MRT · DAY PASS</text>
      <text x="20" y="66" font-size="29" font-weight="700" fill="${INK}">${person.name}</text>
      <text x="20" y="87" font-size="13.5" font-weight="500" fill="#62676f">${person.trade}</text>
      ${print}
      <line x1="${PX}" y1="10" x2="${PX}" y2="${H - 10}" stroke="${CREAM}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>
      ${stub((PX + W) / 2 + 2, 'for contact')}
      <rect width="${W}" height="${H}" filter="url(#${id}g)" opacity=".5"/>
    </g></svg>`;
}
function stub(cx: number, line: string) {
  return `<g fill="${CREAM}" text-anchor="middle" transform="translate(${cx} 0)">
    <text y="22" font-size="10" font-weight="600" letter-spacing="1.2">No. 0042</text>
    <g transform="translate(0 112)"><path d="M-20 -8a22 22 0 0 1 38 -6M20 8a22 22 0 0 1 -38 6" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/><path d="M22 -24v13h-13zM-22 24v-13h13z"/></g>
    <text y="170" font-size="15" font-weight="700">FLIP</text><text y="187" font-size="11" font-weight="500">${line}</text></g>`;
}
// The contact side: the same sheet turned over (the stub on the left), no holes, so the links stay legible.
export function back(o: { bite?: boolean } = {}) {
  const W = 380, H = 236, PX = 94, id = `tk${uid++}`;
  const sheet = outline(W, H, { perf: W - PX, bite: o.bite ? W - 52 : 0 });
  return `<svg class="tkp" viewBox="0 0 ${W} ${H}" aria-hidden="true">${grain(id + 'g')}
    <path d="${sheet}" fill="${CREAM}" transform="translate(${W} 0) scale(-1 1)"/>
    <clipPath id="${id}c"><path d="${sheet}" transform="translate(${W} 0) scale(-1 1)"/></clipPath>
    <g clip-path="url(#${id}c)" font-family="Fredoka, sans-serif">
      <rect x="0" y="0" width="${PX}" height="${H}" fill="${CORAL}"/>
      <line x1="${PX}" y1="10" x2="${PX}" y2="${H - 10}" stroke="${CREAM}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>
      ${stub(PX / 2, 'for ticket')}
      <rect width="${W}" height="${H}" filter="url(#${id}g)" opacity=".5"/>
    </g></svg>`;
}
// The corner that shows while he plays: one row, square at the screen's corner, clipped at its free corner.
export function corner(r: Row) {
  const n = r.round + r.star, W = 46 + n * 20 + 24, H = 50, id = `tk${uid++}`;
  let holes = '', print = '', x = 30;
  for (let k = 0; k < r.round; k++) { const on = k < r.gotRound; print += `<circle cx="${x}" cy="33" r="7.2" fill="none" stroke="${CORAL}" stroke-width="1.3" ${on ? '' : 'stroke-dasharray="2.4 2.2"'}/>`; if (on) holes += circle(x, 33, 5.4); x += 20; }
  for (let k = 0; k < r.star; k++) { const on = k < r.gotStar; print += `<path d="${star(x, 33, 8.2)}" fill="none" stroke="${CORAL}" stroke-width="1.3" stroke-linejoin="round"/>`; if (on) holes += star(x, 33, 6.2); x += 20; }
  const cut = `M0 0H${W}V${H - 14}L${W - 14} ${H}H0Z` + holes;
  return `<svg class="tkp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grain(id + 'g')}
    <path d="${cut}" fill="${CREAM}" fill-rule="evenodd"/><clipPath id="${id}c"><path d="${cut}" clip-rule="evenodd"/></clipPath>
    <g clip-path="url(#${id}c)" font-family="Fredoka, sans-serif"><rect width="12" height="${H}" fill="${CORAL}"/>
    <text x="22" y="17" font-size="11" font-weight="600" fill="#62676f">${r.label}</text>${print}
    <rect width="${W}" height="${H}" filter="url(#${id}g)" opacity=".5"/></g></svg>`;
}
// Where the newest hole of a corner sits (for the jaw and the chad).
export function cornerHole(r: Row, starHole: boolean) {
  const i = starHole ? r.round + r.gotStar - 1 : r.gotRound - 1;
  return { x: 30 + i * 20, y: 33 };
}
// The day's strip, a stub of ticket stock with real holes, tucked under the business card at the end.
export function strip(rows: Row[], gold: boolean) {
  let x = 14, print = '', holes = '';
  for (const r of rows) {
    print += `<text x="${x}" y="30" font-size="10" font-weight="500" fill="#9a8f78">${r.label}</text>`; x += r.label.length * 5.6 + 8;
    for (let k = 0; k < r.round; k++) { const on = k < r.gotRound; print += `<circle cx="${x}" cy="27" r="6" fill="none" stroke="${CORAL}" stroke-width="1.2" ${on ? '' : 'stroke-dasharray="2 2"'}/>`; if (on) holes += circle(x, 27, 4.5); x += 15; }
    for (let k = 0; k < r.star; k++) { const on = k < r.gotStar; print += `<path d="${star(x, 27, 7)}" fill="none" stroke="${CORAL}" stroke-width="1.2" stroke-linejoin="round"/>`; if (on) holes += star(x, 27, 5.2); x += 15; }
    x += 10;
  }
  const W = x + 64, H = 44, id = `tk${uid++}`;
  let top = 'M0 6'; for (let i = 0; i <= W; i += 8) top += `L${i} ${i % 16 ? 0 : 6}`;
  const cut = `${top}L${W} 6V${H}H0Z` + holes;
  return `<svg class="ec-stub-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${grain(id + 'g')}
    <path d="${cut}" fill="${CREAM}" fill-rule="evenodd"/><clipPath id="${id}c"><path d="${cut}" clip-rule="evenodd"/></clipPath>
    <g clip-path="url(#${id}c)" font-family="Fredoka, sans-serif">${print}
      <rect x="${W - 64}" y="0" width="64" height="${H}" fill="${gold ? '#f6b73c' : CORAL}"/>
      <text x="${W - 32}" y="30" font-size="10" font-weight="600" fill="${CREAM}" text-anchor="middle" letter-spacing="1">No. 0042</text>
      <rect width="${W}" height="${H}" filter="url(#${id}g)" opacity=".5"/></g></svg>`;
}
