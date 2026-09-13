import { useEffect } from 'react';

/**
 * useScrollReveal
 * ───────────────
 * Uses IntersectionObserver to add the `.visible` class to elements
 * that carry .reveal / .reveal-left / .reveal-right once they enter
 * the viewport. Staggered transition-delay is applied automatically.
 *
 * Security note: classList.add is safe — no innerHTML manipulation.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const selector = '.reveal, .reveal-left, .reveal-right';
    const elements = document.querySelectorAll(selector);

    elements.forEach((el, i) => {
      // Stagger delay — cycles every 6 items so delay never exceeds ~0.35s
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = `${(i % 6) * 0.07}s`;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}
