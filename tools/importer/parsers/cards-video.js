/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base: cards (container block).
 * Source: https://www.ercot.com/ (section.videos)
 * xwalk model (blocks/cards-video/_cards-video.json): container with `card`
 *   children, each card has image (reference) + text (richtext).
 * Structure (library-description.txt): each card = one row with two cells.
 *   Cell 1: image (field:image) — empty; a video embed is carried instead.
 *   Cell 2: text (field:text) — the YouTube embed link + caption heading.
 *
 * Each video tile is a <div> inside <videoblock>, holding an <iframe> (the
 * YouTube embed) and an <h6> caption. The section's H2 heading and the
 * trailing "More videos" button are default content, not part of this block,
 * so we scope strictly to the videoblock items.
 */
export default function parse(element, { document }) {
  // The three video tiles.
  const tiles = Array.from(
    element.querySelectorAll('videoblock > div, [class*="videoblock"] > div'),
  );

  const cells = [];

  tiles.forEach((tile) => {
    const iframe = tile.querySelector('iframe');
    const caption = tile.querySelector('h6, h5, h4, h3, [class*="caption"]');
    if (!iframe && !caption) return;

    // Image cell (field:image) — intentionally empty; this is a video card.
    const imageCell = '';

    // Text cell (field:text): caption heading + the embed URL as a link.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (caption) {
      const h = document.createElement('h3');
      h.textContent = caption.textContent.trim();
      textCell.appendChild(h);
    }

    const src = iframe ? iframe.getAttribute('src') : null;
    if (src) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', src);
      a.textContent = src;
      p.appendChild(a);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards (video)', cells });
  element.replaceWith(block);
}
