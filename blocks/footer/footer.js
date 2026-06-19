import { getMetadata, DOMPURIFY } from '../../scripts/aem.js';
import { ensureDOMPurify } from '../../scripts/scripts.js';

/**
 * Fetch the footer fragment DOM. Tries the local content path first
 * (aem up / localhost), then the metadata-driven path (DA/EDS production).
 * Content is sanitized with DOMPurify before insertion (same as loadFragment).
 */
async function fetchFooter() {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${footerPath}.plain.html`);
  }
  if (!resp.ok) return null;
  await ensureDOMPurify();
  const tmp = document.createElement('div');
  tmp.innerHTML = window.DOMPurify.sanitize(await resp.text(), DOMPURIFY);
  return tmp;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children];
  // Section layout (from source): 4 link columns + 1 logo/social column form the
  // top band; the final section is the copyright/terms strip.
  const linkSections = sections.slice(0, 4);
  const brandSection = sections[4] || null;
  const legalSection = sections[5] || null;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // top band: link columns + brand/social column
  const top = document.createElement('div');
  top.className = 'footer-top';

  linkSections.forEach((sec) => {
    const col = document.createElement('div');
    col.className = 'footer-col';
    const heading = sec.querySelector('h2');
    if (heading) {
      const h = document.createElement('h2');
      h.className = 'footer-col-heading';
      h.textContent = heading.textContent;
      col.append(h);
    }
    const list = document.createElement('ul');
    list.className = 'footer-links';
    sec.querySelectorAll('ul > li > a').forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      li.append(link);
      list.append(li);
    });
    col.append(list);
    top.append(col);
  });

  // brand + social column
  if (brandSection) {
    const brandCol = document.createElement('div');
    brandCol.className = 'footer-brand';
    const logoLink = brandSection.querySelector('p > a');
    if (logoLink) {
      const a = document.createElement('a');
      a.href = logoLink.getAttribute('href');
      a.className = 'footer-logo-link';
      a.setAttribute('aria-label', 'ERCOT home');
      const img = logoLink.querySelector('img');
      if (img) {
        const logo = document.createElement('img');
        logo.src = img.getAttribute('src');
        logo.alt = img.getAttribute('alt') || 'ERCOT';
        logo.className = 'footer-logo';
        a.append(logo);
      }
      brandCol.append(a);
    }
    const social = document.createElement('ul');
    social.className = 'footer-social';
    brandSection.querySelectorAll('ul > li > a').forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const img = a.querySelector('img');
      const label = img ? (img.getAttribute('alt') || '') : a.textContent;
      link.setAttribute('aria-label', label);
      link.target = '_blank';
      link.rel = 'noopener';
      if (img) {
        const icon = document.createElement('img');
        icon.src = img.getAttribute('src');
        icon.alt = label;
        icon.className = 'footer-social-icon';
        link.append(icon);
      }
      li.append(link);
      social.append(li);
    });
    brandCol.append(social);
    top.append(brandCol);
  }

  footer.append(top);

  // bottom legal strip
  if (legalSection) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    legalSection.querySelectorAll('p').forEach((p) => {
      const para = document.createElement('p');
      const link = p.querySelector('a');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = link.textContent;
        para.append(a);
      } else {
        para.textContent = p.textContent;
      }
      legal.append(para);
    });
    footer.append(legal);
  }

  block.append(footer);
}
