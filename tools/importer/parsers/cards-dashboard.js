/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-dashboard. Base: cards (container block).
 * Source: https://www.ercot.com/ (div.mt-5.mx-2.row)
 * xwalk model (blocks/cards-dashboard/_cards-dashboard.json): container with
 *   `card` children, each card has image (reference) + text (richtext).
 * Structure (library-description.txt): each card = one row with two cells.
 *   Cell 1: image (field:image) — empty here, the live chart renders
 *   client-side, so no image is carried.
 *   Cell 2: text (field:text) — dashboard title heading + external link.
 *
 * NOTE: the cached source over-captured surrounding markup; we scope strictly
 * to the three dashboard tiles (div.col-xl-4 > div.card) and read the title
 * from the a.dashboard-card-head anchor so we ignore the stray <h5> inside the
 * chart placeholder of one tile.
 */
export default function parse(element, { document }) {
  // Strictly scope to the three dashboard tiles.
  const cards = Array.from(element.querySelectorAll(':scope > div.col-xl-4'));

  const cells = [];

  cards.forEach((col) => {
    // The titled link to the live dashboard.
    const headLink = col.querySelector('a.dashboard-card-head, a[class*="card-head"]');
    if (!headLink) return;

    // Title heading lives inside the head anchor.
    const titleEl = headLink.querySelector('h5, h2, h3, h4');
    const titleText = titleEl ? titleEl.textContent.trim() : headLink.textContent.trim();
    const href = headLink.getAttribute('href');

    // Image cell (field:image) — intentionally empty; chart renders at runtime.
    const imageCell = '';

    // Text cell (field:text): a heading whose text links to the dashboard.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const heading = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = titleText;
      heading.appendChild(a);
    } else {
      heading.textContent = titleText;
    }
    textCell.appendChild(heading);

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-dashboard', cells });
  element.replaceWith(block);
}
