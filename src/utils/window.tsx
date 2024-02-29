import { MediaQueryScreen } from '@/utils/enums';

export default function valueForScreen<T>(
  {
    desktop,
    tablets
  }: {
    desktop?: T;
    tablets?: T;
  } = {},
  defaultValue: T
): T {
  const screens = [
    { query: MediaQueryScreen.Desktop, value: desktop },
    { query: MediaQueryScreen.Tablet, value: tablets }
  ].filter(
    (s): s is { query: MediaQueryScreen; value: T } => s.value !== undefined
  );

  for (let screen of screens) {
    const matchQueryList = window.matchMedia(screen.query);

    if (matchQueryList.matches) {
      return screen.value;
    }
  }

  return defaultValue;
}
