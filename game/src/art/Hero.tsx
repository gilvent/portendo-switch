// The player: a man on a mission, in a good way. A textured spiky crop, set brows over eyes fixed straight ahead, a
// sure smile, an open black suit jacket with no tie over a light tee left untucked. He is drawn turned three-quarters
// toward the way he walks, leaning into his stride, his right hand in his pocket.
//
// The drawing is generated (heroArt.ts, from tools/hero/turned.cjs) and carries both arm sets. Facing right, his right
// arm is the near one, bent to the pocket. Facing left the sheet is mirrored, which would move the pocket to his left
// hand, so the arms swap instead: `data-face="-1"` on any ancestor shows the other set (styles.css). His legs are
// separate strips so they can stride, and `.lean` tips legs and body together.
import { HERO_ART } from './heroArt.ts';

export const HERO_HEIGHT = 137;
export default function Hero() {
  return (
    <div className="lean">
      <i className="leg leg-b" /><i className="leg leg-f" />
      <svg className="courier-art" viewBox={`0 0 80 ${HERO_HEIGHT}`} width="80" height={HERO_HEIGHT} overflow="visible" aria-hidden="true" dangerouslySetInnerHTML={{ __html: HERO_ART }} />
    </div>
  );
}
