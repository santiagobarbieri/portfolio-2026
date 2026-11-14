const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Equal folder panels. Extra content consumes ordinary page scroll before stacking. */
export function createFolderStack({ stage, chapters, motion, isZoomOpen = () => false }) {
  let records = [];
  let enabled = false;
  let measured = false;
  let panelHeight = 0;
  const rail = 128;

  function enable() {
    if (enabled) return;
    enabled = true;
    if (!records.length) records = chapters.map((section, index) => {
      const original = [...section.children];
      const card = document.createElement("div");
      card.className = "project-folder";
      const tab = document.createElement("button");
      tab.className = "project-folder__tab";
      tab.type = "button";
      tab.setAttribute("aria-label", `Ver sección ${index + 1}: ${section.dataset.sectionName}`);
      tab.title = section.dataset.sectionName;
      tab.dataset.cursorAction = `Ver ${section.dataset.sectionName}`;
      const number = document.createElement("span");
      number.className = "project-folder__number";
      number.textContent = String(index + 1);
      number.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "project-folder__label";
      label.textContent = section.dataset.sectionName;
      tab.append(number, label);
      const window = document.createElement("div");
      window.className = "project-folder__window";
      const content = document.createElement("div");
      content.className = "project-folder__content";
      window.append(content);
      card.append(tab, window);
      const spacer = document.createElement("div");
      spacer.className = "project-folder-gap";
      spacer.setAttribute("aria-hidden", "true");
      tab.addEventListener("click", () => goTo(index));
      return { section, original, card, content, viewport: window, tab, spacer, start: 0, overflow: 0 };
    });
    for (const record of records) {
      record.content.append(...record.original);
      record.section.replaceChildren(record.card);
      record.section.after(record.spacer);
    }
    document.body.classList.add("project-folders-ready");
  }

  function disable() {
    if (!enabled) return;
    enabled = measured = false;
    document.body.classList.remove("project-folders-ready");
    stage.style.removeProperty("--folder-height");
    for (const record of records) {
      record.content.inert = false;
      record.section.replaceChildren(...record.original);
      record.spacer.remove();
    }
  }

  function measure(preserve = true) {
    if (!enabled) return;
    const current = measured ? [...records].reverse().find((record) => record.start <= scrollY + rail) || records[0] : null;
    const offset = current ? scrollY - current.start + rail : 0;
    panelHeight = Math.max(80, Math.floor(innerHeight - rail - 16));
    stage.style.setProperty("--folder-height", `${panelHeight}px`);
    const width = records[0].section.getBoundingClientRect().width;
    const tabStep = clamp((width - 140) / Math.max(1, records.length - 1), 46, 72);
    let top = stage.getBoundingClientRect().top + scrollY;
    records.forEach((record, index) => {
      record.section.style.setProperty("--chapter-order", index + 1);
      record.start = top;
      record.overflow = Math.max(0, record.content.offsetHeight - record.viewport.clientHeight);
      record.spacer.style.height = `${record.overflow + 36}px`;
      record.card.style.setProperty("--folder-tab-x", `${index * tabStep}px`);
      record.card.style.setProperty("--folder-tab-width", `${Math.max(44, Math.min(180, width - index * tabStep))}px`);
      top += panelHeight + record.overflow + 36;
    });
    if (current && preserve) motion.scrollTo(current.start - rail + clamp(offset, 0, current.overflow + panelHeight), { immediate: true });
    measured = true;
    paint();
  }

  function paint() {
    if (!enabled || !measured) return 0;
    const y = scrollY;
    let active = 0;
    records.forEach((record, index) => {
      const shift = clamp(y - record.start + rail, 0, record.overflow);
      const next = records[index + 1];
      const folded = next
        ? clamp((y + rail + panelHeight * .45 - next.start) / (panelHeight * .45))
        : clamp((y + rail - record.start - record.overflow) / 36);
      record.content.style.setProperty("--folder-shift", `${-shift.toFixed(2)}px`);
      record.card.style.setProperty("--folder-scale", (1 - folded * .035).toFixed(4));
      record.card.classList.toggle("project-folder--closed", folded >= .999);
      record.content.inert = Boolean(next) && folded >= .999;
      if (record.start - y <= rail + panelHeight * .5) active = index;
    });
    records.forEach((record, index) => record.tab.setAttribute("aria-current", index === active ? "step" : "false"));
    return active;
  }

  function goTo(index, immediate = false) {
    if (!enabled || !measured) return;
    motion.scrollTo(records[index].start - rail, { immediate });
    if (immediate) paint();
  }

  stage.addEventListener("focusin", (event) => {
    if (!enabled || !measured || isZoomOpen() || !event.target.matches(":focus-visible")) return;
    const record = records.find((entry) => entry.content.contains(event.target));
    if (!record) return;
    const scale = record.card.getBoundingClientRect().height / panelHeight;
    const offset = (event.target.getBoundingClientRect().top - record.content.getBoundingClientRect().top) / scale;
    motion.scrollTo(record.start - rail + clamp(offset - 32, 0, record.overflow), { immediate: true });
    paint();
  });
  return { enable, disable, measure, paint, goTo, get enabled() { return enabled; } };
}
