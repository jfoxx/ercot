/*
 * Hero block
 * Base hero is CSS-only (full-bleed background media + heading).
 * The "stats" variant (hero stats) adds a row of statistics below the heading.
 * The "video" variant uses a placeholder image until a background video loads.
 */

function decorateVideoHero(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const [mediaCell, textCell] = [...row.children];

  const picture = mediaCell?.querySelector('picture');
  const videoLink = mediaCell?.querySelector('a[href]');
  const videoSrc = videoLink?.href;

  // Move text content into a scoped overlay div
  const content = document.createElement('div');
  content.classList.add('hero-video-content');
  if (textCell) [...textCell.children].forEach((el) => content.appendChild(el));

  // Build the background wrapper: picture first, video on top (opacity 0 → 1)
  const bg = document.createElement('div');
  bg.classList.add('hero-video-bg');
  bg.setAttribute('aria-hidden', 'true');

  if (picture) bg.appendChild(picture);

  if (videoSrc) {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    const source = document.createElement('source');
    source.src = videoSrc;
    video.appendChild(source);

    video.addEventListener('canplay', () => video.classList.add('is-playing'), { once: true });

    bg.appendChild(video);
  }

  row.remove();
  block.prepend(bg);
  block.appendChild(content);
}

export default function decorate(block) {
  if (block.classList.contains('video')) {
    decorateVideoHero(block);
    return;
  }

  if (!block.classList.contains('stats')) return;

  // Flag the stat list so CSS can lay the numbers out in a row.
  const list = block.querySelector('ul, ol');
  if (list) list.classList.add('hero-stats-figures');

  // Mark a paragraph that only wraps a picture as the background media.
  block.querySelectorAll('p').forEach((p) => {
    if (p.children.length === 1 && p.querySelector('picture')) {
      p.classList.add('hero-bg');
    }
  });
}
