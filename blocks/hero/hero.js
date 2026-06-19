/*
 * Hero block
 * Base hero is CSS-only (full-bleed background media + heading).
 * The "stats" variant (hero stats) adds a row of statistics below the heading.
 */

export default function decorate(block) {
  if (!block.classList.contains('stats')) return;

  // Flag the stat list so CSS can lay the numbers out in a row.
  const list = block.querySelector('ul, ol');
  if (list) list.classList.add('hero-stats-figures');

  // Mark a paragraph that only wraps a picture as the background media.
  block.querySelectorAll('p').forEach((p) => {
    if (p.children.length === 1 && p.querySelector('picture')) {
      p.classList.add('hero-bg');
    }
  });
}
