import { PERSON, ROWS } from './content.ts';
import type { Game } from './game.ts';
import type { Shell } from '../shell/console.ts';
import './card.css';

// The ending: his business card on the handheld's screen. Name, trade, how to reach him, and the day's ticket as a
// strip of punched holes. Every hole found gilds its edge.
export class EndCard {
  el: HTMLElement;
  constructor(shell: Shell, private g: Game) {
    this.el = document.createElement('div'); this.el.className = 'endcard'; this.el.dataset.testid = 'end-card';
    shell.screen.appendChild(this.el);
  }
  show() {
    const holes = this.g.save.holes, total = ROWS.reduce((n, r) => n + r.round + r.star, 0);
    const all = holes.length >= total;
    const strip = ROWS.map(r => { const got = holes.filter(h => h.startsWith(`${r.id}/`)); const st = got.filter(h => h.endsWith('*')).length; return `<span title="${r.label}">${Array.from({ length: r.round }, (_, i) => `<i class="${i < got.length - st ? 'on' : ''}"></i>`).join('')}${Array.from({ length: r.star }, (_, i) => `<i class="star ${i < st ? 'on' : ''}"></i>`).join('')}</span>`; }).join('');
    this.el.innerHTML = `<div class="ec-card${all ? ' gold' : ''}">
      <h2>${PERSON.name}</h2><p class="ec-trade">${PERSON.trade}</p>
      <ul>${PERSON.links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener"><b>${l.label}</b>${l.text}</a></li>`).join('')}</ul>
      <div class="ec-strip">${strip}</div>
      <p class="ec-note">${all ? 'You found every hole in the ticket. Thanks for riding the whole line.' : `${holes.length} of ${total} holes punched today.`}</p>
      <button class="ec-again" data-testid="ride-again">Ride again</button></div>`;
    this.el.querySelector('.ec-again')!.addEventListener('click', () => { location.href = location.pathname; });
    requestAnimationFrame(() => this.el.classList.add('in'));
  }
}
