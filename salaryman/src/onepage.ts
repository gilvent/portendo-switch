import { LINE, PERSON } from './game/content.ts';
import './onepage.css';

// The one-page version: everything the line tells, for a visitor in a hurry. Built from the same content as the game.
const WORK: Record<string, { stack: string[]; facts: string[] }> = {
  blibli: { stack: ['Vue', 'Sass', 'Nginx', 'Playwright'], facts: [
    'Front-end developer in the Customer Experience team, mostly on the Product Detail Page: the entry point of the customer journey, where many product teams’ features meet (promotions, recommendations, variants, shipping).',
    'Spotlight: the Product Detail revamp, a full redesign with secondary pages for mobile and a simpler add-to-cart flow.',
    'Product Review: review filters (photo, rating), photo upload while writing a review, and a review photo gallery with grid and list views.',
    'Lessons: incremental release beats big bang; CSS techniques for UI; browser APIs (lazy loading, intersection observer, service worker, data layer); performance under heavy traffic; test on real devices (EXIF orientation on mobile camera uploads); user images come in every ratio.'
  ] },
  moperty: { stack: ['Vue', 'Laravel', 'Sass', 'PostgreSQL', 'Nginx', 'Google Cloud'], facts: [
    'A progressive web app to browse homes for sale or rent around my hometown.',
    'To build and run a whole product, I designed the UI, coded the front end and the back end, and implemented SEO.'
  ] },
  radjastone: { stack: ['React', 'GSAP', 'Sass', 'Strapi CMS', 'Nginx', 'Google Cloud'], facts: [
    'Company website for an Indonesian firm doing architecture, interior and exterior design in natural stone.',
    'From UI/UX design to build, with GSAP animation and a Strapi CMS so the owner can update the content himself.'
  ] }
};
document.getElementById('page')!.innerHTML = `
  <header><h1>${PERSON.name}</h1><p>${PERSON.trade}</p>
  <ul class="links">${PERSON.links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}: ${l.text}</a></li>`).join('')}</ul>
  <p class="play"><a href="./">← Play the commute instead</a></p></header>
  ${LINE.filter(s => WORK[s.id]).map(s => `<section style="--c:${s.color}"><h2>${s.name}</h2><p class="role">${s.role}</p>
    ${WORK[s.id].facts.map(f => `<p>${f}</p>`).join('')}
    <p class="stack">${WORK[s.id].stack.map(t => `<span>${t}</span>`).join('')}</p>
    ${s.url ? `<p><a href="${s.url}" target="_blank" rel="noopener">Visit ${s.name} ↗</a></p>` : ''}</section>`).join('')}`;
