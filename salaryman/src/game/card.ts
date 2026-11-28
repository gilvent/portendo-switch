import { PERSON, ROWS } from './content.ts';
import type { Game } from './game.ts';
import type { Shell } from '../shell/console.ts';
import './card.css';
import { sfx } from './sfx.ts';
import { strip } from './ticketArt.ts';

// The ending: his business card on the handheld's screen. Name, trade, how to reach him, and the day's ticket as a
// strip of punched holes. Every hole found gilds its edge.
export class EndCard {
  el: HTMLElement;
  constructor(shell: Shell, private g: Game) {
    this.el = document.createElement('div'); this.el.className = 'endcard'; this.el.dataset.testid = 'end-card';
    shell.screen.appendChild(this.el);
  }
  show() {
    sfx.card();
    const holes = this.g.save.holes, total = ROWS.reduce((n, r) => n + r.round + r.star, 0);
    const all = holes.length >= total;
    // The day's ticket comes back as a stub of the same stock, tucked under the card, its holes really cut.
    const rows = ROWS.map(r => { const got = holes.filter(h => h.startsWith(`${r.id}/`)), st = got.filter(h => h.endsWith('*')).length; return { label: r.label, round: r.round, star: r.star, gotRound: got.length - st, gotStar: st }; });
    this.el.innerHTML = `<div class="ec-wrap"><div class="ec-card${all ? ' gold' : ''}">
      <h2>${PERSON.name}</h2><p class="ec-trade">${PERSON.trade}</p>
      <ul>${PERSON.links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener"><b>${l.label}</b>${l.text}</a></li>`).join('')}</ul>
      <p class="ec-note">${all ? 'You found every hole in my ticket. Thanks for riding the whole line.' : `You punched ${holes.length} ${holes.length === 1 ? 'hole' : 'holes'} in my ticket. Thanks for riding.`}</p>
      <button class="ec-again" data-testid="ride-again">Ride again</button></div><div class="ec-stub">${strip(rows, all)}</div></div>`;
    this.el.querySelector('.ec-again')!.addEventListener('click', () => { location.href = location.pathname; });
    requestAnimationFrame(() => { this.el.classList.add('in'); this.el.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }); });
  }
}
