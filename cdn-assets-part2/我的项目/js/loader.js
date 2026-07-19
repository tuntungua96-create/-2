(() => {
  'use strict';

  if (!window.gsap) return;

  document.querySelectorAll('[data-blink-text]').forEach((element, index) => {
    if (element.dataset.wrapped) return;

    const rawText = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    element.innerHTML = rawText
      .split('')
      .map((character) => {
        if (character === '\n') return '<br>';
        const content = character === ' ' ? '&nbsp;' : character;
        return `<span class="blink-char" style="opacity:0;filter:brightness(0.5);display:inline-block;will-change:opacity,filter;">${content}</span>`;
      })
      .join('');
    element.dataset.wrapped = '1';

    const characters = element.querySelectorAll('.blink-char');
    if (!characters.length) return;

    const flash = (target) => gsap.timeline()
      .to(target, { opacity: 1, filter: 'brightness(2)', duration: 0.05, ease: 'none' })
      .to(target, { opacity: 0.2, filter: 'brightness(0.5)', duration: 0.05, ease: 'none' })
      .to(target, { opacity: 1, filter: 'brightness(1)', duration: 0.1, ease: 'none' });

    const timeline = gsap.timeline({ delay: index * 0.1 });
    for (let i = 0; i < Math.min(30, characters.length * 2); i += 1) {
      timeline.add(flash(characters[gsap.utils.random(0, characters.length - 1, 1)]), gsap.utils.random(0, 0.6));
    }
    timeline.to(characters, { opacity: 1, filter: 'brightness(1)', duration: 0.5, stagger: 0.01, ease: 'power2.out' }, 0.5);
  });
})();
