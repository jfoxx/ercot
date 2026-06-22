import { getMetadata } from '../../scripts/aem.js';

/**
 * Fetches a path→title map from the query index.
 * @returns {Promise<Map<string,string>>}
 */
async function fetchTitleMap() {
  try {
    const resp = await fetch('/query-index.json');
    if (!resp.ok) return new Map();
    const { data } = await resp.json();
    return new Map(data.map((row) => [row.path, row.title]));
  } catch {
    return new Map();
  }
}

/**
 * Converts a URL path segment to a display label.
 * e.g. "market-info" → "Market Info"
 * @param {string} segment
 * @returns {string}
 */
function segmentToLabel(segment) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds and decorates the Breadcrumb block.
 *
 * Derives crumbs from the current URL pathname. Page titles are resolved from
 * /query-index.json when available, with a humanised fallback.
 * The final crumb (current page) uses the page's og:title / title metadata.
 *
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (!segments.length) {
    block.closest('.breadcrumb-wrapper')?.remove();
    return;
  }

  const titleMap = await fetchTitleMap();

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');
  const ol = document.createElement('ol');

  // Home
  const homeLi = document.createElement('li');
  const homeA = document.createElement('a');
  homeA.href = '/';
  homeA.textContent = getMetadata('breadcrumb-home') || 'Home';
  homeLi.append(homeA);
  ol.append(homeLi);

  // One crumb per path segment
  let cumulativePath = '';
  segments.forEach((segment, i) => {
    cumulativePath += `/${segment}`;
    const isLast = i === segments.length - 1;
    const li = document.createElement('li');

    if (isLast) {
      li.setAttribute('aria-current', 'page');
      li.textContent = getMetadata('og:title')
        || getMetadata('title')
        || titleMap.get(cumulativePath)
        || segmentToLabel(segment);
    } else {
      const a = document.createElement('a');
      a.href = cumulativePath;
      a.textContent = titleMap.get(cumulativePath) || segmentToLabel(segment);
      li.append(a);
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
