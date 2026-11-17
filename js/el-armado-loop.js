const modulo = (value, count) => ((value % count) + count) % count;
const storageKey = "portfolio.el-armado.loop.v1";

/** Local editorial loop; Archivo's native-scroll compensation and springs stay shared. */
export function createArmadoLoop({ main, motion, physics }) {
  const templates = [...main.querySelectorAll(":scope > .armado-intro, :scope > .armado-section")];
  const keys = templates.map((template) => template.id || "intro");
  const heading = main.querySelector(":scope > h1");
  const stream = document.createElement("div");
  stream.className = "armado-loop-stream";
  const pool = new Map();
  let rows = [];
  let metrics = [];
  let top = 0;
  let height = 0;
  let width = 0;
  let working = false;
  let started = false;
  let paused = false;
  let pendingResize = false;
  let resizeFrame = 0;
  let accessibilityY = -Infinity;
  let position = null;
  const buffer = () => Math.max(900, innerHeight * 1.35);
  const rowHeight = (row) => metrics[modulo(Number(row.dataset.sequence), templates.length)].advance;
  const rowExtent = (row) => Math.max(rowHeight(row), metrics[modulo(Number(row.dataset.sequence), templates.length)].height);

  function identify(copy, suffix) {
    const ids = new Map();
    [copy, ...copy.querySelectorAll("[id]")].forEach((element) => {
      if (!element.id) return;
      const id = `${element.id}-${suffix}`;
      ids.set(element.id, id);
      element.id = id;
    });
    [copy, ...copy.querySelectorAll("[aria-labelledby], [aria-describedby]")].forEach((element) => {
      for (const attribute of ["aria-labelledby", "aria-describedby"]) {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map((id) => ids.get(id) || id).join(" "));
      }
    });
  }

  function measure() {
    const bank = document.createElement("div");
    bank.className = "armado-editorial armado-loop-measure";
    bank.style.setProperty("--armado-measure-width", `${main.clientWidth}px`);
    bank.setAttribute("aria-hidden", "true");
    bank.inert = true;
    templates.forEach((template, index) => {
      const copy = template.cloneNode(true);
      identify(copy, `measure-${index}`);
      bank.append(copy);
    });
    document.body.append(bank);
    const blocks = [...bank.children];
    const rects = blocks.map((block) => block.getBoundingClientRect());
    metrics = blocks.map((block, index) => ({
      advance: index < blocks.length - 1 ? rects[index + 1].top - rects[index].top : block.querySelector(".armado-image").offsetHeight + 64,
      height: rects[index].height,
    }));
    // References cross the gutter. Share that actual gap between both moving pieces.
    const refs = bank.querySelector(".armado-references")?.getBoundingClientRect();
    let clearance = 80;
    if (refs) rects.forEach((rect, index) => {
      if (blocks[index].contains(bank.querySelector(".armado-references")) || rect.left >= refs.right || rect.right <= refs.left) return;
      const gap = rect.bottom <= refs.top ? refs.top - rect.bottom : rect.top >= refs.bottom ? rect.top - refs.bottom : 0;
      clearance = Math.min(clearance, gap);
    });
    main.style.setProperty("--armado-drift-limit", `${Math.max(0, Math.min(32, (clearance - 16) / 2))}px`);
    bank.remove();
    width = innerWidth;
  }

  function anchor() {
    let y = top - scrollY;
    for (const row of rows) {
      const advance = rowHeight(row);
      if (y + advance > 0) return { sequence: Number(row.dataset.sequence), fraction: -y / advance };
      y += advance;
    }
    return position || { sequence: 0, fraction: 0 };
  }

  function accessibility() {
    const nearest = new Map();
    let y = top - scrollY;
    rows.forEach((row) => {
      const key = row.firstElementChild.dataset.kind;
      const candidate = { row, distance: Math.abs(y - 140), focused: row.contains(document.activeElement) };
      const previous = nearest.get(key);
      if (!previous || candidate.focused || (!previous.focused && candidate.distance < previous.distance)) nearest.set(key, candidate);
      y += rowHeight(row);
    });
    rows.forEach((row) => {
      const primary = nearest.get(row.firstElementChild.dataset.kind).row === row;
      if (primary) row.removeAttribute("aria-hidden");
      else row.setAttribute("aria-hidden", "true");
      row.querySelectorAll("button").forEach((button) => { button.tabIndex = primary ? 0 : -1; });
    });
    accessibilityY = scrollY;
  }

  function transferFocus(row) {
    if (!row.contains(document.activeElement)) return;
    const index = [...row.querySelectorAll("button")].indexOf(document.activeElement);
    const kind = row.firstElementChild.dataset.kind;
    const alternatives = rows.filter((other) => other !== row && other.firstElementChild.dataset.kind === kind);
    alternatives.sort((a, b) => Math.abs(top + a.offsetTop - scrollY) - Math.abs(top + b.offsetTop - scrollY));
    const target = alternatives[0]?.querySelectorAll("button")[index];
    if (target) {
      alternatives[0].removeAttribute("aria-hidden");
      target.tabIndex = 0;
      target.focus({ preventScroll: true });
    } else main.focus({ preventScroll: true });
  }

  function makeRow(sequence, reusable) {
    const row = reusable || document.createElement("div");
    row.className = "armado-loop-row";
    row.dataset.sequence = sequence;
    const index = modulo(sequence, templates.length);
    const key = keys[index];
    let card = row.firstElementChild;
    if (card) {
      physics.forget(card.querySelector(".archive-card__link"));
      const available = pool.get(card.dataset.kind) || [];
      available.push(card);
      pool.set(card.dataset.kind, available);
    }
    card = pool.get(key)?.pop();
    if (!card) {
      card = document.createElement("div");
      const copy = templates[index].cloneNode(true);
      copy.classList.add("archive-card__link", "armado-motion");
      card.append(copy);
    }
    // Regenerate IDs from the source, including when a pooled occurrence changes number.
    const copy = card.firstElementChild;
    [copy, ...copy.querySelectorAll("[id]")].forEach((element) => {
      if (element.id) element.id = element.dataset.originalId || (element.dataset.originalId = element.id);
    });
    [copy, ...copy.querySelectorAll("[aria-labelledby], [aria-describedby]")].forEach((element) => {
      for (const attribute of ["aria-labelledby", "aria-describedby"]) if (element.hasAttribute(attribute)) {
        const data = attribute === "aria-labelledby" ? "originalLabelledby" : "originalDescribedby";
        element.setAttribute(attribute, element.dataset[data] || (element.dataset[data] = element.getAttribute(attribute)));
      }
    });
    identify(copy, `loop-${sequence < 0 ? "m" + -sequence : sequence}`);
    card.className = `armado-loop-card${modulo(sequence, 2) ? " armado-loop-card--right" : ""}`;
    card.dataset.kind = key;
    card.dataset.slug = `el-armado-${key}`;
    row.style.setProperty("--armado-advance", `${metrics[index].advance}px`);
    row.replaceChildren(card);
    return row;
  }

  function render(next) {
    working = true;
    physics.reset();
    const focusedRow = document.activeElement.closest?.(".armado-loop-row");
    const focus = focusedRow ? { sequence: Number(focusedRow.dataset.sequence), index: [...focusedRow.querySelectorAll("button")].indexOf(document.activeElement) } : null;
    rows.forEach((row) => {
      const card = row.firstElementChild;
      const available = pool.get(card.dataset.kind) || [];
      available.push(card);
      pool.set(card.dataset.kind, available);
    });
    rows = [];
    stream.replaceChildren();
    const sequence = Number.isSafeInteger(next?.sequence) ? next.sequence : 0;
    const offset = next ? next.fraction * metrics[modulo(sequence, templates.length)].advance : -main.getBoundingClientRect().top - scrollY;
    const center = makeRow(sequence);
    rows.push(center);
    stream.append(center);
    for (let i = 1; i < templates.length; i++) {
      const row = makeRow(sequence + i);
      stream.append(row); rows.push(row);
    }
    let before = 0;
    while (before < buffer() + Math.max(0, offset)) {
      const row = makeRow(Number(rows[0].dataset.sequence) - 1);
      stream.prepend(row); rows.unshift(row); before += rowHeight(row);
    }
    let ahead = rows.slice(rows.indexOf(center)).reduce((sum, row) => sum + rowHeight(row), 0);
    while (ahead < innerHeight + buffer() + Math.max(0, offset)) {
      const row = makeRow(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(row); rows.push(row); ahead += rowHeight(row);
    }
    top = main.getBoundingClientRect().top + scrollY;
    height = rows.reduce((sum, row) => sum + rowHeight(row), 0);
    motion.resize();
    motion.scrollTo(top + center.offsetTop + offset, { immediate: true });
    if (focus) {
      const target = rows.find((row) => Number(row.dataset.sequence) === focus.sequence) || rows.find((row) => row.firstElementChild.dataset.kind === keys[modulo(focus.sequence, keys.length)]);
      target?.querySelectorAll("button")[focus.index]?.focus({ preventScroll: true });
    }
    physics.setRows(rows, top);
    accessibility();
    position = anchor();
    working = false;
  }

  function recycle() {
    if (!started || paused || working || innerWidth <= 900) return;
    working = true;
    let changed = false;
    let compensation = 0;
    let guard = 0;
    while (rows.length > templates.length && top + rowExtent(rows[0]) < scrollY + compensation - buffer() && guard++ < 160) {
      const first = rows.shift();
      const previousHeight = rowHeight(first);
      transferFocus(first);
      first.remove();
      const row = makeRow(Number(rows.at(-1).dataset.sequence) + 1, first);
      stream.append(row); rows.push(row);
      height += rowHeight(row) - previousHeight;
      compensation -= previousHeight;
      changed = true;
    }
    guard = 0;
    while (top > scrollY + compensation - buffer() && guard++ < 160) {
      const last = rows.at(-1);
      const lastTop = top + height - rowHeight(last);
      const reuse = rows.length > templates.length + 1 && lastTop > scrollY + compensation + innerHeight + buffer();
      const row = reuse ? rows.pop() : null;
      if (row) { transferFocus(row); height -= rowHeight(row); row.remove(); }
      const previous = makeRow(Number(rows[0].dataset.sequence) - 1, row);
      stream.prepend(previous); rows.unshift(previous);
      const advance = rowHeight(previous);
      height += advance; compensation += advance; changed = true;
    }
    guard = 0;
    while (top + height < scrollY + compensation + innerHeight + buffer() && guard++ < 160) {
      const row = makeRow(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(row); rows.push(row); height += rowHeight(row); changed = true;
    }
    if (changed) { motion.rebase(compensation); physics.setRows(rows, top); }
    if (changed || Math.abs(scrollY - accessibilityY) > 100) accessibility();
    position = anchor();
    working = false;
  }

  function resize() {
    if (!started) return;
    if (paused || innerWidth <= 900) { pendingResize = true; return; }
    if (width !== innerWidth || pendingResize) {
      const previous = position;
      measure(); render(previous);
      pendingResize = false;
    } else { motion.resize(); physics.setRows(rows, top); recycle(); }
  }

  function save() {
    if (!started) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify(position)); } catch { /* Storage is optional. */ }
  }

  function start() {
    if (started) return;
    measure();
    main.classList.add("armado-editorial--loop");
    main.replaceChildren(heading, stream);
    let previous;
    try { previous = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Begin at the opening. */ }
    if (!Number.isSafeInteger(previous?.sequence) || !Number.isFinite(previous?.fraction) || Math.abs(previous.fraction) > 4) previous = null;
    render(previous);
    started = true;
    stream.addEventListener("focusin", accessibility);
  }

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }, { passive: true });
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", (event) => { if (event.persisted) resize(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
  return {
    start, recycle,
    pause() { paused = true; physics.reset(); },
    resume() { paused = false; resize(); recycle(); },
    get paused() { return paused; },
  };
}
