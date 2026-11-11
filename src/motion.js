const gsap=globalThis.gsap;
const ScrollTrigger=globalThis.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function refreshMotion() { ScrollTrigger.refresh(); }
function animateSwitch(el, direction = 1) {
  if (prefersReduced() || !el) return;
  gsap.fromTo(el, { opacity: .25, y: 14 * direction }, { opacity: 1, y: 0, duration: .46, ease: 'power2.out', clearProps: 'opacity,transform' });
}

function initMotion() {
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { const p = document.querySelector('.scrollbar'); if (p) p.style.transform = `scaleX(${self.progress})`; } });
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({ defaults: { duration: .83, ease: 'power3.out' } })
      .from('[data-hero]', { opacity: 0, y: 31, stagger: .105 }, .06)
      .from('[data-hero-visual]', { opacity: 0, y: 44, rotation: -1.7 }, .35);
    gsap.utils.toArray('[data-reveal]').forEach((node) => {
      gsap.from(node, { opacity: 0, y: 25, duration: .78, ease: 'power2.out', scrollTrigger: { trigger: node, start: 'top 92%', once: true } });
    });
    gsap.fromTo('.ring-progress', { strokeDashoffset: 458.672 }, { strokeDashoffset: 147.3, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: '.audit-card', start: 'top 86%', once: true } });
    gsap.from('.feature-cell svg', { opacity: .4, y: 17, duration: .7, stagger: .09, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.feature-grid', start: 'top 84%', once: true } });
    return () => {};
  });
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to('.visual-frame', { y: -29, rotation: -1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top 0%', end: 'bottom 0%', scrub: .7 } });
    gsap.to('.visual-annotation', { y: -46, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top 0%', end: 'bottom 0%', scrub: .8 } });
    gsap.to('.phone-shell', { y: -15, rotation: 1.25, ease: 'none', scrollTrigger: { trigger: '.experience-stage', start: 'top 94%', end: 'bottom 15%', scrub: .7 } });
  });
  document.querySelectorAll('details').forEach((el) => el.addEventListener('toggle', () => ScrollTrigger.refresh()));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('[data-hero],[data-reveal],[data-hero-visual]').forEach((node) => { node.style.opacity = '1'; node.style.transform = 'none'; });
  });
  return mm;
}

;globalThis.FingerProMotion = { refreshMotion, animateSwitch, initMotion };
