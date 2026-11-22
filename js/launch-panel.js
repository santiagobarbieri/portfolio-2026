/** Idle motion belongs only to the home stream; manual navigation always wins. */
export function initLaunchPanel({ main, layout, advance }) {
  const body = document.body;
  if (!body.classList.contains('archive-page--launch')) return;
  const panel = document.querySelector('#portfolio-command-panel');
  const toggle = document.querySelector('[data-launch-toggle]');
  const playback = document.querySelector('[data-launch-playback]');
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
  let folding = false;
  let currentFrame = 0;
  try { paused = sessionStorage.getItem('portfolio-idle-paused') === 'true'; } catch {}

  function blocked() {
    return departed || folding || paused || reduce.matches || !desktop.matches || document.hidden ||
      Boolean(document.querySelector('.site-loader:not([hidden]), dialog[open]')) ||
      main.contains(document.activeElement) || Boolean(main.querySelector('.archive-card__link:hover'));
  }
  function setText(element, text) { if (element.textContent !== text) element.textContent = text; }
  function label(running = false) {
    play.disabled = reduce.matches;
    play.setAttribute('aria-pressed', String(paused));
    setText(play, reduce.matches ? 'Recorrido manual' : paused ? 'Activar recorrido' : 'Pausar recorrido');
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
  body.classList.add("launch-ready");
  toggle.hidden = false;
  playback.hidden = false;
  toggle.addEventListener('click', async () => {
    if (folding) return;
    activity();
    const folded = !body.classList.contains('launch-folded');
    const update = () => layout(() => {
      body.classList.toggle('launch-folded', folded);
      panel.inert = folded;
      toggle.setAttribute('aria-expanded', String(!folded));
      const text = folded ? 'Expandir panel' : 'Reducir panel';
      toggle.setAttribute('aria-label', text);
      toggle.dataset.cursorAction = text;
      toggle.querySelector('.launch-toggle__label').textContent = text;
    });
    folding = true;
    toggle.disabled = true;
    try {
      if (document.startViewTransition && !reduce.matches && !document.hidden) {
        document.documentElement.classList.add('launch-changing');
        const transition = document.startViewTransition(update);
        await transition.finished.catch(() => {});
      } else update();
      sessionStorage.setItem('portfolio-launch-folded', String(folded));
    } catch { /* A denied session store does not prevent changing the panel. */ }
    finally {
      document.documentElement.classList.remove('launch-changing');
      folding = false;
      toggle.disabled = false;
      activity();
    }
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
  try {
    if (sessionStorage.getItem('portfolio-launch-folded') === 'true') {
      layout(() => { body.classList.add('launch-folded'); panel.inert = true; });
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Expandir panel');
      toggle.dataset.cursorAction = 'Expandir panel';
      toggle.querySelector('.launch-toggle__label').textContent = 'Expandir panel';
    }
  } catch {}

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
      const link = best.querySelector('.archive-card__link');
      const title = best.querySelector('.archive-card__title').textContent;
      if (current.textContent !== title) { current.textContent = title; current.href = link.href; }
    }
  }
  function observeCurrent() { if (!currentFrame && !document.hidden && !departed) currentFrame = requestAnimationFrame(updateCurrent); }
  window.addEventListener('scroll', observeCurrent, { passive: true });
  window.addEventListener('resize', observeCurrent, { passive: true });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(currentFrame); currentFrame = 0; });
  observeCurrent();
  activity();
}
