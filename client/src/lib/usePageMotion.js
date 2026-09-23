import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Each page owns its animations; route changes and StrictMode restore all styles.
export default function usePageMotion(page, view = '', ready = true) {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (!ready || !root.current) return;
    const media = gsap.matchMedia();
    const element = root.current;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element);
      const enter = (selector, options = {}) => {
        const targets = select(selector);
        if (!targets.length) return;
        return gsap.from(targets, {
          y: 18, opacity: 0, duration: 0.55, ease: 'power2.out',
          stagger: { amount: 0.2 }, clearProps: 'transform,opacity', ...options,
        });
      };

      if (page === 'landing') {
        enter('.hero-copy > *', { y: 24, duration: 0.7, stagger: 0.09 });
        enter('.preview-card', { y: 30, duration: 0.85, delay: 0.12 });
        enter('.floating-platform, .floating-note', { y: 16, delay: 0.35, stagger: 0.1 });
        // A short settling motion rather than an endless animation behind the text.
        const accents = select('.floating-platform');
        if (accents.length) gsap.to(accents, {
          y: -7, duration: 1.2, delay: 1.4, stagger: 0.08,
          repeat: 1, yoyo: true, ease: 'sine.inOut', clearProps: 'transform',
        });
        select('.platform-strip .container, .section-heading, .steps article, .creator-banner, .faq-preview > div').forEach(target => {
          gsap.from(target, {
            y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: target, start: 'top 94%', once: true },
          });
        });
      } else if (page === 'auth') {
        enter('.auth-story > div', { y: 24, duration: 0.7 });
        enter('.auth-form > *', { stagger: 0.06, duration: 0.45 });
      } else if (page === 'workspace') {
        enter('.page-heading', { y: 10, duration: 0.35 });
        enter('.stat-card, .daily-banner, .dashboard-columns > .panel, .workspace-main > .panel, .task-card, .plan-card', {
          y: 14, duration: 0.4, stagger: { amount: 0.22 },
        });
      }
    }, element);

    return () => media.revert();
  }, [page, view, ready]);

  return root;
}
