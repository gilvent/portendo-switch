import { PERSON, ROWS } from './content.ts';
import type { Game } from './game.ts';
import type { Shell } from '../shell/console.ts';
import { sfx } from './sfx.ts';
import './ticket.css';

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
      if (e === 'ticket') this.state === 'front' ? this.open('back') : this.state === 'back' ? this.close() : this.open('front');
      if (e === 'back' && (this.state === 'front' || this.state === 'back')) this.close();
    });
  }
  private holes(id: string, n = 0) {
    const r = row(id), got = this.g.save.holes.filter(h => h.startsWith(`${id}/`));
    const punchedStar = got.filter(h => h.endsWith('*')).length, punchedRound = got.length - punchedStar;
    let s = '';
    for (let i = 0; i < r.round; i++) s += `<i class="hole${i < punchedRound ? ' on' : ''}${i === punchedRound - 1 && n === 1 ? ' new' : ''}"></i>`;
    for (let i = 0; i < r.star; i++) s += `<i class="hole star${i < punchedStar ? ' on' : ''}${n === 2 ? ' new' : ''}"></i>`;
    return s;
  }
  private drawFront() {
    this.big.querySelector('.tk-front')!.innerHTML = `<header><span>MRT · Day pass</span><span>No. 0042</span></header>
      <h2>${PERSON.name}</h2><p class="tk-trade">${PERSON.trade}</p>
      <ol class="tk-rows">${ROWS.map(r => `<li><span>${r.label}</span><span class="holes">${this.holes(r.id)}</span></li>`).join('')}</ol>
      <footer>Flip for contact ↻</footer>`;
  }
  private drawBack() {
    this.big.querySelector('.tk-back')!.innerHTML = `<header><span>Get in touch</span></header><h2>${PERSON.name}</h2><p class="tk-trade">${PERSON.trade}</p>
      <ul class="tk-links">${PERSON.links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener" data-testid="link-${l.label.toLowerCase()}"><b>${l.label}</b> ${l.text}</a></li>`).join('')}</ul>`;
  }
  drawCorner(n = 0) {
    if (!this.g.save.ticket) { this.corner.hidden = true; return; }
    this.corner.hidden = false;
    const id = rowOf(this.g.place?.id ?? 'line'), r = row(id);
    this.corner.innerHTML = `<small>${r.label}</small><span class="holes">${this.holes(id, n)}</span>`;
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
  private punched(d: { row: string; star: boolean }) {
    this.drawCorner(d.star ? 2 : 1); this.drawFront();
    this.corner.classList.remove('kachunk'); void this.corner.offsetWidth; this.corner.classList.add('kachunk');
  }
}
