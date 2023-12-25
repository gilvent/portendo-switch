import { RefObject, createContext, useRef } from 'react';

type ControlActions =
  | 'onLeftClick'
  | 'onRightClick'
  | 'onUpClick'
  | 'onDownClick';

type ControllerButtonProviderValue = {
  setAction: (control: ControlActions, fn: () => void) => void;
  actions: RefObject<
    Record<ControlActions, () => void | undefined | null>
  > | null;
};

const ControllerButtonContext = createContext<ControllerButtonProviderValue>({
  setAction: (control: ControlActions, fn: () => void) => {},
  actions: null
});

function ControllerButtonProvider({ children }: { children: React.ReactNode }) {
  const actions = useRef<Record<ControlActions, () => void | undefined | null>>(
    {
      onLeftClick: () => {},
      onDownClick: () => {},
      onRightClick: () => {},
      onUpClick: () => {}
    }
  );

  function setAction(control: ControlActions, fn: () => void) {
    actions.current[control] = fn;
  }

  const providerValue = { setAction, actions };

  return (
    <ControllerButtonContext.Provider value={providerValue}>
      {children}
    </ControllerButtonContext.Provider>
  );
}

export { ControllerButtonProvider };
export default ControllerButtonContext;
