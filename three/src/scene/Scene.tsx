import { useRig } from '../rig/RigProvider';
import { Desk } from './Desk';
import { Dock } from './Dock';
import { Effects } from './Effects';
import { Joycon } from './Joycon';
import { layout } from './layout';
import { Lighting } from './Lighting';
import { Room } from './Room';
import { SetDressing } from './SetDressing';
import { SwitchConsole } from './SwitchConsole';
import { Tv } from './Tv';

export function Scene() {
  const rig = useRig();
  return (
    <>
      <Lighting />
      <Room />
      <Desk />
      <Tv />
      <SetDressing />
      <Dock />
      <primitive object={rig.anchors.desk} position={layout.switchRest} />
      <SwitchConsole />
      <Joycon side="left" />
      <Joycon side="right" />
      <Effects />
    </>
  );
}
