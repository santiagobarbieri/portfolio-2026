/** Idle motion belongs only to the home stream; manual navigation always wins. */
export function initLaunchPanel({ main, advance }) {
  const body = document.body;
  if (!body.classList.contains('archive-page--launch')) return;
  const panel = document.querySelector('#portfolio-command-panel');
  const utilities = document.querySelector('[data-launch-utilities]');
  const menus = [...utilities.querySelectorAll('[data-launch-menu]')];
  const playLabel = document.querySelector('[data-launch-play-label]');
  const play = document.querySelector('[data-launch-play]');
  const status = document.querySelector('[data-launch-status]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  let paused = false;
  let timer = 0;
  let frame = 0;
  let previous = 0;
  let remainder = 0;
  let lastActivity = performance.now();
  let departed = false;
  let currentFrame = 0;
  try { paused = sessionStorage.getItem('portfolio-idle-paused') === 'true'; } catch {}

  function blocked() {
    return departed || paused || reduce.matches || !desktop.matches || document.hidden ||
      Boolean(document.querySelector('.site-loader:not([hidden]), dialog[open]')) ||
      menus.some(menu => menu.open) || utilities.contains(document.activeElement) ||
      main.contains(document.activeElement) || Boolean(main.querySelector('.archive-card__link:hover'));
  }
  function setText(element, text) { if (element.textContent !== text) element.textContent = text; }
  function label(running = false) {
    play.disabled = reduce.matches;
    play.dataset.paused = String(paused);
    const action = reduce.matches ? 'Recorrido manual' : paused ? 'Activar recorrido' : 'Pausar recorrido';
    setText(playLabel, action);
    play.setAttribute('aria-label', action);
    play.querySelector('path').setAttribute('d', paused ? 'M8 5l11 7-11 7Z' : 'M9 5v14M15 5v14');
    play.dataset.cursorAction = paused ? 'Activar recorrido' : 'Pausar recorrido';
    setText(status, reduce.matches ? 'Movimiento reducido activado.' : paused ? 'Recorrido automático en pausa.' : running ? 'Los proyectos siguen. Interactuá para detenerlos.' : 'Recorré los proyectos o dejalos pasar.');
  }
  function stop() {
    clearTimeout(timer); timer = 0;
    cancelAnimationFrame(frame); frame = 0; previous = 0; remainder = 0;
  }
  function tick(time) {
    frame = 0;
    if (blocked()) { stop(); label(); return; }
    if (previous) remainder += Math.min(time - previous, 40) * .022;
    previous = time;
    const distance = Math.floor(remainder);
    if (distance) { remainder -= distance; advance(scrollY + distance); }
    frame = requestAnimationFrame(tick);
  }
  function start() {
    timer = 0;
    if (document.querySelector('.site-loader:not([hidden])')) { timer = setTimeout(start, 500); return; }
    if (blocked()) { label(); return; }
    label(true);
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    stop(); label();
    if (!paused && !reduce.matches && desktop.matches && !document.hidden && !departed) {
      timer = setTimeout(start, Math.max(0, 5000 - (performance.now() - lastActivity)));
    }
  }
  function activity() { lastActivity = performance.now(); schedule(); }
  body.classList.add('launch-ready');
  play.hidden = false;
  try { sessionStorage.removeItem('portfolio-launch-folded'); } catch {}
  menus.forEach(menu => {
    menu.addEventListener('toggle', () => {
      if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
      activity();
    });
  });
  function closeMenus(focus = false) {
    if (!menus.some(menu => menu.open)) return;
    menus.forEach(menu => {
      if (!menu.open) return;
      menu.open = false;
      if (focus) menu.querySelector('summary').focus({ preventScroll: true });
    });
    activity();
  }
  utilities.addEventListener('focusin', activity);
  utilities.addEventListener('focusout', activity);
  document.addEventListener('pointerdown', event => {
    if (!utilities.contains(event.target)) closeMenus();
  }, { passive: true });
  utilities.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeMenus(true); }
  });
  play.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('portfolio-idle-paused', String(paused)); } catch {}
    activity();
  });
  document.addEventListener('pointermove', event => {
    if (event.clientX >= main.getBoundingClientRect().left - 24 || main.contains(event.target)) activity();
  }, { passive: true });
  main.addEventListener('pointerenter', activity, { passive: true });
  main.addEventListener('pointerleave', activity, { passive: true });
  main.addEventListener('pointerdown', activity, { passive: true });
  window.addEventListener('wheel', event => {
    if (event.clientX >= main.getBoundingClientRect().left - 24) activity();
  }, { passive: true });
  main.addEventListener('touchstart', activity, { passive: true });
  main.addEventListener('focusin', activity);
  main.addEventListener('focusout', activity);
  document.addEventListener('keydown', event => {
    if (main.contains(event.target) || event.target === body) activity();
  });
  window.addEventListener('resize', activity, { passive: true });
  document.addEventListener('visibilitychange', activity);
  window.addEventListener('pagehide', () => { departed = true; stop(); });
  window.addEventListener('pageshow', () => { departed = false; activity(); });
  reduce.addEventListener('change', () => {
    if (reduce.matches) panel.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    activity();
  });
  desktop.addEventListener('change', activity);

  function reveal() {
    if (reduce.matches || !desktop.matches) return;
    const elements = [document.querySelector('.launch-identity'), ...panel.querySelectorAll('.launch-headline > span'), panel.querySelector('.launch-description'), panel.querySelector('.launch-destinations')].filter(Boolean);
    elements.forEach((element, index) => element.animate(
      [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 560, delay: Math.min(index * 55, 220), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
    ));
  }
  if (document.documentElement.hasAttribute('data-page-loading')) {
    const loaderObserver = new MutationObserver(() => {
      if (!document.documentElement.hasAttribute('data-page-loading')) { loaderObserver.disconnect(); reveal(); }
    });
    loaderObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-page-loading'] });
  } else reveal();

  const current = document.querySelector('[data-launch-current]');
  function updateCurrent() {
    currentFrame = 0;
    if (!desktop.matches || document.hidden || departed) return;
    let best = null, score = 0;
    main.querySelectorAll('.archive-card').forEach(card => {
      const rect = card.querySelector('.archive-card__media').getBoundingClientRect();
      const visible = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
      if (visible > score) { best = card; score = visible; }
    });
    if (best) {
      document.querySelectorAll('[data-launch-jump]').forEach(item => {
        if (item.dataset.launchJump === best.dataset.slug) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
      const link = best.querySelector('.archive-card__link');
      const title = best.querySelector('.archive-card__title').textContent;
      if (current.textContent !== title) { current.textContent = title; current.href = link.href; }
    }
  }
  function observeCurrent() { if (!currentFrame && !document.hidden && !departed) currentFrame = requestAnimationFrame(updateCurrent); }
  document.addEventListener('portfolio:jump', () => { activity(); observeCurrent(); });
  window.addEventListener('scroll', observeCurrent, { passive: true });
  window.addEventListener('resize', observeCurrent, { passive: true });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(currentFrame); currentFrame = 0; });
  observeCurrent();
  activity();
}
