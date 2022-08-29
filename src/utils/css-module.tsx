type CSSModuleStyles = {
  readonly [key: string]: string;
};

export function getClassNames(module: CSSModuleStyles, classNames: string[]): string {
  return classNames.map((val: string) => module[val]).join(' ');
}
