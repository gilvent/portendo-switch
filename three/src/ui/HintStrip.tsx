import { keysFor } from '../input/bindings';
import { keyGlyph, useHints } from './hints';

export function HintStrip() {
  const { hints, lookFree, dimmed } = useHints();

  return (
    <div className="hint-strip" data-dimmed={dimmed} aria-label="Controls">
      {hints.map((hint) => (
        <span className="hint" key={hint.label}>
          {hint.inputs.flatMap(keysFor).map((key) => (
            <kbd className="key" key={key}>
              {keyGlyph(key)}
            </kbd>
          ))}
          <span className="hint-label">{hint.label}</span>
        </span>
      ))}
      {lookFree && (
        <span className="hint">
          <span className="key key-drag">drag</span>
          <span className="hint-label">Look</span>
        </span>
      )}
    </div>
  );
}
