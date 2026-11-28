// Everything the game says about him, in one place: the stations of the line, what each mechanism tells, and how to
// reach him. Scenes read from here; the one-page version is built from here too.
export const PERSON = {
  name: 'Alvaro L.', trade: 'Web Frontend Developer',
  links: [
    { label: 'Email', href: 'mailto:alvarolukmanto@gmail.com', text: 'alvarolukmanto@gmail.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/alvaro-lukmanto', text: 'in/alvaro-lukmanto' },
    { label: 'GitHub', href: 'https://github.com/gilvent', text: 'github.com/gilvent' },
    { label: 'Twitter', href: 'https://twitter.com/alfonsiusalvaro', text: '@alfonsiusalvaro' }
  ]
};
export type StationId = 'blibli' | 'moperty' | 'radjastone' | 'home';
export type Station = { id: StationId; name: string; color: string; role: string; line: string; url?: string; jingle: number[] };
// The line runs in this order and loops. The terminus is home.
export const LINE: Station[] = [
  { id: 'blibli', name: 'Blibli.com', color: '#0092da', role: 'Front-end Developer, Customer Experience', line: 'Indonesia’s big online store. I built its product pages.', url: 'https://blibli.com', jingle: [659, 784, 988] },
  { id: 'moperty', name: 'Moperty', color: '#3f51b5', role: 'My own product, start to finish', line: 'Homes for sale and rent around my hometown.', url: 'https://moperty.id', jingle: [587, 740, 880] },
  { id: 'radjastone', name: 'Radjastone', color: '#9a883f', role: 'Freelance: a website for a stone firm', line: 'Natural stone for architecture and interiors.', url: 'https://radjastone.com', jingle: [523, 659, 784] },
  { id: 'home', name: 'Alvaro L.', color: '#e8552d', role: 'Terminus', line: 'End of the line. Thanks for riding.', jingle: [784, 988, 1175] }
];
// The ticket's rows: how many round holes (facts) and star holes (secrets) each station holds.
export const ROWS: { id: 'line' | StationId; label: string; round: number; star: number }[] = [
  { id: 'line', label: 'Line', round: 1, star: 1 },
  { id: 'blibli', label: 'Blibli.com', round: 8, star: 1 },
  { id: 'moperty', label: 'Moperty', round: 3, star: 1 },
  { id: 'radjastone', label: 'Radjastone', round: 3, star: 1 }
];
// The ad panel's three intro lines, which cycle by themselves on the first ride.
export const HELLO = ['Hey there!', 'I am Alvaro.', 'I develop web frontends.'];
