import gsap from 'gsap';

export function floating(
  els: Array<any>,
  { maxTranslate = 10, delay } = {
    maxTranslate: 10,
    delay: 0
  }
): void {
  els.forEach(c => {
    const translateVal = Math.random() * maxTranslate;
    gsap.to(c, {
      translateY: translateVal,
      yoyo: true,
      duration: 5,
      yoyoEase: 'ease.inOut',
      repeat: -1,
      delay
    });
  });
}
