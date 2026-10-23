import { useEffect } from 'react';
import { useConsole } from '../console/ConsoleProvider';
import { keyInput } from './bindings';

export function useKeyboard() {
  const { send } = useConsole();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const input = keyInput(event.key);
      if (input === undefined) return;
      event.preventDefault();
      send(input);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [send]);
}
