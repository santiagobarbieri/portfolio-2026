import { initArchivePreview } from './archive-preview.js';
import { initLaunchPanel } from './launch-panel.js';
import { waitForImages } from './loading.js';

const STEP = 280;
const storageKey = 'portfolio-perspective-state';
const modulo = (value, count) => ((value % count) + count) % count;
const collator = new Intl.Collator('es', { sensitivity: 'base' });

/** A finite window of parallel planes; client pages keep their own reading layout. */
export async function initHomeCarousel({ stream, templates, projects, main }) {
  if (!templates.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  const catalogue = templates.map(card => card.dataset.slug).join('|');
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch {}
  if (stored.version !== 1 || stored.catalogue !== catalogue) stored = {};
  let order = ['newest', 'oldest', 'az'].includes(stored.order) ? stored.order : 'newest';
  let category = templates.some(card => card.dataset.family === stored.category) ? stored.category : 'all';
  let selected = [];
  let position = 0, target = 0, velocity = 0, frame = 0, previous = 0, snapTimer = 0;
  let width = 0, height = 0, cardWidth = 0, stepX = 0, stepY = 0;
  let automaticPending = false;
  let departed = false, activeSequence = null, dragging = null, suppressClick = false;
  let reducedWheelAt = -Infinity;
  const records = new Map();
  const jumpLinks = [...document.querySelectorAll('[data-launch-jump]')];
  const menus = [...document.querySelectorAll('[data-filter-menu]')];
  const filters = document.querySelector('[data-archive-filter-panel]');
  const fragment = document.createDocumentFragment();
  fragment.append(...stream.childNodes);
  const viewport = document.createElement('div');
  viewport.className = 'project-carousel__viewport';
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Recorrido de proyectos');
  viewport.setAttribute('aria-roledescription', 'carrusel');
  viewport.setAttribute('aria-describedby', 'carousel-instructions');
  viewport.tabIndex = 0;
  const scene = document.createElement('div');
  scene.className = 'project-carousel__scene';
  viewport.append(scene);
  const meta = document.createElement('div');
  meta.className = 'project-carousel__meta';
  const info = document.createElement('a');
  info.className = 'project-carousel__information';
  info.dataset.cursorAction = 'Abrir proyecto';
  const title = document.createElement('h2');
  title.className = 'project-carousel__title';
  const type = document.createElement('p');
  type.className = 'project-carousel__type';
  const description = document.createElement('p');
  description.className = 'project-carousel__description';
  info.append(title, type, description);
  const controls = document.createElement('nav');
  controls.className = 'project-carousel__controls';
  controls.setAttribute('aria-label', 'Navegar proyectos');
  const before = document.createElement('button');
  before.type = 'button'; before.textContent = 'Anterior'; before.dataset.carouselPrevious = '';
  before.setAttribute('aria-label', 'Proyecto anterior');
  const after = document.createElement('button');
  after.type = 'button'; after.textContent = 'Siguiente'; after.dataset.carouselNext = '';
  after.setAttribute('aria-label', 'Proyecto siguiente');
  const counter = document.createElement('span');
  counter.className = 'project-carousel__counter'; counter.dataset.carouselStatus = '';
  controls.append(before, counter, after);
  const hint = document.createElement('p');
  hint.id = 'carousel-instructions'; hint.className = 'project-carousel__hint';
  hint.textContent = 'Deslizá o arrastrá para recorrer · Tocá una portada para abrir';
  const announcement = document.createElement('p');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  meta.append(info, controls, hint, announcement);
  stream.append(viewport, meta);
  main.classList.add('project-carousel');
  document.body.classList.add('has-project-carousel');
  const preview = initArchivePreview(scene, projects);

  function sort() {
    return templates.filter(card => category === 'all' || card.dataset.family === category).sort((a, b) => {
      if (order === 'az') return collator.compare(a.dataset.title || a.querySelector('h2').textContent, b.dataset.title || b.querySelector('h2').textContent);
      const difference = Number(a.dataset.order) - Number(b.dataset.order);
      return order === 'oldest' ? -difference : difference;
    });
  }
  function currentIndex() { return modulo(Math.round(position / STEP), selected.length); }
  function currentCard() { return records.get(Math.round(position / STEP))?.card || null; }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, catalogue, category, order, position: modulo(position / STEP, selected.length) })); } catch {}
  }
  function cancelMotion() {
    cancelAnimationFrame(frame); frame = previous = 0;
    clearTimeout(snapTimer);
    velocity = 0;
  }
  function notify() { document.dispatchEvent(new CustomEvent('portfolio:jump')); }
  function syncMenus() {
    const families = new Set(templates.map(card => card.dataset.family));
    document.querySelector('[data-filter-menu="category"]')?.toggleAttribute('hidden', families.size < 2);
    filters.open = false;
    menus.forEach(menu => {
      const value = menu.dataset.filterMenu === 'order' ? order : category;
      const input = menu.querySelector(`input[value="${CSS.escape(value)}"]`);
      if (input) { input.checked = true; menu.querySelector('[data-filter-label]').textContent = input.nextElementSibling.textContent; }
      menu.open = menu.dataset.filterMenu === 'order';
    });
    const list = document.querySelector('.launch-project-list');
    jumpLinks.forEach(link => { link.parentElement.hidden = !selected.some(card => card.dataset.slug === link.dataset.launchJump); });
    selected.forEach((card, index) => {
      const link = jumpLinks.find(link => link.dataset.launchJump === card.dataset.slug);
      if (link && list.children[index] !== link.parentElement) list.insertBefore(link.parentElement, list.children[index] || null);
    });
    document.querySelector('[data-archive-status]').textContent = `${selected.length} proyectos`;
  }
  function createSlot(sequence) {
    const slot = document.createElement('div');
    slot.className = 'project-carousel__slot';
    const card = selected[modulo(sequence, selected.length)].cloneNode(true);
    card.removeAttribute('id');
    card.classList.remove('archive-card--right');
    const link = card.querySelector('.archive-card__link');
    link.dataset.cursorAction = `Abrir ${card.querySelector('.archive-card__title').textContent.trim()}`;
    const image = card.querySelector('.archive-card__image');
    if (image) { image.draggable = false; image.sizes = `${Math.ceil(cardWidth)}px`; }
    slot.dataset.sequence = sequence;
    slot.setAttribute('role', 'group');
    slot.setAttribute('aria-roledescription', 'diapositiva');
    slot.setAttribute('aria-label', `${modulo(sequence, selected.length) + 1} de ${selected.length}`);
    slot.append(card); scene.append(slot);
    return { slot, card, link, sequence };
  }
  function draw() {
    const unit = position / STEP;
    const base = Math.round(unit);
    const wanted = new Set(Array.from({ length: 7 }, (_, index) => base + index - 3));
    for (const [sequence, record] of records) {
      if (wanted.has(sequence)) continue;
      preview.release(record.card);
      if (record.slot.contains(document.activeElement)) viewport.focus({ preventScroll: true });
      record.slot.remove(); records.delete(sequence);
    }
    wanted.forEach(sequence => { if (!records.has(sequence)) records.set(sequence, createSlot(sequence)); });
    const representatives = new Map();
    records.forEach(record => {
      const q = record.sequence - unit;
      const slug = record.card.dataset.slug;
      if (!representatives.has(slug) || Math.abs(q) < Math.abs(representatives.get(slug).sequence - unit)) representatives.set(slug, record);
      const scale = Math.max(.78, 1 - q * .035);
      record.slot.style.transform = `translate(-50%, -50%) translate(${(q * stepX).toFixed(2)}px, ${(-q * stepY).toFixed(2)}px) perspective(1400px) rotateY(-16deg) rotateZ(3deg) scale(${scale.toFixed(4)})`;
      record.slot.style.zIndex = String(100 - record.sequence + base);
      record.slot.style.opacity = '1';
    });
    records.forEach(record => {
      const primary = representatives.get(record.card.dataset.slug) === record;
      record.slot.toggleAttribute('inert', !primary);
      if (primary) { record.slot.removeAttribute('aria-hidden'); record.card.id = `project-${record.card.dataset.slug}`; }
      else { record.slot.setAttribute('aria-hidden', 'true'); record.card.removeAttribute('id'); }
      record.link.tabIndex = primary && record.sequence === base ? 0 : -1;
      record.slot.dataset.active = String(record.sequence === base);
    });
    main.dataset.carouselPosition = position.toFixed(3);
    main.dataset.carouselSlug = selected[currentIndex()].dataset.slug;
    if (activeSequence !== base) {
      activeSequence = base;
      const card = currentCard();
      const name = card.querySelector('.archive-card__title').textContent.trim();
      title.textContent = name;
      type.textContent = [card.querySelector('.archive-card__type')?.textContent.trim(), card.querySelector('.archive-card__year')?.textContent.trim()].filter(Boolean).join(' · ');
      description.textContent = card.querySelector('.archive-card__description')?.textContent.trim() || '';
      info.href = card.querySelector('a').href;
      info.setAttribute('aria-label', `Abrir ${name}`);
      counter.textContent = `${String(currentIndex() + 1).padStart(2, '0')} / ${String(selected.length).padStart(2, '0')}`;
      document.dispatchEvent(new CustomEvent('portfolio:carouselchange'));
    }
  }
  function measure() {
    const rect = viewport.getBoundingClientRect(); width = rect.width; height = rect.height;
    cardWidth = Math.min(360, height * .68 * .8, width * .31);
    stepX = Math.max(cardWidth * .70, width / 5.2);
    stepY = Math.min(height * .105, stepX * .42);
    scene.style.setProperty('--carousel-card-width', `${cardWidth.toFixed(2)}px`);
    records.forEach(({ card }) => card.querySelector('img')?.setAttribute('sizes', `${Math.ceil(cardWidth)}px`));
    draw();
  }
  function tick(now) {
    frame = 0;
    if (departed || document.hidden || !desktop.matches) { previous = 0; return; }
    const dt = Math.min(.032, previous ? (now - previous) / 1000 : 1 / 60);
    previous = now;
    if (reduce.matches) { position = target; velocity = 0; }
    else {
      velocity += ((target - position) * 150 - velocity * 25) * dt;
      position += velocity * dt;
    }
    if (Math.abs(target - position) < .015 && Math.abs(velocity) < .08) { position = target; velocity = 0; previous = 0; }
    draw();
    if (velocity || Math.abs(target - position) > .015) frame = requestAnimationFrame(tick);
    else save();
  }
  function go(value, { immediate = false, automatic = false } = {}) {
    automaticPending = automatic;
    target = value;
    if (immediate || reduce.matches) { cancelMotion(); position = target; draw(); save(); }
    else if (!frame && !departed && !document.hidden && desktop.matches) frame = requestAnimationFrame(tick);
  }
  function pauseAutomatic() {
    if (!automaticPending) return;
    automaticPending = false;
    cancelMotion(); target = position;
    draw(); save();
  }
  const utilities = document.querySelector('[data-launch-utilities]');
  utilities.addEventListener('toggle', () => {
    if (utilities.querySelector('details[open]')) pauseAutomatic();
  }, true);
  document.addEventListener('pointermove', event => {
    if (main.contains(event.target) || utilities.contains(event.target)) pauseAutomatic();
  }, { passive: true });
  main.addEventListener('focusin', pauseAutomatic);
  utilities.addEventListener('focusin', pauseAutomatic);
  function announce() {
    const destination = modulo(Math.round(target / STEP), selected.length);
    announcement.textContent = `${selected[destination].querySelector('.archive-card__title').textContent.trim()}, ${destination + 1} de ${selected.length}`;
  }
  function navigate(delta) {
    preview.stop(); notify();
    go((Math.round(target / STEP) + delta) * STEP);
    announce();
  }
  function jump(slug) {
    const index = selected.findIndex(card => card.dataset.slug === slug);
    if (index < 0) return;
    const cycle = Math.round((position / STEP - index) / selected.length);
    preview.stop(); notify();
    // A fast jump goes straight to its plane, without flying through every card.
    go((index + cycle * selected.length) * STEP, { immediate: true });
    announce();
  }

  selected = sort();
  if (!selected.length) selected = templates.slice();
  position = target = Number.isFinite(stored.position) ? modulo(stored.position, selected.length) * STEP : 0;
  syncMenus(); measure();
  before.addEventListener('click', () => navigate(-1));
  after.addEventListener('click', () => navigate(1));
  jumpLinks.forEach(link => link.addEventListener('click', event => { event.preventDefault(); jump(link.dataset.launchJump); }));
  menus.forEach(menu => menu.addEventListener('change', event => {
    if (!event.target.matches('input')) return;
    const slug = selected[currentIndex()].dataset.slug;
    preview.stop(); cancelMotion();
    if (menu.dataset.filterMenu === 'order') order = event.target.value;
    else category = event.target.value;
    const next = sort();
    if (!next.length) return;
    records.forEach(({ slot }) => slot.remove()); records.clear();
    selected = next; activeSequence = null;
    position = target = Math.max(0, selected.findIndex(card => card.dataset.slug === slug)) * STEP;
    draw(); syncMenus(); save(); notify(); filters.querySelector('summary').focus({ preventScroll: true });
  }));
  main.addEventListener('wheel', event => {
    if (event.ctrlKey || event.target.closest('[data-lenis-prevent]')) return;
    event.preventDefault(); preview.stop();
    const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const delta = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
    if (reduce.matches) {
      if (performance.now() - reducedWheelAt > 180 && Math.abs(delta) > 5) { reducedWheelAt = performance.now(); navigate(Math.sign(delta)); }
      return;
    }
    go(target + Math.max(-450, Math.min(450, delta)) * .75);
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => go(Math.round(target / STEP) * STEP), 160);
  }, { passive: false });
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), start: target, speed: 0, moved: false };
    clearTimeout(snapTimer); suppressClick = false;
  });
  viewport.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== dragging.id) return;
    const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
    if (!dragging.moved && Math.hypot(dx, dy) < 8) return;
    if (!dragging.moved) { viewport.setPointerCapture(event.pointerId); dragging.moved = true; suppressClick = true; preview.stop(); viewport.classList.add('is-dragging'); }
    const now = performance.now();
    dragging.speed = (dragging.lastX - event.clientX) / Math.max(8, now - dragging.lastTime);
    dragging.lastX = event.clientX; dragging.lastTime = now;
    go(dragging.start + (-dx + dy * .45) * STEP / stepX);
  });
  function release(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    const state = dragging; dragging = null;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (state.moved) {
      const momentum = reduce.matches ? 0 : Math.max(-STEP * .65, Math.min(STEP * .65, state.speed * 90));
      go(Math.round((target + momentum) / STEP) * STEP);
      setTimeout(() => { suppressClick = false; }, 0);
    }
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  scene.addEventListener('focusin', event => {
    const card = event.target.closest('.archive-card');
    if (card && event.target.matches(':focus-visible') && card.dataset.slug !== main.dataset.carouselSlug) jump(card.dataset.slug);
  });
  main.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable=true]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); navigate(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); navigate(-1); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); jump(selected[event.key === 'Home' ? 0 : selected.length - 1].dataset.slug); }
  });
  scene.addEventListener('click', save);
  window.addEventListener('resize', () => { preview.stop(); if (desktop.matches) measure(); else cancelMotion(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    cancelMotion(); preview.stop();
    if (!document.hidden && desktop.matches) { position = target; draw(); }
  });
  window.addEventListener('pagehide', () => { save(); departed = true; cancelMotion(); preview.stop(); });
  window.addEventListener('pageshow', () => { departed = false; position = target; draw(); });
  reduce.addEventListener('change', () => { cancelMotion(); go(Math.round(target / STEP) * STEP, { immediate: true }); });
  await waitForImages(scene);
  initLaunchPanel({ main, getPosition: () => target, advance: value => go(value, { automatic: true }), getCurrent: currentCard });
}
