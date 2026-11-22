const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => value * value * (3 - 2 * value);

/** Each tab belongs to its full-width sheet, from the bottom preview to the final pile. */
export function createFolderStack({ stage, chapters, motion, isZoomOpen = () => false, onChange = () => {} }) {
  const sheet = stage.parentElement;
  const intro = chapters[0];
  const collapseButton = document.querySelector("[data-folder-collapse]");
  let records = [];
  let enabled = false;
  let measured = false;
  let order = [];
  let selected = null;
  let expanded = false;
  let active = 0;
  let rail = 0;
  let start = 0;
  let total = 0;
  let openingTimer;
  let touchY = null;
  const cap = 30;
  const step = 12;

  function enable() {
    if (enabled) return;
    enabled = true;
    if (!records.length) records = chapters.slice(1).map((section, index) => {
      const original = [...section.children];
      const card = document.createElement("div");
      card.className = "project-folder";
      if (section.querySelector('[data-sheet-art="palette"]')) card.classList.add("project-folder--palette");
      const tab = document.createElement("button");
      tab.className = "project-folder__tab";
      tab.type = "button";
      tab.dataset.folderIndex = index;
      tab.title = section.dataset.sectionName;
      tab.setAttribute("aria-label", `Mostrar ${section.dataset.sectionName}`);
      tab.dataset.cursorAction = `Mostrar ${section.dataset.sectionName}`;
      const label = document.createElement("span");
      label.className = "project-folder__label";
      label.textContent = section.dataset.sectionName;
      tab.append(label);
      const outline = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      outline.classList.add("project-folder__shape");
      outline.setAttribute("aria-hidden", "true");
      outline.setAttribute("focusable", "false");
      outline.setAttribute("preserveAspectRatio", "none");
      const edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
      edge.setAttribute("vector-effect", "non-scaling-stroke");
      outline.append(edge);
      const viewport = document.createElement("div");
      viewport.className = "project-folder__window";
      const content = document.createElement("div");
      content.className = "project-folder__content";
      viewport.append(content);
      card.append(outline, tab, viewport);
      tab.addEventListener("click", () => select(index));
      return { section, original, card, tab, label, outline, edge, viewport, content, from: 0, duration: 0, peek: 0, reveal: 0 };
    });
    order = records.map((_, index) => index);
    selected = null;
    for (const record of records) {
      record.content.append(...record.original);
      record.section.replaceChildren(record.card);
    }
    document.body.classList.add("project-folders-ready");
  }

  function disable() {
    if (!enabled) return;
    enabled = measured = false;
    selected = null;
    setExpanded(false);
    finishOpening();
    touchY = null;
    intro.inert = false;
    document.body.classList.remove("project-folders-ready");
    sheet.style.removeProperty("--folder-scroll-height");
    stage.style.removeProperty("--folder-height");
    stage.style.removeProperty("--folder-stack-clearance");
    stage.style.removeProperty("--folder-hero-limit");
    stage.style.removeProperty("--folder-bottom-gap");
    for (const record of records) {
      record.content.inert = false;
      record.section.replaceChildren(...record.original);
      record.section.style.removeProperty("--folder-order");
    }
  }

  function fitBoard(record) {
    const references = record.content.querySelector(".folder-references");
    if (references) {
      const bottom = record.content.getBoundingClientRect().bottom - parseFloat(getComputedStyle(record.content).paddingBottom);
      const available = bottom - references.getBoundingClientRect().top;
      references.style.setProperty("--reference-height", `${Math.max(32, Math.min(148, available))}px`);
    }
    const palette = record.content.querySelector(".folder-palette");
    if (palette) {
      const list = palette.querySelector("ul");
      const count = list.children.length;
      palette.style.setProperty("--swatch-count", count);
      const labelHeight = Math.max(...[...list.children].map((item) => item.lastElementChild.offsetHeight));
      const gap = parseFloat(getComputedStyle(list).columnGap) || 10;
      palette.style.setProperty("--swatch-size", `${Math.max(12, Math.min(128, (list.clientWidth - (count - 1) * gap) / count, list.clientHeight - labelHeight - 12))}px`);
      return;
    }
    const board = record.content.querySelector(".folder-board");
    if (!board || board.matches("[data-multimedia]")) return;
    const grid = board.querySelector(".folder-board__grid");
    const pieces = [...grid.children];
    const width = grid.clientWidth;
    const height = grid.clientHeight;
    const gap = innerHeight < 500 ? 6 : innerWidth < 768 ? 10 : 20;
    const maxColumns = board.dataset.boardKind === "photos" ? 3 : Math.min(8, pieces.length);
    const metrics = pieces.map((piece) => {
      const img = piece.querySelector("img");
      return { ratio: (img.naturalWidth || Number(img.getAttribute("width"))) / (img.naturalHeight || Number(img.getAttribute("height"))), limit: parseFloat(getComputedStyle(piece).getPropertyValue("--piece-limit")) || 440, caption: piece.querySelector("figcaption").offsetHeight, weight: piece.dataset.pieceRole === "primary" ? 1.3 : 1 };
    });
    let best = { score: -1, columns: 1, rows: pieces.length };
    for (let columns = 1; columns <= maxColumns; columns++) {
      const rows = Math.ceil(pieces.length / columns);
      const cellWidth = (width - (columns - 1) * gap) / columns;
      const cellHeight = (height - (rows - 1) * gap) / rows;
      if (cellWidth < 24 || cellHeight < 16) continue;
      const score = metrics.reduce((sum, m) => {
        const w = Math.max(0, Math.min(cellWidth, m.limit, (cellHeight - m.caption - 6) * m.ratio));
        return sum + w * w / m.ratio * m.weight;
      }, 0);
      if (score > best.score) best = { score, columns, rows };
    }
    grid.style.setProperty("--board-cols", best.columns);
    grid.style.setProperty("--board-rows", best.rows);
    grid.style.setProperty("--board-gap", `${gap}px`);
  }

  function measure(preserve = true) {
    if (!enabled) return;
    const previous = measured ? Math.max(0, scrollY - start) : 0;
    const old = measured ? [...records].reverse().find((record) => previous >= record.from) : null;
    const offset = old ? previous - old.from : 0;
    const entering = old ? clamp(offset / old.duration) : 0;
    const header = document.querySelector(".armado-shell, .club-shell, .case-shell");
    const height = stage.clientHeight;
    rail = Math.max(height < 500 ? 60 : 76, header.getBoundingClientRect().bottom + 6);
    const width = stage.clientWidth;
    const panelHeight = Math.max(140, height - rail - (records.length - 1) * step);
    const safeBottom = parseFloat(getComputedStyle(stage).getPropertyValue("--folder-safe-bottom")) || 0;
    const reserve = Math.max(Math.min(210, height * .21), (records.length - 1) * step + 44 + safeBottom + 24);
    const peek = Math.max(rail + 56, height - reserve);
    stage.style.setProperty("--folder-height", `${panelHeight}px`);
    stage.style.setProperty("--folder-stack-clearance", `${(records.length - 1) * step + 4}px`);
    stage.style.setProperty("--folder-hero-limit", `${peek}px`);
    // Keep the last row above the next parked sheet, with an extra clear strip.
    stage.style.setProperty("--folder-bottom-gap", `${Math.max(80, reserve - records.length * step + 10)}px`);
    const left = width < 640 ? 8 : Math.min(64, width * .0423);
    const slant = width < 640 ? 16 : 28;
    const slot = Math.min(150, (width - left * 2 - slant) / records.length);
    let cursor = 0;
    records.forEach((record, index) => {
      record.card.style.setProperty("--folder-tab-x", `${left + index * slot}px`);
      record.card.style.setProperty("--folder-tab-width", `${slot + slant}px`);
      record.card.style.setProperty("--folder-slant", `${slant}px`);
      const x = left + index * slot;
      const end = x + slot + slant;
      const shoulder = end - slant;
      record.outline.setAttribute("viewBox", `0 0 ${width} ${panelHeight}`);
      record.edge.setAttribute("d", `M 0 ${cap + .5} H ${x} V 6.5 Q ${x} .5 ${x + 6} .5 H ${shoulder - 3} Q ${shoulder + 1} .5 ${shoulder + 4} 4.5 L ${end - 7} ${cap - 4.5} Q ${end - 3} ${cap + .5} ${end + 3} ${cap + .5} H ${width} V ${panelHeight} H 0 Z`);
      record.peek = peek + index * step;
      record.from = cursor;
      record.duration = Math.max(250, height * .82);
      record.windowTop = record.viewport.offsetTop;
      record.contentHeight = record.content.offsetHeight;
      record.padding = parseFloat(getComputedStyle(record.content).paddingTop);
      fitBoard(record);
      const font = width < 640 ? 11 : 13;
      record.tab.style.fontSize = `${font}px`;
      const available = slot - (width < 640 ? 12 : 20);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = getComputedStyle(record.tab).font;
      const desired = context.measureText(record.label.textContent).width;
      if (width < 640) record.tab.style.fontSize = `${Math.max(9, Math.min(font, font * available / Math.max(1, desired)))}px`;
      cursor += record.duration;
    });
    total = cursor;
    sheet.style.setProperty("--folder-scroll-height", `${height + total}px`);
    start = sheet.getBoundingClientRect().top + scrollY;
    motion.resize();
    if (old && preserve && selected === null) {
      const position = entering * old.duration;
      motion.scrollTo(start + old.from + position, { immediate: true });
    }
    measured = true;
    paint();
  }

  function paint() {
    if (!enabled || !measured) return 0;
    const y = clamp(scrollY - start, 0, total);
    if (!expanded && total > 0 && y >= total - .5) {
      selected = records.length - 1;
      setExpanded(true);
    }
    // A completed pile remains open; only the explicit collapse action resets it.
    const manual = selected !== null;
    let current = -1;
    records.forEach((record, index) => {
      if (y >= record.from + record.duration * .52) current = index;
    });
    const front = manual ? selected : current;
    stage.dataset.folderManual = String(manual);
    const poses = records.map((record, index) => {
      const rank = manual ? order.indexOf(index) : index;
      const progress = manual ? 1 : ease(clamp((y - record.from) / record.duration));
      return { rank, progress, top: record.peek + (rail + rank * step - record.peek) * progress };
    });
    const height = stage.clientHeight;
    const hero = intro.querySelector(".project-opening__composition, [class$='intro__composition']");
    const heroTop = hero.getBoundingClientRect().top;
    intro.inert = Math.min(...poses.map((pose) => pose.top + cap)) <= heroTop;
    records.forEach((record, index) => {
      const { rank, progress, top } = poses[index];
      record.section.style.setProperty("--folder-order", rank + 1);
      record.card.style.setProperty("--folder-y", `${top.toFixed(2)}px`);
      record.card.dataset.front = String(index === front);
      record.card.dataset.preview = String(!manual && progress < .03);
      record.card.dataset.stacked = String(manual ? index !== front : index < current);
      // The board stays complete. Only its sheet enters/leaves the viewport.
      const reveal = manual ? 0 : Math.max(0, height - record.peek - record.windowTop + 4) * (1 - progress);
      if (!manual && !stage.classList.contains("project-folders-collapsing")) record.card.classList.remove("project-folder--entering");
      record.content.style.setProperty("--folder-shift", `${reveal.toFixed(2)}px`);
      record.reveal = reveal;
      const cover = Math.min(height, ...poses.filter((other) => other.rank > rank).map((other) => other.top + cap));
      const contentTop = top + record.windowTop + record.padding + reveal;
      const contentBottom = top + record.windowTop + record.contentHeight + reveal;
      record.content.inert = contentTop >= cover || contentBottom <= Math.max(0, top + record.windowTop);
      record.tab.setAttribute("aria-pressed", String(index === front));
    });
    active = front + 1;
    return active;
  }

  function finishOpening() {
    clearTimeout(openingTimer);
    stage.classList.remove("project-folders-opening", "project-folders-collapsing");
    records.forEach((record) => record.card.style.removeProperty("--folder-open-delay"));
  }

  function setExpanded(value) {
    expanded = value;
    document.body.classList.toggle("project-folders-expanded", value);
    if (collapseButton) collapseButton.hidden = !value;
    if (value) motion.stop();
    else if (!isZoomOpen()) motion.start();
  }

  function collapse() {
    if (!enabled || !measured || !expanded || isZoomOpen()) return;
    finishOpening();
    order = records.map((_, index) => index);
    selected = null;
    records.forEach((record, index) => {
      record.card.classList.add("project-folder--entering");
      record.card.style.setProperty("--folder-open-delay", `${(records.length - 1 - index) * 65}ms`);
    });
    stage.classList.add("project-folders-collapsing");
    setExpanded(false);
    motion.scrollTo(start, { immediate: true });
    paint();
    onChange(0);
    records[0].tab.focus({ preventScroll: true });
    openingTimer = setTimeout(finishOpening, 420 + (records.length - 1) * 65);
  }

  collapseButton?.addEventListener("click", collapse);

  function select(index) {
    if (!enabled || !measured || isZoomOpen()) return;
    if (selected === index) return;
    if (selected === null && active === index + 1 && scrollY - start >= records[index].from + records[index].duration) return;
    const openingAll = selected === null && scrollY - start < records[0].duration * .12;
    finishOpening();
    records.forEach((record) => {
      record.card.classList.toggle("project-folder--entering", record.reveal > 0);
    });
    const slot = order.indexOf(index);
    [order[slot], order[order.length - 1]] = [order[order.length - 1], order[slot]];
    if (openingAll) {
      stage.classList.add("project-folders-opening");
      records.forEach((record, i) => record.card.style.setProperty("--folder-open-delay", `${order.indexOf(i) * 65}ms`));
      openingTimer = setTimeout(finishOpening, 420 + (records.length - 1) * 65);
    }
    selected = index;
    motion.scrollTo(scrollY, { immediate: true });
    setExpanded(true);
    paint();
    onChange(index + 1);
  }

  stage.addEventListener("wheel", (event) => {
    if (!expanded || isZoomOpen() || !event.deltaY || event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
  }, { passive: false });

  stage.addEventListener("touchstart", (event) => {
    touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
  }, { passive: true });
  stage.addEventListener("touchmove", (event) => {
    if (!expanded || isZoomOpen() || touchY === null || event.touches.length !== 1) return;
    if (event.touches[0].clientY !== touchY) event.preventDefault();
  }, { passive: false });
  for (const name of ["touchend", "touchcancel"]) stage.addEventListener(name, () => { touchY = null; }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (!expanded || isZoomOpen() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.target.closest("input, textarea, select, [contenteditable=true]")) return;
    if (event.key === " " && event.target.closest("button")) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) event.preventDefault();
  });

  function goTo(index, immediate = false) {
    if (!enabled || !measured) return;
    if (expanded) { if (index > 0) select(index - 1); return; }
    finishOpening();
    selected = null;
    const record = records[index - 1];
    motion.scrollTo(index === 0 ? start : start + record.from + record.duration, { immediate });
    if (immediate) paint();
  }

  stage.addEventListener("focusin", (event) => {
    if (!enabled || !measured || isZoomOpen() || !event.target.matches(":focus-visible")) return;
    const index = records.findIndex((record) => record.content.contains(event.target));
    if (index < 0) return;
    if (selected !== index) select(index);
  });
  return { enable, disable, measure, paint, goTo, collapse, get enabled() { return enabled; }, get expanded() { return expanded; } };
}
