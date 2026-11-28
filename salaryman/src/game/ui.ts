import * as THREE from 'three';
import './ui.css';

// DOM pinned to points in the diorama: the A prompt over whatever is in reach, the small tags things say when they
// answer, and the scene's title as it opens. Text stays crisp because it is text.
const v = new THREE.Vector3();
export class Pins {
  private items = new Map<string, { el: HTMLElement; at: THREE.Vector3; until: number }>();
  constructor(private layer: HTMLElement, private camera: THREE.Camera) {}
  show(key: string, html: string, at: THREE.Vector3, cls = 'pin', ms = 0) {
    let it = this.items.get(key);
    if (!it) { const el = document.createElement('div'); el.className = cls; this.layer.appendChild(el); it = { el, at: at.clone(), until: 0 }; this.items.set(key, it); requestAnimationFrame(() => el.classList.add('in')); }
    if (it.el.innerHTML !== html) it.el.innerHTML = html;
    it.el.className = `${cls} in`; it.at.copy(at); it.until = ms ? performance.now() + ms : 0;
    return it.el;
  }
  hide(key: string) {
    const it = this.items.get(key); if (!it) return;
    this.items.delete(key); it.el.classList.remove('in'); it.el.classList.add('out'); setTimeout(() => it.el.remove(), 260);
  }
  clear() { for (const k of [...this.items.keys()]) this.hide(k); }
  update() {
    const w = this.layer.clientWidth, h = this.layer.clientHeight, now = performance.now();
    for (const [k, it] of this.items) {
      if (it.until && now > it.until) { this.hide(k); continue; }
      v.copy(it.at).project(this.camera);
      it.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
      it.el.style.visibility = v.z > 1 ? 'hidden' : 'visible';
    }
  }
}
