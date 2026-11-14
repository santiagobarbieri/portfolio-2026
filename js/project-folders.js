const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => value * value * (3 - 2 * value);

/** Each tab belongs to its full-width sheet, from the bottom preview to the final pile. */
export function createFolderStack({ stage, chapters, motion, isZoomOpen = () => false, onChange = () => {} }) {
  const sheet = stage.parentElement;
  const intro = chapters[0];
  let records = [];
  let enabled = false;
  let measured = false;
  let order = [];
  let selected = null;
  let active = 0;
  let rail = 0;
  let start = 0;
  let lastY = 0;
  let total = 0;
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
      const viewport = document.createElement("div");
      viewport.className = "project-folder__window";
      const content = document.createElement("div");
      content.className = "project-folder__content";
      viewport.append(content);
      card.append(tab, viewport);
      tab.addEventListener("click", () => select(index));
      return { section, original, card, tab, label, viewport, content, from: 0, duration: 0, overflow: 0, peek: 0 };
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
    intro.inert = false;
    document.body.classList.remove("project-folders-ready");
    sheet.style.removeProperty("--folder-scroll-height");
    stage.style.removeProperty("--folder-height");
    stage.style.removeProperty("--folder-hero-limit");
    for (const record of records) {
      record.content.inert = false;
      record.section.replaceChildren(...record.original);
      record.section.style.removeProperty("--folder-order");
    }
  }

  function measure(preserve = true) {
    if (!enabled) return;
    const previous = measured ? Math.max(0, scrollY - start) : 0;
    const old = measured ? [...records].reverse().find((record) => previous >= record.from) : null;
    const offset = old ? previous - old.from : 0;
    const reading = old ? Math.max(0, offset - old.duration) : 0;
    const entering = old ? clamp(offset / old.duration) : 0;
    const wasReading = old && offset >= old.duration;
    const header = document.querySelector(".armado-shell, .club-shell");
    rail = Math.max(76, header.getBoundingClientRect().bottom + 6);
    const height = innerHeight;
    const width = stage.clientWidth;
    const panelHeight = Math.max(140, height - rail - (records.length - 1) * step);
    const peek = height - Math.min(210, height * .21);
    stage.style.setProperty("--folder-height", `${panelHeight}px`);
    stage.style.setProperty("--folder-hero-limit", `${peek}px`);
    const left = width < 640 ? 8 : Math.min(64, width * .0423);
    const slant = width < 640 ? 16 : 28;
    const slot = Math.min(150, (width - left * 2 - slant) / records.length);
    let cursor = 0;
    records.forEach((record, index) => {
      record.card.style.setProperty("--folder-tab-x", `${left + index * slot}px`);
      record.card.style.setProperty("--folder-tab-width", `${slot + slant}px`);
      record.card.style.setProperty("--folder-slant", `${slant}px`);
      record.peek = peek + index * step;
      record.from = cursor;
      record.duration = Math.max(250, height * .82);
      record.overflow = Math.max(0, record.content.offsetHeight - record.viewport.clientHeight);
      const font = width < 640 ? 11 : 13;
      record.tab.style.fontSize = `${font}px`;
      const available = slot - (width < 640 ? 12 : 20);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = getComputedStyle(record.tab).font;
      const desired = context.measureText(record.label.textContent).width;
      if (width < 640) record.tab.style.fontSize = `${Math.max(9, Math.min(font, font * available / Math.max(1, desired)))}px`;
      cursor += record.duration + record.overflow;
    });
    total = cursor;
    sheet.style.setProperty("--folder-scroll-height", `${height + total}px`);
    start = sheet.getBoundingClientRect().top + scrollY;
    motion.resize();
    if (old && preserve && selected === null) {
      const position = wasReading ? old.duration + Math.min(reading, old.overflow) : entering * old.duration;
      motion.scrollTo(start + old.from + position, { immediate: true });
    }
    lastY = scrollY;
    measured = true;
    paint();
  }

  function paint() {
    if (!enabled || !measured) return 0;
    const y = clamp(scrollY - start, 0, total);
    // Scrolling the page resumes the ordered journey; a tab itself never moves it.
    if (selected !== null && Math.abs(scrollY - lastY) > 2) selected = null;
    lastY = scrollY;
    const manual = selected !== null;
    let current = -1;
    records.forEach((record, index) => {
      if (y >= record.from + record.duration * .52) current = index;
    });
    const front = manual ? selected : current;
    stage.dataset.folderManual = String(manual);
    intro.inert = front >= 0;
    records.forEach((record, index) => {
      const rank = manual ? order.indexOf(index) : index;
      const progress = manual ? 1 : ease(clamp((y - record.from) / record.duration));
      const top = record.peek + (rail + rank * step - record.peek) * progress;
      const behind = manual ? index !== front : index < current;
      record.section.style.setProperty("--folder-order", rank + 1);
      record.card.style.setProperty("--folder-y", `${top.toFixed(2)}px`);
      record.card.dataset.front = String(index === front);
      record.card.dataset.preview = String(!manual && progress < .03);
      record.card.dataset.stacked = String(behind);
      record.card.classList.toggle("project-folder--manual", manual && index === front);
      record.viewport.toggleAttribute("data-lenis-prevent", manual && index === front);
      if (!manual || index !== front) record.viewport.scrollTop = 0;
      const shift = manual ? 0 : clamp(y - record.from - record.duration, 0, record.overflow);
      record.content.style.setProperty("--folder-shift", `${-shift.toFixed(2)}px`);
      record.content.inert = index !== front;
      record.tab.setAttribute("aria-pressed", String(index === front));
    });
    active = front + 1;
    return active;
  }

  function select(index) {
    if (!enabled || !measured || isZoomOpen()) return;
    const slot = order.indexOf(index);
    [order[slot], order[order.length - 1]] = [order[order.length - 1], order[slot]];
    selected = index;
    motion.scrollTo(scrollY, { immediate: true });
    lastY = scrollY;
    records[index].viewport.scrollTop = 0;
    paint();
    onChange(index + 1);
  }

  function goTo(index, immediate = false) {
    if (!enabled || !measured) return;
    selected = null;
    const record = records[index - 1];
    motion.scrollTo(index === 0 ? start : start + record.from + record.duration, { immediate });
    if (immediate) paint();
  }

  stage.addEventListener("focusin", (event) => {
    if (!enabled || !measured || isZoomOpen() || !event.target.matches(":focus-visible")) return;
    const index = records.findIndex((record) => record.content.contains(event.target));
    if (index < 0) return;
    const record = records[index];
    if (selected === index) {
      const box = event.target.getBoundingClientRect();
      const frame = record.viewport.getBoundingClientRect();
      if (box.top < frame.top || box.bottom > frame.bottom) record.viewport.scrollTop += box.top - frame.top - 24;
      return;
    }
    const offset = event.target.getBoundingClientRect().top - record.content.getBoundingClientRect().top;
    motion.scrollTo(start + record.from + record.duration + clamp(offset - 24, 0, record.overflow), { immediate: true });
    paint();
  });
  return { enable, disable, measure, paint, goTo, get enabled() { return enabled; } };
}
