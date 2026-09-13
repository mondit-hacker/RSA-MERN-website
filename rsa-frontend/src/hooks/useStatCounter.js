import { useEffect } from 'react';

/**
 * useStatCounter
 * ──────────────
 * Animates [data-target] elements with a smooth count-up when
 * the #stats-bar container enters the viewport.
 *
 * Security note: el.textContent is used (not innerHTML) to prevent XSS.
 */
export function useStatCounter() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    function animateCount(el, target, suffix) {
      if (!el || isNaN(target)) return;
      let current = 0;
      const duration = 1400; // ms
      const steps    = 60;
      const increment = Math.ceil(target / steps);
      const interval  = Math.floor(duration / steps);

      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        // Use textContent — never innerHTML — for security
        el.textContent = current.toLocaleString('en-IN') + suffix;
        if (current >= target) clearInterval(timer);
      }, interval);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target
            .querySelectorAll('[data-target]')
            .forEach((el) => {
              const target = Number(el.dataset.target);
              const suffix = el.dataset.suffix || '';
              animateCount(el, target, suffix);
            });
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );

    const statsEl = document.getElementById('stats-bar');
    if (statsEl) observer.observe(statsEl);

    return () => observer.disconnect();
  }, []);
}
