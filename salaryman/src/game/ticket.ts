import { PERSON, ROWS } from './content.ts';
import type { Game } from './game.ts';
import type { Shell } from '../shell/console.ts';
import { sfx } from './sfx.ts';
import './ticket.css';
import { back, corner, cornerHole, front, type Row } from './ticketArt.ts';

// The one meta object. Printed at the gate, it is his card: the front is the line, a row of hole outlines per station
// (how many, never which); the back is how to reach him. Every fact found punches a hole, and its chad falls out.
// Docked, only its corner shows: the row of the place he is in. X (or a tap) brings it up and flips it.
const row = (id: string) => ROWS.find(r => r.id === id)!;
const rowOf = (place: string) => (place.startsWith('stop-') ? place.slice(5) : 'line');
export class Ticket {
  el: HTMLElement; private corner: HTMLElement; private big: HTMLElement;
  private state: 'none' | 'corner' | 'front' | 'back' = 'none';
  constructor(shell: Shell, private g: Game) {
    this.el = document.createElement('div'); this.el.className = 'ticket-layer';
    this.el.innerHTML = `<button class="ticket-corner" data-testid="ticket-corner" aria-label="Ticket"></button>
      <div class="ticket-big" data-testid="ticket"><div class="tk-card"><div class="tk-face tk-front"></div><div class="tk-face tk-back"></div></div>
      <p class="tk-hint"></p></div>`;
    shell.screen.appendChild(this.el);
    this.corner = this.el.querySelector('.ticket-corner')!; this.big = this.el.querySelector('.ticket-big')!;
    this.corner.addEventListener('click', () => this.open('front'));
    this.big.addEventListener('click', e => { if ((e.target as HTMLElement).closest('a')) return; this.state === 'front' ? this.open('back') : this.close(); });
    this.drawBack();
    g.listeners.add((e, d) => {
      if (e === 'ticket-print') this.print();
      if (e === 'punch') this.punched(d as { row: string; star: boolean });
      if (e === 'place') this.drawCorner();
      if (e === 'tap-out') setTimeout(() => this.bite(), 450);
      if (e === 'ticket') this.state === 'front' ? this.open('back') : this.state === 'back' ? this.close() : this.open('front');
      if (e === 'back' && (this.state === 'front' || this.state === 'back')) this.close();
    });
  }
  private rowData(id: string): Row {
    const r = row(id), got = this.g.save.holes.filter(h => h.startsWith(`${id}/`)), st = got.filter(h => h.endsWith('*')).length;
    return { label: r.label, round: r.round, star: r.star, gotRound: got.length - st, gotStar: st };
  }
  private bitten = false;
  private drawFront() {
    this.big.querySelector('.tk-front')!.innerHTML = front(PERSON, ROWS.map(r => this.rowData(r.id)), { bite: this.bitten });
  }
  private drawBack() {
    this.big.querySelector('.tk-back')!.innerHTML = `${back({ bite: this.bitten })}<div class="tk-contact"><header>Get in touch</header><h2>${PERSON.name}</h2><p class="tk-trade">${PERSON.trade}</p>
      <ul class="tk-links">${PERSON.links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener" data-testid="link-${l.label.toLowerCase()}"><b>${l.label}</b> ${l.text}</a></li>`).join('')}</ul></div>`;
  }
  drawCorner() {
    if (!this.g.save.ticket) { this.corner.hidden = true; return; }
    this.corner.hidden = false;
    if (this.state === 'none') { this.state = 'corner'; this.el.dataset.state = 'corner'; }
    this.corner.innerHTML = corner(this.rowData(rowOf(this.g.place?.id ?? 'line')));
  }
  private hint() {
    const src = (window as unknown as { __input?: { source: string } }).__input?.source;
    this.big.querySelector('.tk-hint')!.textContent = src === 'touch' ? 'Tap to flip · tap again to put away' : 'X flips it · B puts it away';
  }
  print() {
    sfx.paper(); this.drawFront(); this.hint();
    this.state = 'front'; this.el.dataset.state = 'print';
    setTimeout(() => { if (this.el.dataset.state === 'print') { this.el.dataset.state = 'corner'; this.state = 'corner'; this.drawCorner(); } }, 1400);
  }
  open(s: 'front' | 'back') {
    if (!this.g.save.ticket) return;
    this.drawFront(); this.hint(); sfx.paper();
    this.state = s; this.el.dataset.state = s;
  }
  // The gate takes it: small, at the upper left, so the walk home is seen. Front first, then his contact side.
  take() {
    this.drawFront(); sfx.paper();
    this.state = 'front'; this.el.dataset.state = 'taken';
    setTimeout(() => { this.state = 'back'; this.el.dataset.state = 'taken-back'; sfx.fold(); }, 800);
  }
  close() { this.state = 'corner'; this.el.dataset.state = 'corner'; sfx.fold(); this.drawCorner(); }
  // The punch, on the corner (and the big ticket when it is up): the sheet dips under the jaw, the hole is cut on
  // the next frame and its chad falls away turning, the sheet springs back in two frames.
  private punched(d: { row: string; star: boolean }) {
    const id = rowOf(this.g.place?.id ?? 'line'), here = d.row === id;
    for (const el of [this.corner, this.big.querySelector<HTMLElement>('.tk-card')!]) { el.classList.remove('dip'); void el.offsetWidth; el.classList.add('dip'); }
    const at = here ? cornerHole(this.rowData(id), d.star) : null;
    if (at) { const jaw = document.createElement('i'); jaw.className = 'tk-jaw'; jaw.style.left = `${at.x}px`; jaw.style.top = `${at.y}px`; this.corner.appendChild(jaw); }
    setTimeout(() => {
      this.drawCorner(); this.drawFront();
      if (!at) return;
      const chad = document.createElement('i'); chad.className = `tk-chad${d.star ? ' star' : ''}`; chad.style.left = `${at.x}px`; chad.style.top = `${at.y}px`;
      this.corner.appendChild(chad); setTimeout(() => chad.remove(), 950);
    }, 83);
  }
  // The gate keeps it: a bite out of its bottom edge.
  bite() { this.bitten = true; this.drawFront(); this.drawBack(); }

}
