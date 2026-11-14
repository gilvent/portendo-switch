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
  intro: { id: 'intro', art: 'blockout', bounds: { x0: -420, x1: 420, z0: 0, z1: 0 }, solid: [], title: 'Handheld', path: 'round', color: '#8d95a0',
    stops: [{ id: 'road-end', label: 'Dock', x: 400, z: 0, reach: 300, action: { kind: 'dock' } }], letters: [] },
  // Home: the inside of an MRT car on its way. The sign over the door chooses the stop; the doors get off there.
  mrt: { id: 'mrt', art: 'train', camera: { zoom: 1.12, x0: -320, x1: 480, lift: 186, liftTall: 90, ahead: 190 }, bounds: { x0: -430, x1: 430, z0: -40, z1: 110 }, solid: [], title: 'MRT', path: 'round', color: '#8d95a0',
    stops: [
      { id: 'door', label: 'Doors', x: 0, z: -40, reach: 110, action: { kind: 'ride', toy: 'line', to: [
        { world: 'blibli', stop: 'mailbox', label: 'Blibli.com' }, { world: 'moperty', stop: 'first-house', label: 'Moperty' } ] } },
      { id: 'poster', label: 'Poster', x: -260, z: -40, action: { kind: 'letter', letter: 'hello' } },
      { id: 'help-point', label: 'Help point', x: -420, z: -40, action: { kind: 'letter', letter: 'contact' } } ],
    letters: [
      { id: 'hello', title: 'Hey there!', surface: 'note', blocks: [{ kind: 'heading', text: 'I am Alvaro.' }, { kind: 'heading', text: 'I develop Web Frontends.' }] },
      { id: 'contact', title: 'Mailbox', surface: 'note', blocks: [{ kind: 'links', items: [
        { label: 'Email', href: 'mailto:alvarolukmanto@gmail.com', icon: 'brand/gmail.png' }, { label: 'LinkedIn', href: 'https://linkedin.com/in/alvaro-lukmanto', icon: 'brand/linkedin.png' },
        { label: 'Twitter', href: 'https://twitter.com/alfonsiusalvaro', icon: 'brand/twitter.png' }, { label: 'GitHub', href: 'https://github.com/gilvent', icon: 'brand/github.png' } ] }] } ] },
  blibli: { id: 'blibli', art: 'street', back: { world: 'mrt', stop: 'door' }, camera: { zoom: 1, x0: -300, x1: 300 }, bounds: { x0: -700, x1: 620, z0: -30, z1: 180 },
    solid: [{ x0: -520, x1: -300, z0: -150, z1: 12 }, { x0: -310, x1: -210, z0: -90, z1: -8 }, { x0: -130, x1: -50, z0: -110, z1: -30 }],
    title: 'Blibli.com', path: 'store', url: 'https://blibli.com', role: 'Front-end Developer @', color: '#0092da', logo: 'brand/blibli-white.svg',
    description: 'An indonesian e-commerce with wide range of products from both offline business to online.',
    stops: [
      out(),
      { id: 'parcels', label: 'Delivery boxes', x: -410, z: 60, action: { kind: 'letter', letter: 'stack' } },
      { id: 'mailbox', label: 'Mailbox', x: -260, z: 30, action: { kind: 'letter', letter: 'about' } },
      { id: 'shop-door', label: 'Enter the store', x: 150, z: -30, reach: 110, action: { kind: 'road', to: 'blibli-shop', stop: 'street-door' } },
      { id: 'site-board', label: 'Visit Blibli.com', x: 585, z: 20, action: { kind: 'link', href: 'https://blibli.com' } } ],
    letters: [
      { id: 'about', title: 'Blibli.com', surface: 'note', blocks: [
        { kind: 'heading', text: 'Front-end Developer @' },
        { kind: 'paragraph', text: [s('An indonesian e-commerce with wide range of products from both offline business to online.')] },
        { kind: 'paragraph', text: [s('Being a '), b('front end developer'), s(', I worked in '), b('Customer Experience'), s(' team. Developed any client side features related to product detail and product review in '), b('Blibli.com’s'), s(' web application.')] }] },
      stack([T.playwright, T.vue, T.nginx, T.sass]) ] },
  // First floor: the product detail page, played instead of read. Every stop is one part of the page.
  'blibli-shop': { id: 'blibli-shop', art: 'shop', back: { world: 'blibli', stop: 'shop-door' }, camera: { zoom: .8, x0: -30, x1: 30 }, bounds: { x0: -460, x1: 460, z0: -170, z1: 190 },
    solid: [{ x0: -75, x1: 75, z0: -165, z1: -60 }, { x0: -220, x1: -130, z0: -165, z1: -95 }, { x0: 130, x1: 220, z0: -165, z1: -95 }, { x0: -440, x1: -350, z0: 70, z1: 150 }, { x0: 325, x1: 480, z0: -15, z1: 85 }],
    title: 'First floor: smartphones', path: 'store', color: '#0092da',
    stops: [
      { id: 'street-door', label: 'Back to the street', x: 0, z: 190, reach: 60, action: { kind: 'road', to: 'blibli', stop: 'shop-door' } },
      { id: 'showcase', label: 'Showcase phone', x: 80, z: -35, focus: 1.6, look: 0, action: { kind: 'toy', toy: 'variant', states: 3 } },
      { id: 'catalog', label: 'Catalog paper', x: -255, z: -50, focus: 1.6, look: -175, action: { kind: 'letter', letter: 'spec' } },
      { id: 'promo', label: 'Price tag', x: 255, z: -50, focus: 1.8, look: 175, action: { kind: 'toy', toy: 'promo', states: 2 } },
      { id: 'cart', label: 'Basket', x: -310, z: 120, focus: 1.6, look: -380, action: { kind: 'toy', toy: 'cart', states: 4 } },
      { id: 'recs', label: 'Recommended shelf', x: 240, z: 130, focus: 1.6, look: 400, action: { kind: 'toy', toy: 'recs', states: 2 } },
      { id: 'stairs-up', label: 'Upstairs', x: 400, z: -130, reach: 80, action: { kind: 'road', to: 'blibli-storeroom', stop: 'stairs-down' } } ],
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
  'blibli-storeroom': { id: 'blibli-storeroom', art: 'storeroom', back: { world: 'blibli-shop', stop: 'stairs-up' }, camera: { zoom: .8, x0: -30, x1: 30 }, bounds: { x0: -460, x1: 460, z0: -150, z1: 190 },
    solid: [{ x0: -360, x1: 420, z0: -235, z1: -165 }, { x0: 120, x1: 420, z0: 83, z1: 153 }, { x0: -190, x1: 70, z0: 15, z1: 105 }, { x0: -277, x1: -193, z0: 143, z1: 207 }, { x0: 370, x1: 430, z0: -165, z1: -138 }, { x0: -487, x1: -287, z0: 85, z1: 260 }, { x0: 52, x1: 108, z0: 156, z1: 200 }, { x0: 420, x1: 470, z0: 0, z1: 48 }, { x0: 446, x1: 470, z0: -50, z1: -10 }],
    title: 'Second floor: store-room', path: 'store', color: '#0092da',
    stops: [
      { id: 'stairs-down', label: 'Downstairs', x: -387, z: 58, reach: 80, action: { kind: 'road', to: 'blibli-shop', stop: 'stairs-up' } },
      { id: 'camera', label: 'Instant camera', x: -88, z: -40, focus: 1.8, look: -140, action: { kind: 'toy', toy: 'photo', states: 3 } },
      { id: 'stars', label: 'Review card', x: 112, z: -40, focus: 1.8, look: 15, action: { kind: 'toy', toy: 'rating', states: 5 } },
      { id: 'gallery', label: 'Photo gallery', x: -120, z: -110, focus: 1.6, look: -190, action: { kind: 'toy', toy: 'gallery', states: 2 } },
      { id: 'board', label: 'Review board', x: 250, z: -110, focus: 1.6, look: 280, action: { kind: 'toy', toy: 'filter', states: 3 } } ],
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
