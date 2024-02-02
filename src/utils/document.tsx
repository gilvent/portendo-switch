export function getElementYPosition(el: HTMLElement | null) {
  const top = el?.getBoundingClientRect().top ?? 0;
  return top + document.documentElement.scrollTop;
}

export function waitForElements(selectors: Array<string>, maxTimeout = 4000) {
  let timeout = maxTimeout;
  const revalidateInterval = 500;
  let resolve: (val?: any) => void, reject: (reason?: any) => void;

  function revalidate() {
    if (timeout <= 0) {
      return reject();
    }
    const els = selectors.map(s => document.querySelector(s));

    if (!selectors.every(s => document.querySelector(s))) {
      timeout -= revalidateInterval;
      setTimeout(() => {
        revalidate();
      }, revalidateInterval);
    } else {
      resolve(els);
    }
  }

  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;

    revalidate();
  });
}
