/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ERCOT section breaks and section metadata.
 *
 * The homepage template defines 6 sections (see page-templates.json). This
 * transformer inserts a section break (<hr>) before each section after the
 * first, and a "Section Metadata" block (with style) after each section that
 * declares a style. Two sections (split-responsibilities, split-assistance)
 * declare style "light".
 *
 * Section selectors come from payload.template.sections (populated from the
 * captured DOM during page analysis) and were verified against
 * migration-work/cleaned.html as direct children of the content div
 * (#mainContainer > ... > div.col.content-margin > div:nth-of-type(3)):
 *   1. section.hero
 *   2. div.mt-5.mx-2.row          (dashboard cards row)
 *   3. section.dashboards.mt-n5   (dashboards CTA)
 *   4. section.split:nth-of-type(3)  (split-responsibilities, style: light)
 *   5. section.videos
 *   6. section.split:nth-of-type(5)  (split-assistance, style: light)
 *
 * Runs in beforeTransform: section breaks/metadata are inserted as siblings of
 * the original section elements BEFORE the block parsers run. The parsers call
 * element.replaceWith(block), which swaps each section element in place and
 * leaves the inserted <hr> / Section Metadata siblings intact. (Running this in
 * afterTransform fails: by then the original section elements have been replaced
 * and section.selector no longer matches.)
 */
const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse order so inserting nodes does not shift the
    // positions of sections not yet processed.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const target = element.querySelector(section.selector);
      if (!target) continue;

      // Section Metadata block after the section, when a style is declared.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        target.after(metaBlock);
      }

      // Section break before every section except the first.
      if (i > 0) {
        target.before(doc.createElement('hr'));
      }
    }
  }
}
