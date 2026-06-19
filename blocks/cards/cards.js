import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

/**
 * In the "video" variant each card body holds a video URL (as a link). Replace
 * that link with a responsive embedded iframe so the card renders the video.
 */
function embedCardVideos(block) {
  block.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('a[href*="youtube"], a[href*="youtu.be"], a[href*="vimeo"], a[href*="/embed/"]');
    if (!link) return;
    const src = link.getAttribute('href');
    const wrapper = document.createElement('div');
    wrapper.className = 'cards-card-image';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', link.textContent.trim() || 'Video');
    wrapper.append(iframe);
    // drop the empty image placeholder and the raw URL paragraph
    const placeholder = li.querySelector('.cards-card-image:empty');
    if (placeholder) placeholder.remove();
    const p = link.closest('p');
    if (p) p.remove();
    li.prepend(wrapper);
  });
}

export default function decorate(block) {
  const blockId = getBlockId('cards');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    ul.append(createCard(row));
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('video')) embedCardVideos(block);
}
