/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ERCOT site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only the
 * page-level authorable content (hero, dashboard cards, dashboards CTA,
 * split sections, videos).
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *   - <header class="combined container-fluid px-0"> (line 4)  -> site header/nav.
 *       Contains <utility> (MIS LOG IN + search box), <mainheader>, and <nav>.
 *       Removing the header removes all of those nested chrome elements.
 *       Header/nav is migrated separately by navigation orchestration.
 *   - <footer class="combined container-fluid"> (line 1475)   -> site footer.
 *       Footer is migrated separately by footer orchestration.
 *   - <div id="bcrumb" class="d-sm-none d-md-block"> (line 839) -> breadcrumb.
 *
 * Note: <utility> is nested inside header.combined, so removing the header
 * is sufficient; it is also listed explicitly as a defensive selector in
 * case the DOM is delivered with the utility bar hoisted out of the header.
 *
 * No cookie/consent banner or skip-link chrome exists in the captured DOM,
 * so none is targeted here (selectors must come from the actual DOM).
 *
 * beforeTransform also wraps source "button" links (a.bigbutton, styled as
 * solid CTAs on ercot.com) in <strong>. EDS decorateButtons() in
 * scripts/scripts.js only buttonizes a link when it is wrapped in <strong>
 * (-> primary) or <em> (-> secondary); a bare link stays a plain link. Wrapping
 * here makes default-content CTAs (e.g. "View all dashboards", "More videos")
 * render as primary buttons, matching the source.
 */
const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Promote source CTA "button" links to EDS primary buttons via <strong>.
    element.querySelectorAll('a.bigbutton').forEach((a) => {
      if (a.closest('strong') || a.closest('em')) return;
      const doc = a.ownerDocument;
      const strong = doc.createElement('strong');
      a.replaceWith(strong);
      strong.appendChild(a);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (verified in cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      'header.combined', // site header (nav, mainheader, utility/search)
      'footer.combined', // site footer
      '#bcrumb', // breadcrumb trail
      'utility', // utility/login + search bar (defensive; normally nested in header)
    ]);
  }
}
