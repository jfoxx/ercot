/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-split. Base: columns.
 * Source: https://www.ercot.com/ (section.split — used by both the
 *   "responsibilities" and "assistance" sections; this parser is generic).
 * xwalk model (blocks/columns-split/_columns-split.json): columns block,
 *   2 columns x 1 row. Columns blocks take ONLY default content — NO field
 *   hint comments (per hinting rules).
 * Structure (library-description.txt + authoring-analysis): row 1 = block name;
 *   row 2 = two cells (left column, right column).
 *   Left  = heading + list/paragraphs + featured item/button.
 *   Right = eyebrow heading ("Featured:"/"Resources:") + items + optional button.
 *
 * The source links wrap a decorative base64 SVG arrow icon (fa-angle-right);
 * those inline icon images are stripped so they don't pollute the markdown.
 */
export default function parse(element, { document }) {
  // The two columns are the .left and .right wrappers. Fall back to the first
  // two direct children if those classes aren't present.
  let leftSrc = element.querySelector('wrapper.left, .left, [class*="left"]');
  let rightSrc = element.querySelector('wrapper.right, .right, [class*="right"]');

  if (!leftSrc || !rightSrc) {
    const children = Array.from(element.children).filter(
      (c) => c.textContent.trim().length,
    );
    leftSrc = leftSrc || children[0];
    rightSrc = rightSrc || children[1];
  }

  if (!leftSrc && !rightSrc) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Clone a column and strip decorative inline-SVG icons (and their <span>
  // wrappers when they only held the icon).
  const cleanColumn = (src) => {
    if (!src) return '';
    const clone = src.cloneNode(true);
    clone.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => {
      const span = img.closest('span');
      if (span && !span.textContent.trim()) span.remove();
      else img.remove();
    });
    // Return the cloned wrapper's child nodes as the cell contents.
    const frag = document.createDocumentFragment();
    Array.from(clone.childNodes).forEach((n) => frag.appendChild(n));
    return frag;
  };

  const leftCell = cleanColumn(leftSrc);
  const rightCell = cleanColumn(rightSrc);

  // Single row, two columns. No field hints — columns block.
  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
}
