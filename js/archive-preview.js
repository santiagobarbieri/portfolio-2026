/** One preview at a time; the cover always reserves the card's geometry. */
export function initArchivePreview(stream, projects) {
  const catalogue = new Map(projects.map((project) => [project.slug, project.preview || []]));
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active, timer, generation = 0, pointer = null;

  function stop() {
    clearTimeout(timer);
    generation += 1;
    active?.classList.remove('archive-card__link--previewing');
    active?.querySelector('.archive-card__quick-preview')?.remove();
    active = null;
  }

  function start(link) {
    if (!link || active === link || !fine.matches || document.hidden) return;
    stop();
    const items = catalogue.get(link.closest('.archive-card')?.dataset.slug);
    if (!items?.length) return;
    active = link;
    const token = generation;
    let index = 0;
    const overlay = document.createElement('img');
    overlay.className = 'archive-card__quick-preview';
    overlay.alt = ''; // The link and original cover keep their accessible name.
    overlay.setAttribute('aria-hidden', 'true');
    link.querySelector('.archive-card__media').append(overlay);

    async function show() {
      if (token !== generation) return;
      const rect = link.getBoundingClientRect();
      const caption = link.querySelector('.archive-card__caption').getBoundingClientRect();
      const over = pointer && pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= Math.max(rect.bottom, caption.bottom);
      if (!link.isConnected || (!link.contains(document.activeElement) && !over)) { stop(); return; }
      const image = new Image();
      image.decoding = 'async';
      image.src = new URL(items[index].src, document.baseURI).href;
      try {
        await image.decode();
        if (token !== generation || !link.isConnected) return;
        overlay.src = image.src;
        link.classList.add('archive-card__link--previewing');
      } catch { /* Keep the original cover if an optional preview is unavailable. */ }
      index = (index + 1) % items.length;
      if (!reduced.matches && token === generation) timer = setTimeout(show, 1100);
    }
    timer = setTimeout(show, 320);
  }

  stream.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    start(event.target.closest('.archive-card__link'));
  });
  stream.addEventListener('pointermove', (event) => { pointer = { x: event.clientX, y: event.clientY }; });
  stream.addEventListener('pointerout', (event) => {
    if (active && !active.contains(event.relatedTarget) && active.contains(event.target)) stop();
  });
  stream.addEventListener('focusin', (event) => start(event.target.closest('.archive-card__link')));
  stream.addEventListener('focusout', (event) => { if (active && !active.contains(event.relatedTarget)) stop(); });
  stream.addEventListener('click', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  fine.addEventListener('change', stop);
  reduced.addEventListener('change', stop);
  return { stop, release(card) { if (active && card.contains(active)) stop(); } };
}
