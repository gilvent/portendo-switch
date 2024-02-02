// react-transition-group helper to save done function into ref
function useTransitionEndListener(key: string) {
  function addEndListener(done: () => void) {
    document.addEventListener(key, done);
  }

  function done() {
    const event = new CustomEvent(key);
    document.dispatchEvent(event);
  }

  return { done, addEndListener };
}

export default useTransitionEndListener;
