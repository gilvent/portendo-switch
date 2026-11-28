import { reducedMotion } from '../core/stage.ts';

// Between spaces the page turns: two paper leaves close over the scene like a book, and open on the next one.
export class Wipe {
  el: HTMLElement;
  constructor(host: HTMLElement) {
    this.el = document.createElement('div'); this.el.className = 'wipe'; this.el.innerHTML = '<i></i><i></i>';
    host.appendChild(this.el);
  }
  private wait(ms: number) { return new Promise(r => setTimeout(r, reducedMotion ? 30 : ms)); }
  async close() { this.el.classList.remove('open'); this.el.classList.add('shut'); await this.wait(380); }
  async open() { this.el.classList.remove('shut'); this.el.classList.add('open'); await this.wait(420); this.el.classList.remove('open'); }
}
