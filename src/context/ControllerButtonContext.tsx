import { ControllerScreenTitle } from '@/utils/enums';
import {
  MutableRefObject,
  RefObject,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';

const JOYCON_COLOR_SETS = [
  { left: '#828282', right: '#828282' },
  { left: '#ff3c28', right: '#0ab9e6' },
  { left: '#C88C32', right: '#FFDC00' }
];

type ControlActions =
  | 'onControlYClick'
  | 'onControlAClick'
  | 'onControlXClick'
  | 'onControlBClick';

type ControllerButtonProviderValue = {
  setAction: (control: ControlActions, fn: () => void) => void;
  actions: RefObject<
    Record<ControlActions, () => void | undefined | null>
  > | null;
  visibleHelpPanel: boolean;
  setVisibleHelpPanel: (visible: boolean) => void;
  helpPanelGuides: Array<string>;
  setHelpPanelGuides: (guides: Array<string>) => void;
  activeScreen: ControllerScreenTitle;
  setActiveGameScreen: (activeScreen: ControllerScreenTitle) => void;
  changeScreenDirection: MutableRefObject<'up' | 'down'>;
  joyconColors: { left: string; right: string };
  changeJoyconColor: () => void;
};

const ControllerButtonContext = createContext<ControllerButtonProviderValue>(
  {} as ControllerButtonProviderValue
);

function ControllerButtonProvider({ children }: { children: React.ReactNode }) {
  const actions = useRef<Record<ControlActions, () => void | undefined | null>>(
    {
      onControlYClick: () => {},
      onControlBClick: () => {},
      onControlAClick: () => {},
      onControlXClick: () => {}
    }
  );
  const [visibleHelpPanel, setVisibleHelpPanel] = useState<boolean>(false);
  const [helpPanelGuides, setHelpPanelGuides] = useState<Array<string>>([]);
  const [activeScreen, setActiveGameScreen] = useState<ControllerScreenTitle>(
    ControllerScreenTitle.Home
  );
  const changeScreenDirection = useRef<'up' | 'down'>('up');
  const [joyconColors, setJoyconColors] = useState<{
    left: string;
    right: string;
  }>(JOYCON_COLOR_SETS[0]);

  const joyconColorIndex = useRef<number>(0);

  const setAction = useCallback((control: ControlActions, fn: () => void) => {
    actions.current[control] = fn;
  }, []);

  const changeJoyconColor = useCallback(() => {
    joyconColorIndex.current =
      joyconColorIndex.current === JOYCON_COLOR_SETS.length - 1
        ? 0
        : joyconColorIndex.current + 1;
    setJoyconColors(JOYCON_COLOR_SETS[joyconColorIndex.current]);
  }, []);

  const providerValue = useMemo(
    () => ({
      setAction,
      actions,
      visibleHelpPanel,
      setVisibleHelpPanel,
      helpPanelGuides,
      setHelpPanelGuides,
      activeScreen,
      setActiveGameScreen,
      changeScreenDirection,
      joyconColors,
      changeJoyconColor
    }),
    [
      setAction,
      visibleHelpPanel,
      helpPanelGuides,
      activeScreen,
      joyconColors,
      changeJoyconColor
    ]
  );

  return (
    <ControllerButtonContext.Provider value={providerValue}>
      {children}
    </ControllerButtonContext.Provider>
  );
}

export { ControllerButtonProvider };
export default ControllerButtonContext;
