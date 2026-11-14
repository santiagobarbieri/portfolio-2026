const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Full-width folders: page scroll builds the pile; tabs swap its front sheet. */
export function createFolderStack({ stage, chapters, motion, isZoomOpen = () => false, onChange = () => {} }) {
  let records = [];
  let enabled = false;
  let measured = false;
  let panelHeight = 0;
  let rail = 0;
  let order = [];
  let arrived = 1;
  let selected = null;
  const step = 8;
  const tabs = document.createElement("nav");
  tabs.className = "project-folder-tabs";
  tabs.setAttribute("aria-label", "Secciones del proyecto");

  function enable() {
    if (enabled) return;
    enabled = true;
    if (!records.length) records = chapters.map((section, index) => {
      const original = [...section.children];
      const card = document.createElement("div");
      card.className = "project-folder";
      if (section.querySelector('[data-sheet-art="palette"]')) card.classList.add("project-folder--palette");
      const tab = document.createElement("button");
      tab.className = "project-folder__tab";
      tab.type = "button";
      tab.dataset.folderIndex = index;
      if (card.classList.contains("project-folder--palette")) tab.classList.add("project-folder__tab--palette");
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
      card.append(viewport);
      const spacer = document.createElement("div");
      spacer.className = "project-folder-gap";
      spacer.setAttribute("aria-hidden", "true");
      tab.addEventListener("click", () => select(index));
      return { section, original, card, content, viewport, tab, spacer, start: 0, overflow: 0 };
    });
    order = records.map((_, index) => index);
    arrived = 1;
    selected = null;
    for (const record of records) {
      record.content.append(...record.original);
      record.section.replaceChildren(record.card);
      record.section.after(record.spacer);
      tabs.append(record.tab);
    }
    stage.append(tabs);
    document.body.classList.add("project-folders-ready");
  }

  function disable() {
    if (!enabled) return;
    enabled = measured = false;
    selected = null;
    tabs.remove();
    document.body.classList.remove("project-folders-ready");
    stage.style.removeProperty("--folder-height");
    document.body.style.removeProperty("--folder-rail");
    for (const record of records) {
      record.content.inert = false;
      record.section.replaceChildren(...record.original);
      record.section.style.removeProperty("--folder-top");
      record.section.style.removeProperty("--folder-order");
      record.spacer.remove();
    }
  }

  function measure(preserve = true) {
    if (!enabled) return;
    const current = measured ? records[Math.min(arrived - 1, records.length - 1)] : null;
    const offset = current ? scrollY - current.start + rail + (arrived - 1) * step : 0;
    const columns = innerWidth < 640 ? 3 : records.length;
    const rows = Math.ceil(records.length / columns);
    const tabHeight = 44;
    const tabTop = Math.max(80, document.querySelector(".armado-shell, .club-shell").getBoundingClientRect().bottom);
    rail = tabTop + rows * tabHeight + 8;
    tabs.style.top = `${tabTop}px`;
    tabs.style.setProperty("--folder-columns", columns);
    document.body.style.setProperty("--folder-rail", `${rail}px`);
    panelHeight = Math.max(100, Math.floor(innerHeight - rail - (records.length - 1) * step - 16));
    stage.style.setProperty("--folder-height", `${panelHeight}px`);
    let top = stage.getBoundingClientRect().top + scrollY;
    records.forEach((record, index) => {
      record.start = top;
      record.overflow = Math.max(0, record.content.offsetHeight - record.viewport.clientHeight);
      record.spacer.style.height = `${record.overflow + 44}px`;
      top += panelHeight + record.overflow + 44;
    });
    if (current && preserve && selected === null) motion.scrollTo(current.start - rail - (arrived - 1) * step + clamp(offset, 0, current.overflow + panelHeight), { immediate: true });
    measured = true;
    paint();
  }

  function paint() {
    if (!enabled || !measured) return 0;
    const y = scrollY;
    const count = Math.max(1, records.filter((record, index) => record.start - y <= rail + index * step + 1).length);
    if (count !== arrived) {
      order = order.filter((index) => index < count);
      for (let index = 0; index < count; index += 1) if (!order.includes(index)) order.push(index);
      arrived = count;
      selected = null;
    }
    const front = selected ?? order[arrived - 1];
    records.forEach((record, index) => {
      const rank = index < arrived ? order.indexOf(index) : index;
      const top = rail + rank * step;
      const manual = index === selected;
      record.section.style.setProperty("--folder-top", `${top}px`);
      record.section.style.setProperty("--folder-order", rank + 1);
      const shift = manual ? 0 : clamp(y - record.start + rail + index * step, 0, record.overflow);
      record.content.style.setProperty("--folder-shift", `${-shift.toFixed(2)}px`);
      record.card.dataset.front = String(index === front);
      record.card.dataset.stacked = String(index < arrived && index !== front);
      record.card.classList.toggle("project-folder--manual", manual);
      record.viewport.toggleAttribute("data-lenis-prevent", manual);
      if (!manual) record.viewport.scrollTop = 0;
      record.content.inert = index < arrived && index !== front;
      record.tab.disabled = index >= arrived;
      record.tab.style.visibility = index >= arrived ? "hidden" : "visible";
      record.tab.setAttribute("aria-pressed", String(index === front));
    });
    return front;
  }

  function select(index) {
    if (!enabled || !measured || index >= arrived) return;
    const slot = order.indexOf(index);
    const frontSlot = arrived - 1;
    [order[slot], order[frontSlot]] = [order[frontSlot], order[slot]];
    selected = index;
    motion.scrollTo(scrollY, { immediate: true });
    records[index].viewport.scrollTop = 0;
    paint();
    onChange(index);
  }

  function goTo(index, immediate = false) {
    if (!enabled || !measured) return;
    selected = null;
    motion.scrollTo(records[index].start - rail - index * step, { immediate });
    if (immediate) paint();
  }

  stage.addEventListener("focusin", (event) => {
    if (!enabled || !measured || isZoomOpen() || !event.target.matches(":focus-visible")) return;
    const record = records.find((entry) => entry.content.contains(event.target));
    if (!record) return;
    if (records.indexOf(record) === selected) {
      const box = event.target.getBoundingClientRect();
      const frame = record.viewport.getBoundingClientRect();
      if (box.top < frame.top || box.bottom > frame.bottom) record.viewport.scrollTop += box.top - frame.top - 24;
      return;
    }
    const index = records.indexOf(record);
    const offset = event.target.getBoundingClientRect().top - record.content.getBoundingClientRect().top;
    motion.scrollTo(record.start - rail - index * step + clamp(offset - 24, 0, record.overflow), { immediate: true });
    paint();
  });
  return { enable, disable, measure, paint, goTo, get enabled() { return enabled; } };
}
