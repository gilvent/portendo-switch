import { useConsole } from '../console/ConsoleProvider';
import { buttonGlyph, useHints } from './hints';

export function TouchButtonBar() {
  const { send } = useConsole();
  const { hints, lookFree, dimmed } = useHints();

  return (
    <div className="touch-bar" data-dimmed={dimmed} role="group" aria-label="Controls">
      {hints.map(({ label, inputs }) => {
        if (inputs.length === 1) {
          const [input] = inputs;
          const glyph = buttonGlyph(input);
          return (
            <button className="touch-pill" key={label} aria-disabled={dimmed} onClick={() => send(input)}>
              {glyph !== null && (
                <span className="touch-round" aria-hidden="true">
                  {glyph}
                </span>
              )}
              {label}
            </button>
          );
        }
        return (
          <span className="touch-group" key={label}>
            {inputs.map((input) => (
              <button
                className="touch-round"
                key={buttonGlyph(input)}
                aria-label={input.type === 'menu' ? `${label} ${input.button}` : label}
                aria-disabled={dimmed}
                onClick={() => send(input)}
              >
                {buttonGlyph(input)}
              </button>
            ))}
            <span className="hint-label">{label}</span>
          </span>
        );
      })}
      {lookFree && <span className="touch-look">drag to look</span>}
    </div>
  );
}
