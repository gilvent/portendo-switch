import { Shell } from './shell/console.ts';
import { startLoop } from './core/loop.ts';
import { Game } from './game/game.ts';
import { platform } from './scenes/platform.ts';
import { trainCar } from './scenes/car.ts';
import { blibli } from './scenes/blibli.ts';
import { moperty } from './scenes/moperty.ts';
import { radjastone } from './scenes/radjastone.ts';
import { home } from './scenes/home.ts';
import { EndCard } from './game/card.ts';
const sceneFor = (i: number) => (i === 3 ? home() : [blibli, moperty, radjastone][i](i));
import { sfx } from './game/sfx.ts';
import { Ticket } from './game/ticket.ts';

const shell = new Shell(document.getElementById('app')!);
const game = new Game(shell);
const car = trainCar();
const ticket = new Ticket(shell, game);
const card = new EndCard(shell, game);
game.listeners.add((e, d) => {
  // The dock: a falling whirr, the clack as it seats, the screen opening out on a long whoosh, the LED's ding.
  if (e === 'board') { sfx.whirr(); void shell.dock(async () => { await game.go(car, 'platform', false); sfx.clack(); game.stage.nudge(0, -.25); game.stage.shake(.6); sfx.whoosh(.8); setTimeout(() => sfx.ding(), 900); }); }
  if (e === 'getoff') void game.go(sceneFor(d as number), 'car');
  if (e === 'reboard') void game.go(car, 'stop');
  // The gate takes the ticket: it shows its front, turns over to his contact side, and the console comes out with his card.
  if (e === 'tap-out') ticket.take();
  if (e === 'end') setTimeout(() => { sfx.whoosh(.6, 2400, 400); void shell.undock(() => { ticket.el.hidden = true; sfx.clack(.7); }).then(() => card.show()); }, 400);
});
void ticket;
const params = new URLSearchParams(location.search);
// ?at=car or ?at=blibli: start docked, somewhere down the line (for testing and deep links).
const at = params.get('at');
if (at) { shell.setDocked(); game.save.ticket = true; if (at === 'car') { if (params.get('next')) game.save.next = +params.get('next')!; void game.go(car, params.get('next') ? 'stop' : 'platform', false); } else { const i = ['blibli', 'moperty', 'radjastone', 'home'].indexOf(at); game.save.next = Math.max(0, i); void game.go(sceneFor(Math.max(0, i)), null, false); }
  if (params.get('next')) game.save.next = +params.get('next')!; }
else void game.go(platform(), null, false);
startLoop(dt => game.update(dt), dt => game.render(dt));
(window as unknown as { __game: Game }).__game = game;
