import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * Interior-Aside-Left template.
 *
 * Builds a three-area layout inside main:
 *   1. Breadcrumb — full-width top row (auto-built)
 *   2. Sidebar    — left column; section(s) where section-metadata has aside: true
 *   3. Content    — right column; all sections NOT marked aside
 *
 * @param {HTMLElement} main
 */
export default async function decorate(main) {
  // ── Breadcrumb ────────────────────────────────────────────────────────────
  const breadcrumbWrapper = document.createElement('div');
  const breadcrumbBlock = document.createElement('div');
  breadcrumbBlock.className = 'breadcrumb';
  breadcrumbWrapper.append(breadcrumbBlock);

  // ── Split authored sections into content vs sidebar ───────────────────────
  const contentArea = document.createElement('div');
  contentArea.className = 'interior-content';

  const sidebar = document.createElement('aside');
  sidebar.className = 'interior-sidebar';

  [...main.children].forEach((section) => {
    if (section.dataset.aside === 'true') {
      sidebar.append(section);
    } else {
      contentArea.append(section);
    }
  });

  // ── Layout ────────────────────────────────────────────────────────────────
  const layout = document.createElement('div');
  layout.className = 'interior-layout';
  layout.append(breadcrumbWrapper, sidebar, contentArea);
  main.append(layout);

  document.body.dataset.breadcrumbs = 'true';

  decorateBlock(breadcrumbBlock);
  await loadBlock(breadcrumbBlock);
}
