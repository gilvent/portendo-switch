export function getElementYPosition(el: HTMLElement | null) {
  const top = el?.getBoundingClientRect().top ?? 0;
  return top + document.documentElement.scrollTop;
}
