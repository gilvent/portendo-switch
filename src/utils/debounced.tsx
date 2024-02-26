export default function debounced(fn: Function, ms: number) {
  let timeoutId: string | number | NodeJS.Timeout | undefined;

  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(args);
    }, ms);
  };
}
