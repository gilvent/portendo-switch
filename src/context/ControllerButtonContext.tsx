import { RefObject, createContext, useRef, useState } from 'react';

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
};

const ControllerButtonContext = createContext<ControllerButtonProviderValue>({
  setAction: (control: ControlActions, fn: () => void) => {},
  actions: null,
  visibleHelpPanel: false,
  setVisibleHelpPanel: (visible: boolean) => {},
  helpPanelGuides: [],
  setHelpPanelGuides: (guides: Array<string>) => {}
});

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

  function setAction(control: ControlActions, fn: () => void) {
    actions.current[control] = fn;
  }

  const providerValue = {
    setAction,
    actions,
    visibleHelpPanel,
    setVisibleHelpPanel,
    helpPanelGuides,
    setHelpPanelGuides
  };

  return (
    <ControllerButtonContext.Provider value={providerValue}>
      {children}
    </ControllerButtonContext.Provider>
  );
}

export { ControllerButtonProvider };
export default ControllerButtonContext;
