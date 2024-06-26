export enum ROUTE_PATH_PATTERNS {
  HOME = '/',
  WORK = '/work/:title',
  WORK_HIGHLIGHT = '/work/:title/highlight'
}

export enum MediaQueryScreen {
  Tablet = '(min-width: 768px)',
  Desktop = '(min-width: 992px)',
  LargeDesktop = '(min-width: 1200px)'
}

export enum WorkHighlightId {
  Blibli = 'blibli',
  Moperty = 'moperty',
  Radjastone = 'radjastone'
}

export enum ControllerScreenTitle {
  Home = 'GET_STARTED',
  Work = 'BOUNCING_WORKS'
}
