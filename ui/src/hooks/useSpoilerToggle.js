import { useEffect } from 'react';

/**
 * Attaches click handlers to .su-spoiler-title elements that toggle .su-spoiler-closed
 * on the parent. Re-runs when `ready` becomes true.
 */
export default function useSpoilerToggle(ready) {
  useEffect(() => {
    if (!ready) return;

    const titles = document.querySelectorAll('.su-spoiler-title');
    const toggleSpoiler = function () {
      this.parentElement.classList.toggle('su-spoiler-closed');
    };

    titles.forEach(t => t.addEventListener('click', toggleSpoiler));
    return () => {
      titles.forEach(t => t.removeEventListener('click', toggleSpoiler));
    };
  }, [ready]);
}
