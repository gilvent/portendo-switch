// react-transition-group helper to save done function into ref
function useTransitionEndListener(key: string) {
  function addEndListener(done: () => void) {
    document.addEventListener(key, done);
  }

  function done() {
    const event = new CustomEvent(key);
    document.dispatchEvent(event);
  }

  function doneWithoutTransition() {
    // done() needs to be called in callback queue to work properly (triggering onEntered).
    // 50 is the minimum timeout to avoid race condition between onEnter and addEndListener.
    // See: https://stackoverflow.com/questions/27275872/race-condition-with-css-transitions-and-transitionend-event-cannot-find-a-solu
    setTimeout(() => {
      const event = new CustomEvent(key);
      document.dispatchEvent(event);
    }, 50);
  }

  return { done, addEndListener, doneWithoutTransition };
}

export default useTransitionEndListener;
