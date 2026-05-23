export default function debounced<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}
