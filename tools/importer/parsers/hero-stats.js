/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-stats. Base: hero.
 * Source: https://www.ercot.com/ (section.hero)
 * xwalk model (blocks/hero-stats/_hero-stats.json): image (reference),
 *   imageAlt (collapsed), text (richtext).
 * Structure (from library-description.txt + model): 1 column.
 *   Row 1: block name. Row 2: background image (field:image).
 *   Row 3: text richtext (field:text) = H1 heading + a list of stats.
 * The hero-stats decorate JS marks any ul/ol as the stat figures row, so the
 * three statistics are emitted as list items "<number> — <label>".
 */
export default function parse(element, { document }) {
  // --- Background media: prefer the still image (model field is an image
  // reference). The source also has a <video>; we carry the poster image. ---
  const bgImage = element.querySelector('img');

  // --- Heading ---
  const heading = element.querySelector('h1, h2, [class*="title"]');

  // --- Statistics: each <stat> has a .number and a .text span. ---
  const statEls = Array.from(element.querySelectorAll('stat'));

  const cells = [];

  // Row 2: background image cell (field:image). Omit if absent.
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  }

  // Row 3: text cell (field:text) holds heading + stat list.
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);

  if (statEls.length) {
    const ul = document.createElement('ul');
    statEls.forEach((stat) => {
      const number = stat.querySelector('.number, [class*="number"]');
      const label = stat.querySelector('.text, [class*="label"]');
      const numberText = number ? number.textContent.trim() : '';
      // Collapse the <br> inside the label into spaces.
      const labelText = label
        ? label.textContent.replace(/\s+/g, ' ').trim()
        : '';
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = numberText;
      li.appendChild(strong);
      if (labelText) {
        li.appendChild(document.createTextNode(` ${labelText}`));
      }
      ul.appendChild(li);
    });
    textCell.appendChild(ul);
  }
  cells.push([textCell]);

  // Empty-block guard.
  if (!heading && !statEls.length && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero (stats)', cells });
  element.replaceWith(block);
}
