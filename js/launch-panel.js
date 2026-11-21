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
  try { paused = sessionStorage.getItem('portfolio-idle-paused') === 'true'; } catch {}

  function blocked() {
    return departed || paused || reduce.matches || !desktop.matches || document.hidden ||
      Boolean(document.querySelector('.site-loader:not([hidden]), dialog[open]')) ||
      main.contains(document.activeElement) || Boolean(main.querySelector('.archive-card__link:hover'));
  }
  function label(running = false) {
    play.disabled = reduce.matches;
    play.setAttribute('aria-pressed', String(paused));
    play.textContent = reduce.matches ? 'Recorrido manual' : paused ? 'Activar recorrido' : 'Pausar recorrido';
    play.dataset.cursorAction = paused ? 'Activar recorrido' : 'Pausar recorrido';
    status.textContent = reduce.matches ? 'Movimiento reducido activado.' : paused ? 'Recorrido automático en pausa.' : running ? 'Recorrido automático · interactuá para detenerlo.' : 'Automático tras 5 segundos sin interacción.';
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
  toggle.addEventListener('click', () => {
    activity();
    const folded = !body.classList.contains('launch-folded');
    layout(() => {
      body.classList.toggle('launch-folded', folded);
      panel.inert = folded;
      toggle.setAttribute('aria-expanded', String(!folded));
      const text = folded ? 'Expandir panel' : 'Plegar panel';
      toggle.setAttribute('aria-label', text);
      toggle.dataset.cursorAction = text;
    });
    try { sessionStorage.setItem('portfolio-launch-folded', String(folded)); } catch {}
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
  reduce.addEventListener('change', activity);
  desktop.addEventListener('change', activity);
  try {
    if (sessionStorage.getItem('portfolio-launch-folded') === 'true') toggle.click();
  } catch {}
  activity();
}
