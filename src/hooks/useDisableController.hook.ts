import { useRef } from 'react';

function useDisableController() {
  const disabled = useRef<boolean>(false);

  function handler(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }

  function disableClick() {
    const controller = document.querySelector(
      '[data-anim-target="controller-button"]'
    );
    controller?.addEventListener('click', handler, true);
    disabled.current = true;
  }

  function enableClick() {
    const controller = document.querySelector(
      '[data-anim-target="controller-button"]'
    );
    controller?.removeEventListener('click', handler, true);
    disabled.current = false;
  }

  return {
    disabled,
    disableClick,
    enableClick
  };
}

export default useDisableController;
