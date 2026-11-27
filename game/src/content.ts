import { validateContent, type Content, type Stop, type Tech } from './schema.ts';
import { FLOOR as P, FRONT as F } from './art/scenes/blibli/plan.ts';
const s = (t: string) => ({ t }), b = (t: string) => ({ t, strong: true });
const T: Record<string, Tech> = {
  playwright: { name: 'PLAYWRIGHT', logo: 'tech/playwright.svg', color: '#d65348' }, sass: { name: 'SASS', logo: 'tech/sass.svg', color: '#cf649a' },
  vue: { name: 'VUE', logo: 'tech/vue.svg', color: '#42b884' }, nginx: { name: 'NGINX', logo: 'tech/nginx.svg', color: '#22963a' },
  laravel: { name: 'LARAVEL', logo: 'tech/laravel.svg', color: '#F9322C' }, postgres: { name: 'POSTGRES', logo: 'tech/postgres.png', color: '#336791' },
  gcloud: { name: 'GOOGLE CLOUD', logo: 'tech/gcloud.png', color: '#fbbd05' }, gsap: { name: 'GSAP', logo: 'tech/gsap.svg', color: '#0ae448' },
  react: { name: 'REACT', logo: 'tech/react.svg', color: '#61D9FA' }, strapi: { name: 'STRAPI CMS', logo: 'tech/strapi.svg', color: '#4945ff' }
};
const stack = (items: Tech[]) => ({ id: 'stack', title: 'Tech Stack', surface: 'label' as const, blocks: [{ kind: 'tech' as const, items }] });
const B = { x0: -700, x1: 700, z0: -220, z1: 170 };
const out = (x = -700): Stop => ({ id: 'way-out', label: 'Back to the MRT', x, z: 120, reach: 100, action: { kind: 'road', to: 'mrt', stop: 'door' } });
export const content: Content = validateContent({ worlds: {
  // The handheld's screen (Platform.tsx): the station platform. The gate opens on A, which calls the train; boarding
  // at its door docks the console. `gate` and `road-end` stand where Platform.tsx draws the gate and the door.
  intro: { id: 'intro', art: 'blockout', bounds: { x0: -380, x1: 380, z0: 0, z1: 0 }, solid: [], title: 'Platform', path: 'round', color: '#8d95a0',
    stops: [{ id: 'gate', label: 'Ticket gate', x: -204, z: 0, reach: 56, action: { kind: 'toy', toy: 'gate', states: 2 } },
      { id: 'road-end', label: 'Board the train', x: 310, z: 0, reach: 70, action: { kind: 'dock' } }], letters: [] },
  // Home: the inside of an MRT car on its way. The sign over the door chooses the stop; the doors get off there.
  mrt: { id: 'mrt', art: 'train', camera: { zoom: 1.12, x0: -320, x1: 480, lift: 210, liftTall: 130, ahead: 190 }, bounds: { x0: -430, x1: 430, z0: -40, z1: 110 }, solid: [{ x0: -470, x1: -420, z0: -80, z1: -28 }, { x0: 418, x1: 470, z0: -90, z1: -46 }], title: 'MRT', path: 'round', color: '#8d95a0',
    stops: [
      { id: 'door', label: 'Doors', x: 0, z: -40, reach: 110, action: { kind: 'ride', toy: 'line', to: [
        { world: 'blibli', stop: 'wall', label: 'Blibli.com' }, { world: 'moperty', stop: 'first-house', label: 'Moperty' } ] } },
      { id: 'poster', label: 'Poster', x: -260, z: -40, look: -240, mark: 300, action: { kind: 'letter', letter: 'hello' } },
      { id: 'help-point', label: 'Help point', x: -385, z: -30, look: -420, mark: 226, action: { kind: 'letter', letter: 'contact' } } ],
    letters: [
      { id: 'hello', title: 'Hey there!', surface: 'note', blocks: [{ kind: 'heading', text: 'I am Alvaro.' }, { kind: 'heading', text: 'I develop Web Frontends.' }] },
      { id: 'contact', title: 'Get in touch', surface: 'note', blocks: [{ kind: 'links', items: [
        { label: 'Email', href: 'mailto:alvarolukmanto@gmail.com', icon: 'brand/gmail.png' }, { label: 'LinkedIn', href: 'https://linkedin.com/in/alvaro-lukmanto', icon: 'brand/linkedin.png' },
        { label: 'Twitter', href: 'https://twitter.com/alfonsiusalvaro', icon: 'brand/twitter.png' }, { label: 'GitHub', href: 'https://github.com/gilvent', icon: 'brand/github.png' } ] }] } ] },
  // The shopfront on the promenade: product reviews. Left to right in the order of the loop: the review wall the
  // shoppers read, the door, the photo string, then the photo spot and the writing stand (docs/BLIBLI_DESIGN.md).
  blibli: { id: 'blibli', art: 'street', back: { world: 'mrt', stop: 'door' }, camera: { zoom: 1, x0: -300, x1: 560 }, bounds: { x0: -720, x1: 860, z0: -30, z1: 190 },
    solid: [{ x0: F.table.x - 60, x1: F.table.x + 60, z0: -60, z1: F.table.z + 32 }, { x0: F.stand.x - 35, x1: F.stand.x + 35, z0: F.stand.z - 23, z1: F.stand.z + 23 }, { x0: F.camera.x - 14, x1: F.camera.x + 14, z0: F.camera.z - 12, z1: F.camera.z + 12 }],
    title: 'Blibli.com', path: 'store', url: 'https://blibli.com', role: 'Front-end Developer @', color: '#0092da', logo: 'brand/blibli-white.svg',
    description: 'An indonesian e-commerce with wide range of products from both offline business to online.',
    stops: [
      out(-720),
      { id: 'site-board', label: 'Visit Blibli.com', x: F.siteBoard.x, z: F.siteBoard.z + 50, reach: 70, action: { kind: 'link', href: 'https://blibli.com' } },
      { id: 'wall', label: 'Review wall', x: F.board.x + F.board.w / 2, z: 30, mark: F.board.y + F.board.h - 6, focus: 1.25, gesture: 'lean', action: { kind: 'toy', toy: 'filter', states: 3 } },
      { id: 'shop-door', label: 'Enter the store', x: F.door.x, z: -30, reach: 80, action: { kind: 'road', to: 'blibli-shop', stop: 'street-door' } },
      { id: 'gallery', label: 'Photo string', x: F.string.x + 40, z: 14, look: F.string.x, reach: 76, mark: F.string.y + F.string.cell + 40, focus: 1.3, gesture: 'lean', action: { kind: 'toy', toy: 'gallery', states: 2 } },
      { id: 'camera', label: 'Instant camera', x: F.camera.x - 66, z: F.camera.z + 26, look: F.camera.x, reach: 70, mark: F.camera.y + 110, focus: 1.3, action: { kind: 'toy', toy: 'photo', states: 4, wrapTo: 2 } },
      { id: 'stars', label: 'Review card', x: F.stand.x - 84, z: F.stand.z + 4, look: F.stand.x, reach: 70, mark: F.stand.top + 150, focus: 1.6, action: { kind: 'toy', toy: 'rating', states: 6, wrapTo: 1 } } ],
    letters: [],
    encoded: [
      { fact: 'Front-end Developer @ Blibli.com: client side features related to product detail and product review.', at: ['wall', 'shop-door'] },
      { fact: 'Redesign the journey', at: ['wall'] }, { fact: 'Worked on:', at: ['wall'] }, { fact: 'Product Review', at: ['wall'] },
      { fact: 'I took part in a series of projects to improve product review journey, both as a', at: ['stars', 'wall'] }, { fact: 'reviewer', at: ['stars', 'camera'] }, { fact: 'potential customers', at: ['wall', 'gallery'] },
      { fact: 'browsing products. Starting from adding basic features such as review filter and photo upload, to adding review photo gallery.', at: ['wall', 'camera', 'gallery'] },
      { fact: 'UI redesign across product review features (adopting the upcoming major theme revamp in the company)', at: ['wall', 'gallery', 'camera', 'stars'] },
      { fact: 'Enable photo upload while submitting review', at: ['camera'] }, { fact: 'Filter reviews by photo or rating', at: ['wall'] },
      { fact: 'Browse reviews by photo (gallery), which supports multiple views like grid and list', at: ['gallery'] },
      { fact: "Try our best to test on real device :). This time is my first encounter with an issue that uploaded image is rotated when uploaded using mobile web's camera capture (caused by EXIF orientation that needs to be handled).", at: ['camera'] },
      { fact: 'User generated images vary in ratio. Consider all possibilities when developing the UI components displaying these images!', at: ['gallery'] } ] },
  // The shop floor: the product detail page, played instead of read. Every stop is one part of the page.
  'blibli-shop': { id: 'blibli-shop', art: 'shop', back: { world: 'blibli', stop: 'shop-door' }, camera: { zoom: .8, zoomWide: .96, x0: -30, x1: 30 }, bounds: { x0: -470, x1: 470, z0: -180, z1: 190 },
    solid: [{ x0: P.showcase.x - 58, x1: P.showcase.x + 58, z0: -240, z1: P.showcase.z + 40 }, { x0: P.promo.x - 7, x1: P.promo.x + 7, z0: -240, z1: P.promo.z + 7 }, { x0: P.catalog.x - 48, x1: P.catalog.x + 48, z0: -240, z1: P.catalog.z + 28 }, { x0: -423, x1: -319, z0: 42, z1: 94 }, { x0: P.basket.x - 62, x1: P.basket.x + 62, z0: P.basket.z - 36, z1: P.basket.z + 36 }],
    title: 'Blibli store', path: 'store', color: '#0092da',
    stops: [
      { id: 'street-door', label: 'Back to the street', x: P.door.x, z: P.door.z, reach: 60, action: { kind: 'road', to: 'blibli', stop: 'shop-door' } },
      { id: 'showcase', label: 'Showcase phone', x: P.showcase.x - 86, z: P.showcase.z + 78, look: P.showcase.x, reach: 76, mark: P.showcase.top + 150, focus: 1.5, action: { kind: 'toy', toy: 'variant', states: 3 } },
      { id: 'promo', label: 'Price tag', x: P.promo.reel.x, z: P.promo.reel.z, look: P.promo.x + 20, reach: 62, mark: P.promo.top + 130, focus: 1.5, gesture: 'hop', action: { kind: 'toy', toy: 'promo', states: 2 } },
      { id: 'catalog', label: 'Catalog', x: P.catalog.x + 84, z: P.catalog.z + 76, look: P.catalog.x - 20, reach: 76, mark: P.catalog.top + 150, focus: 1.7, gesture: 'lean', action: { kind: 'toy', toy: 'catalog', states: 4 } },
      { id: 'cart', label: 'Add to basket', x: P.basket.x + 104, z: P.basket.z + 6, look: P.basket.x - 70, reach: 84, mark: 190, focus: 1.4, gesture: 'hop', action: { kind: 'toy', toy: 'cart', states: 4 } },
      { id: 'recs', label: 'Recommended shelf', x: P.recs.xs[2], z: -120, reach: 110, mark: P.recs.y + P.recs.card.h + 30, focus: 1.3, gesture: 'lean', action: { kind: 'toy', toy: 'recs', states: 2 } } ],
    letters: [],
    encoded: [
      { fact: 'Worked on:', at: ['showcase'] }, { fact: 'Product Detail', at: ['showcase'] },
      { fact: "I spent most of my time in Blibli working on Product Detail Page. Product Detail is the entry point of customer's journey. Thus, I get to develop features of various product teams:", at: ['showcase'] },
      { fact: 'promotions', at: ['promo'] }, { fact: 'recommendations', at: ['recs'] }, { fact: ', and many more!', at: ['catalog'] },
      { fact: 'A project spotlight...', at: ['showcase'] },
      { fact: 'Product Detail Revamp. A full page redesign project which was part of major theme update across Blibli. Introducing new user experiences with secondary pages for mobile screen and simpler add to cart flow.', at: ['catalog', 'cart'] },
      { fact: 'Software development principles. One that stick to mind is Incremental release > Big bang release', at: ['showcase', 'promo', 'catalog', 'cart', 'recs'] },
      { fact: 'Get work on more JS and browser APIs: Lazy load techniques, datalayer, service worker, intersection observer, etc...', at: ['recs'] } ] },
  moperty: { id: 'moperty', art: 'blockout', back: { world: 'mrt', stop: 'door' }, bounds: B, solid: [], title: 'Moperty', path: 'street', url: 'https://moperty.id', role: 'In My Free Time Developing', color: '#3f51b5', logo: 'brand/moperty-white.svg',
    description: 'A progressive web app to browse available real estate in local area around my hometown.',
    stops: [
      out(),
      { id: 'first-house', label: 'Moperty', x: -420, z: 0, action: { kind: 'letter', letter: 'summary' } },
      { id: 'workshop', label: 'Tech Stack', x: 0, z: -100, action: { kind: 'letter', letter: 'stack' } },
      { id: 'for-sale', label: 'Visit Moperty', x: 420, z: 0, action: { kind: 'link', href: 'https://moperty.id' } } ],
    letters: [
      { id: 'summary', title: 'Moperty', surface: 'note', blocks: [{ kind: 'paragraph', text: [s('To boost confidence in web development, I feel the need to '), b('build and run a whole product'), s('. So I came up with '), b('Moperty'), s(': I '), b('design'), s(' the UIs, '), b('code'), s(' frontends and backends, and also '), b('implement SEO'), s(' techniques.')] }] },
      stack([T.vue, T.laravel, T.sass, T.postgres, T.nginx, T.gcloud]) ] },
  radjastone: { id: 'radjastone', offLine: true, art: 'blockout', back: { world: 'mrt', stop: 'door' }, bounds: B, solid: [], title: 'Radjastone', path: 'climb', url: 'https://radjastone.com', role: 'Build A Website For', color: '#9a883f', logo: 'brand/rj-limestone-white.svg',
    description: 'An Indonesian company providing services related to architecture / interior / exterior design made with natural stones.',
    stops: [
      out(),
      { id: 'quarry', label: 'Radjastone', x: -420, z: 60, action: { kind: 'letter', letter: 'summary' } },
      { id: 'stone-yard', label: 'Tech Stack', x: 0, z: -40, action: { kind: 'letter', letter: 'stack' } },
      { id: 'stone-house', label: 'Visit Radjastone', x: 420, z: -130, action: { kind: 'link', href: 'https://radjastone.com' } } ],
    letters: [
      { id: 'summary', title: 'Radjastone', surface: 'note', blocks: [{ kind: 'paragraph', text: [s('I build '), b('Radjastone\'s'), s(' company website from scratch. Starting with UI / UX design, to web app development using '), b('GSAP'), s(' animation library and '), b('Strapi CMS'), s('.')] }] },
      stack([T.react, T.gsap, T.sass, T.strapi, T.nginx, T.gcloud]) ] }
} });
