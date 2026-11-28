import { Shell } from './shell/console.ts';
import { startLoop } from './core/loop.ts';
import { Game } from './game/game.ts';
import { platform } from './scenes/platform.ts';
import { trainCar } from './scenes/car.ts';
import { stop } from './scenes/stop.ts';
import { blibli } from './scenes/blibli.ts';
import { moperty } from './scenes/moperty.ts';
import { radjastone } from './scenes/radjastone.ts';
const sceneFor = (i: number) => [blibli, moperty, radjastone, stop][i](i);
import { sfx } from './game/sfx.ts';
import { Ticket } from './game/ticket.ts';

const shell = new Shell(document.getElementById('app')!);
const game = new Game(shell);
const car = trainCar();
const ticket = new Ticket(shell, game);
game.listeners.add((e, d) => {
  if (e === 'board') void shell.dock(async () => { await game.go(car, 'platform', false); sfx.whoosh(); game.stage.shake(.3); });
  if (e === 'getoff') void game.go(sceneFor(d as number), 'car');
  if (e === 'reboard') void game.go(car, 'stop');
});
void ticket;
const params = new URLSearchParams(location.search);
// ?at=car or ?at=blibli: start docked, somewhere down the line (for testing and deep links).
const at = params.get('at');
if (at) { shell.setDocked(); game.save.ticket = true; if (at === 'car') void game.go(car, 'platform', false); else { const i = ['blibli', 'moperty', 'radjastone', 'home'].indexOf(at); void game.go(sceneFor(Math.max(0, i)), null, false); } }
else void game.go(platform(), null, false);
startLoop(dt => game.update(dt), dt => game.render(dt));
(window as unknown as { __game: Game }).__game = game;
