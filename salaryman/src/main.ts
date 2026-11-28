import * as THREE from 'three';
import { Shell } from './shell/console.ts';
import { Stage } from './core/stage.ts';
import { startLoop } from './core/loop.ts';
import { input } from './core/input.ts';

const shell = new Shell(document.getElementById('app')!);
const stage = new Stage(shell.screen);
const floor = new THREE.Mesh(new THREE.BoxGeometry(20, .2, 4), new THREE.MeshStandardMaterial({ color: '#c9ccd1' }));
floor.position.y = -.1; floor.receiveShadow = true; stage.scene.add(floor);
const hero = new THREE.Mesh(new THREE.BoxGeometry(.6, 1.2, .1), new THREE.MeshStandardMaterial({ color: '#2b2f36' }));
hero.castShadow = true; hero.position.y = .6; stage.scene.add(hero);
stage.want = { x: 0, y: 1.2, z: 0, dist: 14, pitch: .18, yaw: 0 }; stage.snap();
input.onPress(b => { if (b === 'B') void shell.dock(); });
startLoop(dt => { input.poll(); hero.position.x += input.move.x * 4 * dt; hero.position.z += input.move.z * 2 * dt; stage.want.x = hero.position.x; shell.sync(); stage.update(dt); }, () => stage.render());
