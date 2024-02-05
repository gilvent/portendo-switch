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

export function lockScroll() {
  const bodyEl = document.querySelector('body');
  if (bodyEl) {
    bodyEl.style.overflow = 'hidden';
    bodyEl.style.height = '100%';
  }
}

export function disableScrollLock() {
  const bodyEl = document.querySelector('body');
  if (bodyEl) {
    bodyEl.style.overflow = '';
    bodyEl.style.height = '';
  }
}

function disableClickHandler(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}

export function disableController() {
  const controller = document.querySelector(
    '[data-anim-target="controller-button"]'
  );
  controller?.addEventListener('click', disableClickHandler, true);
}

export function enableController() {
  const controller = document.querySelector(
    '[data-anim-target="controller-button"]'
  );
  controller?.removeEventListener('click', disableClickHandler, true);
}
