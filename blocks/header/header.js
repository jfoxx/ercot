import { getMetadata, DOMPURIFY } from '../../scripts/aem.js';
import { ensureDOMPurify } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment DOM. Tries the local content path first
 * (aem up / localhost), then the metadata-driven path (DA/EDS production).
 * Content is sanitized with DOMPurify before insertion (same as loadFragment).
 */
async function fetchNav() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  await ensureDOMPurify();
  const tmp = document.createElement('div');
  tmp.innerHTML = window.DOMPurify.sanitize(await resp.text(), DOMPURIFY);
  return tmp;
}

/** Close any open desktop dropdown. */
function closeAllDropdowns(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/** Toggle the mobile menu open/closed. */
function toggleMenu(nav, forceOpen) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  const open = typeof forceOpen === 'boolean' ? forceOpen : !expanded;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  const toggle = nav.querySelector('.nav-hamburger button');
  if (toggle) toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (!open) closeAllDropdowns(nav);
}

/** Build the utility row (login links + search) from the first nav section. */
function buildUtility(section) {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  const inner = document.createElement('div');
  inner.className = 'nav-utility-inner';

  if (section) {
    const links = document.createElement('ul');
    links.className = 'nav-utility-links';
    section.querySelectorAll('a').forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      li.append(link);
      links.append(li);
    });
    inner.append(links);
  }

  // search form (built in JS — form controls do not live in the fragment)
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = 'https://www.ercot.com/search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Submit search');
  form.append(input, submit);
  inner.append(form);

  utility.append(inner);
  return utility;
}

/** Build the brand row (logo). */
function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const link = section && section.querySelector('a');
  if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href') || '/';
    a.setAttribute('aria-label', 'ERCOT home');
    const img = link.querySelector('img');
    if (img) {
      const logo = document.createElement('img');
      logo.src = img.getAttribute('src');
      logo.alt = img.getAttribute('alt') || '';
      logo.className = 'nav-logo';
      a.append(logo);
    }
    brand.append(a);
  }
  return brand;
}

/** Build the main navigation (top-level items + hover dropdowns). */
function buildSections(section) {
  const wrapper = document.createElement('nav');
  wrapper.className = 'nav-sections';
  const list = document.createElement('ul');
  list.className = 'nav-list';

  // Each top-level item is an <h2><a>label</a></h2> followed by a <ul> of links.
  [...section.querySelectorAll('h2')].forEach((h) => {
    const li = document.createElement('li');
    const trigger = h.querySelector('a');
    const drop = h.nextElementSibling;
    const hasDrop = drop && drop.tagName === 'UL';

    if (hasDrop) li.classList.add('nav-drop');

    const topLink = document.createElement('a');
    topLink.href = trigger ? trigger.getAttribute('href') : '#';
    topLink.textContent = trigger ? trigger.textContent : h.textContent;
    topLink.className = 'nav-top-link';
    li.append(topLink);

    // standalone top-level links (no dropdown) — present in source nav tree but
    // shown only in the mobile menu; hidden on desktop via CSS.
    if (!hasDrop) li.classList.add('nav-standalone');

    if (hasDrop) {
      li.setAttribute('aria-expanded', 'false');
      const panel = document.createElement('div');
      panel.className = 'nav-dropdown';
      panel.setAttribute('role', 'menu');
      const panelList = document.createElement('ul');
      drop.querySelectorAll(':scope > li > a').forEach((a) => {
        const childLi = document.createElement('li');
        const childA = document.createElement('a');
        childA.href = a.getAttribute('href');
        childA.textContent = a.textContent;
        childLi.append(childA);
        panelList.append(childLi);
      });
      panel.append(panelList);
      li.append(panel);

      // mobile: tapping the top link toggles the panel instead of navigating
      topLink.addEventListener('click', (e) => {
        if (!isDesktop.matches) {
          e.preventDefault();
          const open = li.getAttribute('aria-expanded') === 'true';
          li.setAttribute('aria-expanded', open ? 'false' : 'true');
        }
      });
    }

    list.append(li);
  });

  wrapper.append(list);
  return wrapper;
}

/** Wire desktop hover open/close on dropdown items. */
function wireDesktopHover(nav) {
  nav.querySelectorAll('.nav-drop').forEach((li) => {
    li.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        closeAllDropdowns(nav);
        li.setAttribute('aria-expanded', 'true');
      }
    });
    li.addEventListener('mouseleave', () => {
      if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');

  const sections = fragment ? [...fragment.children] : [];
  const utilitySection = sections[0] || null;
  const brandSection = sections[1] || null;
  const navSection = sections[2] || null;

  // hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hbBtn = document.createElement('button');
  hbBtn.type = 'button';
  hbBtn.setAttribute('aria-controls', 'nav');
  hbBtn.setAttribute('aria-label', 'Open navigation');
  const hbIcon = document.createElement('span');
  hbIcon.className = 'nav-hamburger-icon';
  hbBtn.append(hbIcon);
  hbBtn.addEventListener('click', () => toggleMenu(nav));
  hamburger.append(hbBtn);

  // utility row (top)
  if (utilitySection) nav.append(buildUtility(utilitySection));

  // main row: brand + hamburger + nav sections
  const mainRow = document.createElement('div');
  mainRow.className = 'nav-main';
  if (brandSection) mainRow.append(buildBrand(brandSection));
  mainRow.append(hamburger);
  let navSectionsEl = null;
  if (navSection) {
    navSectionsEl = buildSections(navSection);
    mainRow.append(navSectionsEl);
  }
  nav.append(mainRow);

  if (navSectionsEl) wireDesktopHover(nav);

  // close dropdowns when clicking outside the header
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns(nav);
  });

  // viewport resize handling: reset state when crossing the breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllDropdowns(nav);
    if (isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'true');
      document.body.style.overflowY = '';
      const toggle = nav.querySelector('.nav-hamburger button');
      if (toggle) toggle.setAttribute('aria-label', 'Open navigation');
    } else {
      nav.setAttribute('aria-expanded', 'false');
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
