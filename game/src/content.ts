import { validateContent, type Content, type Stop, type Tech } from './schema.ts';
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
const STORE = { x0: -1100, x1: 1100, z0: -150, z1: 190 };
const foot = (x: number, z: number, w: number) => ({ x0: x - w / 2, x1: x + w / 2, z0: z - 145, z1: z - 35 });
const out = (): Stop => ({ id: 'way-out', label: 'Back to the MRT', x: -700, z: 120, reach: 100, action: { kind: 'road', to: 'mrt', stop: 'door' } });
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
        { world: 'blibli', stop: 'mailbox', label: 'Blibli.com' }, { world: 'moperty', stop: 'road-sign', label: 'Moperty' } ] } },
      { id: 'poster', label: 'Poster', x: -260, z: -40, look: -240, mark: 300, action: { kind: 'letter', letter: 'hello' } },
      { id: 'help-point', label: 'Help point', x: -385, z: -30, look: -420, mark: 226, action: { kind: 'letter', letter: 'contact' } } ],
    letters: [
      { id: 'hello', title: 'Hey there!', surface: 'note', blocks: [{ kind: 'heading', text: 'I am Alvaro.' }, { kind: 'heading', text: 'I develop Web Frontends.' }] },
      { id: 'contact', title: 'Get in touch', surface: 'note', blocks: [{ kind: 'links', items: [
        { label: 'Email', href: 'mailto:alvarolukmanto@gmail.com', icon: 'brand/gmail.png' }, { label: 'LinkedIn', href: 'https://linkedin.com/in/alvaro-lukmanto', icon: 'brand/linkedin.png' },
        { label: 'Twitter', href: 'https://twitter.com/alfonsiusalvaro', icon: 'brand/twitter.png' }, { label: 'GitHub', href: 'https://github.com/gilvent', icon: 'brand/github.png' } ] }] } ] },
  blibli: { id: 'blibli', art: 'street', back: { world: 'mrt', stop: 'door' }, camera: { zoom: 1, x0: -300, x1: 300 }, bounds: { x0: -700, x1: 620, z0: -30, z1: 180 },
    solid: [{ x0: -520, x1: -300, z0: -150, z1: 12 }, { x0: -310, x1: -128, z0: -150, z1: -8 }, { x0: -130, x1: -50, z0: -110, z1: -30 }],
    title: 'Blibli.com', path: 'store', url: 'https://blibli.com', role: 'Front-end Developer @', color: '#0092da', logo: 'brand/blibli-white.svg',
    description: 'An indonesian e-commerce with wide range of products from both offline business to online.',
    stops: [
      out(),
      { id: 'parcels', label: 'Delivery boxes', x: -410, z: 60, action: { kind: 'letter', letter: 'stack' } },
      { id: 'mailbox', label: 'Mailbox', x: -305, z: 44, look: -260, action: { kind: 'letter', letter: 'about' } },
      { id: 'shop-door', label: 'Enter the store', x: 150, z: -30, reach: 140, action: { kind: 'road', to: 'blibli-shop', stop: 'street-door' } },
      { id: 'site-board', label: 'Visit Blibli.com', x: 585, z: 20, action: { kind: 'link', href: 'https://blibli.com' } } ],
    letters: [
      { id: 'about', title: 'Blibli.com', surface: 'note', blocks: [
        { kind: 'heading', text: 'Front-end Developer @' },
        { kind: 'paragraph', text: [s('An indonesian e-commerce with wide range of products from both offline business to online.')] },
        { kind: 'paragraph', text: [s('Being a '), b('front end developer'), s(', I worked in '), b('Customer Experience'), s(' team. Developed any client side features related to product detail and product review in '), b('Blibli.com’s'), s(' web application.')] }] },
      stack([T.playwright, T.vue, T.nginx, T.sass]) ] },
  // First floor: the product detail page, played instead of read. Every stop is one part of the page.
  'blibli-shop': { id: 'blibli-shop', art: 'shop', back: { world: 'blibli', stop: 'shop-door' }, camera: { zoom: .8, zoomWide: .96, x0: -30, x1: 30 }, bounds: { x0: -460, x1: 460, z0: -170, z1: 190 },
    solid: [{ x0: -75, x1: 75, z0: -165, z1: -60 }, { x0: -220, x1: -130, z0: -165, z1: -95 }, { x0: 130, x1: 220, z0: -165, z1: -95 }, { x0: -440, x1: -350, z0: 70, z1: 150 }, { x0: 325, x1: 480, z0: -15, z1: 85 }],
    title: 'First floor: smartphones', path: 'store', color: '#0092da', hidden: [{ x0: 296, x1: 460, z0: -170, z1: -30 }, { x0: -262, x1: -100, z0: -170, z1: -80 }, { x0: -460, x1: -330, z0: 0, z1: 68 }, { x0: 395, x1: 460, z0: 120, z1: 190 }],
    stops: [
      { id: 'street-door', label: 'Back to the street', x: 0, z: 190, reach: 60, action: { kind: 'road', to: 'blibli', stop: 'shop-door' } },
      { id: 'showcase', label: 'Showcase phone', x: 80, z: -35, focus: 1.6, look: 0, action: { kind: 'toy', toy: 'variant', states: 3 } },
      { id: 'catalog', label: 'Catalog paper', x: -255, z: -50, focus: 1.6, look: -175, action: { kind: 'letter', letter: 'spec' } },
      { id: 'promo', label: 'Price tag', x: 255, z: -50, focus: 1.8, look: 175, action: { kind: 'toy', toy: 'promo', states: 2 } },
      { id: 'cart', label: 'Basket', x: -310, z: 120, focus: 1.6, look: -380, action: { kind: 'toy', toy: 'cart', states: 4 } },
      { id: 'recs', label: 'Recommended shelf', x: 240, z: 130, focus: 1.6, look: 400, action: { kind: 'toy', toy: 'recs', states: 2 } },
      { id: 'stairs-up', label: 'Upstairs', x: 400, z: -130, reach: 150, action: { kind: 'road', to: 'blibli-storeroom', stop: 'stairs-down' } } ],
    letters: [{ id: 'spec', title: 'Catalog', surface: 'catalog', blocks: [{ kind: 'specSheet' }] }],
    encoded: [
      { fact: 'Worked on:', at: ['showcase'] }, { fact: 'Product Detail', at: ['showcase'] },
      { fact: "I spent most of my time in Blibli working on Product Detail Page. Product Detail is the entry point of customer's journey. Thus, I get to develop features of various product teams:", at: ['showcase'] },
      { fact: 'promotions', at: ['promo'] }, { fact: 'recommendations', at: ['recs'] }, { fact: ', and many more!', at: ['catalog'] },
      { fact: 'A project spotlight...', at: ['showcase'] },
      { fact: 'Product Detail Revamp. A full page redesign project which was part of major theme update across Blibli. Introducing new user experiences with secondary pages for mobile screen and simpler add to cart flow.', at: ['catalog', 'cart'] },
      { fact: 'Lessons learnt while working on Product Detail...', at: ['showcase'] },
      { fact: 'Software development principles. One that stick to mind is', at: ['stairs-up'] }, { fact: 'Incremental release >', at: ['stairs-up'] }, { fact: 'Big bang', at: ['stairs-up'] }, { fact: 'release', at: ['stairs-up'] },
      { fact: 'Explore CSS techniques to building cool UI components: layouts, css animations, and more', at: ['catalog', 'showcase'] },
      { fact: 'Get work on more JS and browser APIs: Lazy load techniques, datalayer, service worker, intersection observer, etc...', at: ['recs'] },
      { fact: "High volume of traffic puts continuous attention to this page's performance, pushing me to learn many web optimization techniques", at: ['recs', 'street-door'] } ] },
  // Second floor: product reviews, from writing one to browsing everyone's.
  'blibli-storeroom': { id: 'blibli-storeroom', art: 'storeroom', back: { world: 'blibli-shop', stop: 'stairs-up' }, camera: { zoom: .8, zoomWide: .96, x0: -30, x1: 30 }, bounds: { x0: -460, x1: 460, z0: -150, z1: 190 },
    solid: [{ x0: -480, x1: 420, z0: -235, z1: -165 }, { x0: 120, x1: 420, z0: 83, z1: 153 }, { x0: -190, x1: 70, z0: 15, z1: 105 }, { x0: -277, x1: -193, z0: 143, z1: 207 }, { x0: 370, x1: 430, z0: -165, z1: -138 }, { x0: -487, x1: -287, z0: 85, z1: 260 }, { x0: 52, x1: 108, z0: 156, z1: 200 }, { x0: 420, x1: 470, z0: 0, z1: 48 }, { x0: 446, x1: 470, z0: -50, z1: -10 }],
    title: 'Second floor: store-room', path: 'store', color: '#0092da', hidden: [{ x0: -200, x1: 90, z0: -70, z1: 14 }, { x0: 110, x1: 430, z0: 10, z1: 82 }],
    stops: [
      { id: 'stairs-down', label: 'Downstairs', x: -387, z: 58, reach: 80, action: { kind: 'road', to: 'blibli-shop', stop: 'stairs-up' } },
      { id: 'camera', label: 'Instant camera', x: -88, z: -40, focus: 1.8, look: -140, action: { kind: 'toy', toy: 'photo', states: 3 } },
      { id: 'stars', label: 'Review card', x: 112, z: -40, focus: 1.8, look: 15, action: { kind: 'toy', toy: 'rating', states: 5 } },
      { id: 'gallery', label: 'Photo gallery', x: -215, z: -115, focus: 1.6, look: -190, mark: 270, action: { kind: 'toy', toy: 'gallery', states: 2 } },
      { id: 'board', label: 'Review board', x: 250, z: -110, focus: 1.6, look: 280, mark: 270, action: { kind: 'toy', toy: 'filter', states: 3 } } ],
    letters: [],
    encoded: [
      { fact: 'Redesign the journey', at: ['board'] }, { fact: 'Worked on:', at: ['board'] }, { fact: 'Product Review', at: ['board'] },
      { fact: 'I took part in a series of projects to improve product review journey, both as a', at: ['stars', 'board'] }, { fact: 'reviewer', at: ['stars', 'camera'] }, { fact: 'potential customers', at: ['board', 'gallery'] },
      { fact: 'browsing products. Starting from adding basic features such as review filter and photo upload, to adding review photo gallery.', at: ['board', 'camera', 'gallery'] },
      { fact: 'Key changes...', at: ['board'] },
      { fact: 'UI redesign across product review features (adopting the upcoming major theme revamp in the company)', at: ['board'] },
      { fact: 'Enable photo upload while submitting review', at: ['camera'] }, { fact: 'Filter reviews by photo or rating', at: ['board'] },
      { fact: 'Browse reviews by photo (gallery), which supports multiple views like grid and list', at: ['gallery'] },
      { fact: 'A few learnings...', at: ['camera', 'gallery'] },
      { fact: "Try our best to test on real device :). This time is my first encounter with an issue that uploaded image is rotated when uploaded using mobile web's camera capture (caused by EXIF orientation that needs to be handled).", at: ['camera'] },
      { fact: 'User generated images vary in ratio. Consider all possibilities when developing the UI components displaying these images!', at: ['gallery'] } ] },
  // The hometown lane. Nothing is read here: every stop is a toy, and each toy is one thing Moperty does
  // (docs/MOPERTY_DESIGN.md). What one toy does, the visitors and the office window notice.
  moperty: { id: 'moperty', art: 'lane', back: { world: 'mrt', stop: 'door' }, camera: { zoom: 1, x0: -470, x1: 500 }, bounds: { x0: -700, x1: 740, z0: -80, z1: 180 },
    // The verge and the plot, the house, the fence either side of the gate, the yard's two sides, the office, the
    // board's post and the mango tree.
    solid: [{ x0: -800, x1: -60, z0: -400, z1: 56 }, { x0: 70, x1: 310, z0: -400, z1: -102 }, { x0: -60, x1: 150, z0: 44, z1: 56 }, { x0: 230, x1: 410, z0: 44, z1: 56 }, { x0: -66, x1: -54, z0: -400, z1: 56 }, { x0: 404, x1: 416, z0: -400, z1: 56 }, { x0: 410, x1: 900, z0: -400, z1: 6 }, { x0: 360, x1: 420, z0: -10, z1: 30 }, { x0: -52, x1: -20, z0: -14, z1: 26 }],
    title: 'Moperty', path: 'street', url: 'https://moperty.id', role: 'In My Free Time Developing', color: '#3f51b5', logo: 'brand/moperty-white.svg',
    description: 'A progressive web app to browse available real estate in local area around my hometown.',
    // He stands beside each thing he uses, never in front of it: `look` is the thing.
    stops: [
      out(),
      { id: 'road-sign', label: 'Road sign', x: -545, z: 84, look: -610, action: { kind: 'toy', toy: 'post', states: 2 } },
      { id: 'plot', label: 'Empty plot', x: -450, z: 84, look: -300, mark: 292, focus: 1.1, action: { kind: 'toy', toy: 'build', states: 5 } },
      { id: 'board', label: 'Board', x: 318, z: 84, look: 390, mark: 190, action: { kind: 'toy', toy: 'board', states: 2 } },
      { id: 'front-door', label: 'Front door', x: 190, z: -40, mark: 330, action: { kind: 'toy', toy: 'door', states: 2 } },
      { id: 'office-door', label: 'Visit Moperty', x: 476, z: 34, look: 490, action: { kind: 'link', href: 'https://moperty.id' } },
      { id: 'bell', label: 'Agent\'s bell', x: 548, z: 36, look: 630, action: { kind: 'toy', toy: 'ask', states: 4 } } ],
    letters: [],
    bumps: [{ id: 'mango-tree', label: 'Mango tree', x: -50, z: 116, r: 60, toy: 'mango', states: 4 }],
    zones: [{ id: 'garden-gate', toy: 'gate', x0: 140, x1: 240, z0: -10, z1: 105 }],
    yards: [{ x0: -54, x1: 404, z0: -80, z1: 50, gate: { x: 190, out: 84, in: 18 } }], walk: 84,
    crowd: { toy: 'post', ends: [-900, 940],
      people: [{ id: 'a', speed: 150, z: 112, h: 112, mood: '♪' }, { id: 'b', speed: 124, z: 132, h: 126, mood: '!' }, { id: 'c', speed: 168, z: 152, h: 98, mood: '…' }],
      spots: [
        { id: 'plot', x: -210, z: 100, toy: 'build', appeal: [1, 1.5, 1.5, 1.5, 2], says: ['?', '…', '…', '…', '!'], side: 1, places: 2 },
        { id: 'house', x: 84, z: 110, toy: 'door', appeal: [1.5, 2.5], says: ['?', '♥'], side: 1, places: 1 },
        { id: 'office', x: 722, z: 100, toy: 'ask', appeal: [1, 2, 2, 2], says: ['…', '♪', '♪', '♪'], side: 1, places: 1 } ] },
    encoded: [
      { fact: 'In My Free Time Developing', at: ['plot'] },
      { fact: 'A progressive web app to browse available real estate in local area around my hometown.', at: ['road-sign', 'board', 'front-door', 'bell'] },
      { fact: 'To boost confidence in web development, I feel the need to build and run a whole product.', at: ['plot', 'office-door'] },
      { fact: 'So I came up with Moperty: I design the UIs, code frontends and backends,', at: ['plot'] },
      { fact: 'and also implement SEO techniques.', at: ['road-sign'] } ] },
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
