const modulo = (value, count) => ((value % count) + count) % count;
const controls = "button, a[href]";
const rowControls = (row) => [...row.querySelectorAll(controls)].filter((control) => !control.closest("[hidden]"));

/** Local editorial loop; Archivo's native-scroll compensation and springs stay shared. */
export function createEditorialLoop({ main, motion, physics }) {
  const templates = [...main.querySelectorAll(":scope > [data-editorial-part]")];
  const slug = document.body.dataset.projectSlug;
  const storageKey = `portfolio.editorial.${slug}.v2`;
  const catalogue = templates.map((part) => part.dataset.editorialPart).join("|");
  const keys = templates.map((template) => template.dataset.editorialPart);
  const heading = main.querySelector(":scope > h1");
  const stream = document.createElement("div");
  stream.className = "editorial-loop-stream";
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
    bank.className = "project-editorial editorial-loop-measure";
    bank.style.setProperty("--editorial-measure-width", `${main.clientWidth}px`);
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
    const origins = [];
    const extent = [];
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      const wide = templates[index].hasAttribute("data-editorial-wide");
      let y = index ? origins[index - 1] + extent[index - 1].advance : 0;
      if (index) {
        // Full-width pieces and the restart clear both columns; regular pieces clear their own.
        const precedingWide = templates[index - 1].hasAttribute("data-editorial-wide");
        if (wide) y = Math.max(y, ...origins.map((origin, n) => origin + rects[n].height + (keys[index] === "restart" ? 128 : 80)));
        else if (precedingWide) y = Math.max(y, origins[index - 1] + rects[index - 1].height + 96);
        else for (let n = 0; n < index; n++) {
          if (n % 2 === index % 2 || templates[n].hasAttribute("data-editorial-wide")) y = Math.max(y, origins[n] + rects[n].height + 80);
        }
      }
      origins.push(y);
      const visual = block.querySelector("[data-editorial-visual]");
      let advance = visual ? visual.getBoundingClientRect().height + (index === 0 ? 140 : 40) : rects[index].height + 128;
      if (main.hasAttribute("data-editorial-model") && index < blocks.length - 1) advance = rects[index + 1].top - rects[index].top;
      extent.push({ advance: Math.max(140, advance), height: rects[index].height });
    }
    metrics = extent.map((item, index) => ({ ...item, advance: index < extent.length - 1 ? origins[index + 1] - origins[index] : item.advance }));
    const refs = bank.querySelector(".editorial-references");
    let clearance = 80;
    if (refs) {
      const ref = refs.getBoundingClientRect();
      const own = blocks.findIndex((block) => block.contains(refs));
      const refTop = origins[own] + ref.top - rects[own].top;
      const refBottom = refTop + ref.height;
      rects.forEach((rect, index) => {
        if (index === own || rect.left >= ref.right || rect.right <= ref.left) return;
        const end = origins[index] + rect.height;
        const gap = end <= refTop ? refTop - end : origins[index] >= refBottom ? origins[index] - refBottom : 0;
        clearance = Math.min(clearance, gap);
      });
    }
    main.style.setProperty("--editorial-drift-limit", `${Math.max(0, Math.min(32, (clearance - 16) / 2))}px`);
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
      row.querySelectorAll(controls).forEach((button) => { button.tabIndex = primary && !button.closest("[hidden]") ? 0 : -1; });
    });
    accessibilityY = scrollY;
  }

  function transferFocus(row) {
    if (!row.contains(document.activeElement)) return;
    const index = rowControls(row).indexOf(document.activeElement);
    const kind = row.firstElementChild.dataset.kind;
    const alternatives = rows.filter((other) => other !== row && other.firstElementChild.dataset.kind === kind);
    alternatives.sort((a, b) => Math.abs(top + a.offsetTop - scrollY) - Math.abs(top + b.offsetTop - scrollY));
    const target = alternatives[0] && rowControls(alternatives[0])[index];
    if (target) {
      alternatives[0].removeAttribute("aria-hidden");
      target.tabIndex = 0;
      target.focus({ preventScroll: true });
    } else main.focus({ preventScroll: true });
  }

  function makeRow(sequence, reusable) {
    const row = reusable || document.createElement("div");
    row.className = "editorial-loop-row";
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
      copy.classList.add("editorial-motion");
      if (key !== "restart") copy.classList.add("archive-card__link");
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
    const wide = templates[index].hasAttribute("data-editorial-wide");
    card.className = `editorial-loop-card${wide ? " editorial-loop-card--wide" : index % 2 ? " editorial-loop-card--right" : ""}`;
    card.dataset.kind = key;
    card.dataset.slug = `${slug}-${key}`;
    row.style.setProperty("--editorial-advance", `${metrics[index].advance}px`);
    row.replaceChildren(card);
    return row;
  }

  function render(next) {
    working = true;
    physics.reset();
    const focusedRow = document.activeElement.closest?.(".editorial-loop-row");
    const focus = focusedRow ? { sequence: Number(focusedRow.dataset.sequence), index: rowControls(focusedRow).indexOf(document.activeElement) } : null;
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
      rowControls(target || stream)[focus.index]?.focus({ preventScroll: true });
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
    try { sessionStorage.setItem(storageKey, JSON.stringify({ catalogue, ...position })); } catch { /* Storage is optional. */ }
  }

  function start() {
    if (started) return;
    measure();
    main.classList.add("project-editorial--loop");
    main.replaceChildren(heading, stream);
    let previous;
    try { previous = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Begin at the opening. */ }
    if (previous?.catalogue !== catalogue || !Number.isSafeInteger(previous?.sequence) || !Number.isFinite(previous?.fraction) || Math.abs(previous.fraction) > 4) previous = null;
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
