/**
 * Loads and decorates the Related Content block.
 *
 * The block delivers a single cell containing an <h3> heading and a <ul> of
 * links. This function prepends a block-title <h2> derived from the block
 * name, then unwraps the cell content from its row/cell divs.
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Generate the block title from the block name ("related-content" → "Related Content")
  const title = (block.dataset.blockName || '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const h2 = document.createElement('h2');
  h2.textContent = title;
  block.prepend(h2);

  // Unwrap the cell content (h3 + ul) onto the block
  const firstCell = block.querySelector(':scope > div > div');
  if (firstCell) {
    [...firstCell.children].forEach((child) => block.append(child));
  }
  block.querySelectorAll(':scope > div').forEach((row) => row.remove());
}
