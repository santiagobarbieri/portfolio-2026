import { initArchiveAbout, prepareArchiveAbout } from "./archive-about.js";
import { makeProjectType } from "./project-type.js";
import { initArchiveMotion } from "./motion.js";
import { waitForImages } from "./loading.js";

const storageKey = "portfolio-archive-state";
const modulo = (value, count) => ((value % count) + count) % count;
const collator = new Intl.Collator("es", { sensitivity: "base" });

function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text) result.textContent = text;
  return result;
}

function createCard(project) {
  const card = node("article", "archive-card");
  Object.assign(card.dataset, { slug: project.slug, category: project.category, order: project.order, title: project.title, kind: "project" });
  const link = node("a", "archive-card__link");
  link.href = `./project.html?p=${encodeURIComponent(project.slug)}`;
  link.setAttribute("aria-label", `Abrir ${project.title}`);
  const media = node("div", "archive-card__media");
  if (project.cover) {
    const image = node("img", "archive-card__image");
    image.src = new URL(project.cover, document.baseURI).href;
    image.alt = project.alt || `${project.title} — ${project.type}`;
    image.width = project.w;
    image.height = project.h;
    image.decoding = "async";
    image.loading = "lazy";
    image.dataset.coverMotion = "";
    media.append(image);
  } else {
    const placeholder = node("div", `archive-card__placeholder archive-card__placeholder--${project.placeholder || "landscape"}`);
    placeholder.setAttribute("aria-hidden", "true");
    const preview = node("div", "archive-card__preview");
    preview.dataset.coverMotion = "";
    preview.append(node("span", "archive-card__preview-label", "Portada pendiente"), node("span", "archive-card__preview-title", project.title), node("p", "archive-card__preview-text", project.description));
    placeholder.append(preview);
    media.append(placeholder);
  }
  const caption = node("div", "archive-card__caption");
  const open = node("span", "archive-card__open", "Abrir Proyecto");
  open.setAttribute("aria-hidden", "true");
  caption.append(open);
  caption.append(node("span", "archive-card__code", project.code || "—"));
  const type = makeProjectType(project.family);
  if (type) {
    type.classList.add("archive-card__type");
    caption.append(type);
  }
  caption.append(node("h2", "archive-card__title", `${project.title} - ${project.type}`), node("p", "archive-card__description", project.description || "Completar"));
  link.append(media, caption);
  card.append(link);
  return card;
}

function storedState() {
  try { return JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { return {}; }
}

export async function initArchive() {
  const stream = document.querySelector("[data-archive-stream]");
  if (!stream) return;
  const aboutTemplate = stream.querySelector(".archive-about")?.cloneNode(true);
  let templates = [...stream.querySelectorAll(".archive-card")];
  try {
    const response = await fetch(new URL("../data/projects.json", import.meta.url));
    if (response.ok) templates = (await response.json()).map(createCard);
  } catch {
    // Full HTML cards remain the source if the registry is unavailable.
  }
  if (aboutTemplate) templates.unshift(aboutTemplate);
  initArchiveAbout(stream);
  await document.fonts.ready;

  const previousState = storedState();
  const state = previousState.version === 3 ? previousState : {};
  const menus = [...document.querySelectorAll("[data-filter-menu]")];
  const status = document.querySelector("[data-archive-status]");
  const mobileStatus = document.querySelector("[data-archive-mobile-status]");
  const filterPanel = document.querySelector("[data-archive-filter-panel]");
  const filterTrigger = filterPanel?.querySelector("summary");
  const compactControls = matchMedia("(max-width: 900px)");
  const main = document.getElementById("main-content");
  let category = templates.some((card) => card.dataset.category === state.category) ? state.category : "all";
  let order = ["newest", "oldest", "az"].includes(state.order) ? state.order : "newest";
  let selected = [];
  let rows = [];
  const cardPool = new Map();
  const heights = new Map();
  let streamY = 0;
  let streamHeight = 0;
  let lastAccessibilityY = -Infinity;
  let working = false;
  let resizeFrame = 0;
  let viewportWidth = innerWidth;
  let sizeFrame = 0;
  let startY = 0;
  let pristine = state.version === 3 ? Boolean(state.pristine) : true;
  let focusSlug = state.slug || null;
  const motion = initArchiveMotion({ onFrame: recycle });
  const buffer = () => Math.max(700, innerHeight * 1.35);
  const rowObserver = new ResizeObserver((entries) => {
    if (working || !entries.some(({ target }) => target.isConnected && heights.has(target) && Math.abs(target.getBoundingClientRect().height - heights.get(target)) > 0.5)) return;
    cancelAnimationFrame(sizeFrame);
    sizeFrame = requestAnimationFrame(refreshSizes);
  });

  function refreshSizes() {
    if (working || !rows.length) return;
    const position = anchor();
    heights.clear();
    streamY = stream.getBoundingClientRect().top + scrollY;
    streamHeight = rows.reduce((sum, row) => sum + rowHeight(row), 0);
    const current = rows.find((row) => Number(row.dataset.sequence) === position.sequence);
    if (current) {
      const compensation = streamY + current.offsetTop + position.offset - scrollY;
      startY += compensation;
      motion.rebase(compensation);
    }
    recycle();
  }

  function sorted() {
    return templates.filter((card) => category === "all" || card.dataset.category === category).sort((a, b) => {
      if (order === "az") return collator.compare(a.dataset.title || a.querySelector("h2").textContent, b.dataset.title || b.querySelector("h2").textContent);
      const difference = Number(a.dataset.order) - Number(b.dataset.order);
      return order === "oldest" ? -difference : difference;
    });
  }

  function makeRow(sequence, reusable) {
    const row = reusable || node("div", "archive-row");
    heights.delete(row);
    row.dataset.sequence = sequence;
    row.toggleAttribute("data-history", sequence < 0);
    const template = selected[modulo(sequence, selected.length)];
    let card = row.firstElementChild;
    if (card?.dataset.slug !== template.dataset.slug) {
      if (card) releaseCard(card);
      card = cardPool.get(template.dataset.slug)?.pop() || template.cloneNode(true);
      row.replaceChildren(card);
    }
    const index = modulo(sequence, selected.length);
    const projectCount = selected.filter((item) => item.dataset.kind !== "about").length;
    const precedingProjects = selected.slice(0, index).filter((item) => item.dataset.kind !== "about").length;
    const projectSequence = Math.floor(sequence / selected.length) * projectCount + precedingProjects;
    card.classList.toggle("archive-card--right", card.dataset.kind !== "about" && modulo(projectSequence, 2) === 1);
    row.classList.toggle("archive-row--about", card.dataset.kind === "about");
    row.classList.toggle("archive-row--before-about", selected[modulo(sequence + 1, selected.length)].dataset.kind === "about");
    if (card.dataset.kind === "about") prepareArchiveAbout(card);
    rowObserver.observe(row);
    return row;
  }

  function releaseCard(card) {
    const pool = cardPool.get(card.dataset.slug) || [];
    cardPool.set(card.dataset.slug, pool);
    card.remove();
    pool.push(card);
  }

  function rowHeight(row) {
    if (!heights.has(row)) heights.set(row, row.getBoundingClientRect().height);
    return heights.get(row);
  }

  function syncAccessibility() {
    const representatives = new Map();
    let top = streamY - scrollY;
    rows.forEach((row) => {
      const card = row.firstElementChild;
      const hidden = pristine && row.hasAttribute("data-history");
      const distance = hidden ? Infinity : Math.abs(top - 140);
      const current = representatives.get(card.dataset.slug);
      const focused = row.contains(document.activeElement);
      if (!current || focused || (!current.focused && distance < current.distance)) representatives.set(card.dataset.slug, { row, distance, focused });
      top += rowHeight(row);
    });
    rows.forEach((row) => {
      const primary = representatives.get(row.firstElementChild.dataset.slug)?.row === row;
      if (primary && row.hasAttribute("aria-hidden")) row.removeAttribute("aria-hidden");
      else if (!primary && !row.hasAttribute("aria-hidden")) row.setAttribute("aria-hidden", "true");
      row.inert = false;
      row.querySelectorAll("a, button, summary, [tabindex]").forEach((control) => {
        if (control.tabIndex !== (primary ? 0 : -1)) control.tabIndex = primary ? 0 : -1;
      });
    });
    lastAccessibilityY = scrollY;
  }

  function anchor() {
    // Cached geometry preserves the old position even after responsive CSS reflows.
    let top = streamY - scrollY;
    for (const row of rows) {
      const height = rowHeight(row);
      if (!(pristine && row.hasAttribute("data-history")) && top + height > 1) {
        return { sequence: Number(row.dataset.sequence), offset: -top };
      }
      top += height;
    }
    return { sequence: Number(rows[0]?.dataset.sequence) || 0, offset: scrollY - streamY };
  }

  function save() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ version: 3, category, order, pristine, ...anchor(), slug: focusSlug }));
    } catch {}
  }

  function updateMenus() {
    menus.forEach((menu) => {
      const key = menu.dataset.filterMenu;
      const value = key === "category" ? category : order;
      const checked = menu.querySelector(`input[value="${CSS.escape(value)}"]`);
      if (checked) {
        checked.checked = true;
        menu.querySelector("[data-filter-label]").textContent = checked.nextElementSibling.textContent;
      }
    });
    const projectCount = selected.filter((card) => card.dataset.kind !== "about").length;
    const count = `${projectCount} ${projectCount === 1 ? "proyecto" : "proyectos"}`;
    status.textContent = count;
    if (mobileStatus) mobileStatus.textContent = count;
  }

  function render(position = { sequence: 0, offset: -main.offsetTop }) {
    working = true;
    selected = sorted();
    rows.forEach((row) => {
      rowObserver.unobserve(row);
      releaseCard(row.firstElementChild);
    });
    heights.clear();
    stream.replaceChildren();
    rows = [];
    if (!selected.length) {
      stream.append(node("p", "archive-empty", "No hay proyectos en esta categoría."));
      motion.resize();
      motion.scrollTo(0, { immediate: true });
      updateMenus();
      working = false;
      return;
    }
    const sequence = Number.isSafeInteger(position.sequence) ? position.sequence : 0;
    let center = makeRow(sequence);
    rows.push(center);
    stream.append(center);
    // Keep the complete catalogue represented, then fill a viewport-sized buffer.
    for (let index = 1; index < selected.length; index += 1) {
      const row = makeRow(sequence + index);
      rows.push(row);
      stream.append(row);
    }
    let beforeHeight = 0;
    while (beforeHeight < buffer() + Math.max(0, position.offset) && rows.length < selected.length + 160) {
      const row = makeRow(Number(rows[0].dataset.sequence) - 1);
      stream.prepend(row);
      rows.unshift(row);
      beforeHeight += rowHeight(row);
    }
    let belowHeight = rows.slice(rows.indexOf(center)).reduce((sum, row) => sum + rowHeight(row), 0);
    while (belowHeight < innerHeight + buffer() + Math.max(0, position.offset) && rows.length < selected.length + 220) {
      const row = makeRow(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(row);
      rows.push(row);
      belowHeight += rowHeight(row);
    }
    document.body.dataset.pristine = String(pristine);
    streamY = stream.getBoundingClientRect().top + scrollY;
    streamHeight = rows.reduce((sum, row) => sum + rowHeight(row), 0);
    motion.resize();
    motion.scrollTo(stream.offsetTop + center.offsetTop + position.offset, { immediate: true });
    startY = scrollY;
    syncAccessibility();
    updateMenus();
    working = false;
  }

  function recycle() {
    if (working || !rows.length) return;
    working = true;
    let zeroBottom = streamY;
    for (const row of rows) {
      zeroBottom += rowHeight(row);
      if (row.dataset.sequence === "0") break;
    }
    if (pristine && (scrollY < startY - 1 || zeroBottom < scrollY)) {
      pristine = false;
      document.body.dataset.pristine = "false";
    }
    let changed = false;
    let compensation = 0;
    let guard = 0;
    // Move only fully offscreen rows. Compensate their exact height in the same frame.
    while (rows.length > 1 && streamY + rowHeight(rows[0]) < scrollY + compensation - buffer() && guard++ < 160) {
      const first = rows.shift();
      const height = rowHeight(first);
      const sequence = Number(rows.at(-1).dataset.sequence) + 1;
      if (first.contains(document.activeElement)) main.focus({ preventScroll: true });
      first.remove();
      stream.append(makeRow(sequence, first));
      rows.push(first);
      streamHeight += rowHeight(first) - height;
      compensation -= height;
      changed = true;
    }
    guard = 0;
    while (streamY > scrollY + compensation - buffer() && guard++ < 160) {
      const sequence = Number(rows[0].dataset.sequence) - 1;
      const last = rows.at(-1);
      const lastTop = streamY + streamHeight - rowHeight(last);
      const canReuse = rows.length > selected.length + 1 && lastTop > scrollY + compensation + innerHeight + buffer();
      const row = canReuse ? rows.pop() : null;
      if (row) { streamHeight -= rowHeight(row); row.remove(); }
      const previous = makeRow(sequence, row);
      stream.prepend(previous);
      rows.unshift(previous);
      const height = rowHeight(previous);
      streamHeight += height;
      compensation += height;
      changed = true;
    }
    // A run of short covers must still leave enough content ahead of the viewport.
    guard = 0;
    while (streamY + streamHeight < scrollY + compensation + innerHeight + buffer() && guard++ < 160) {
      const row = makeRow(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(row);
      rows.push(row);
      streamHeight += rowHeight(row);
      changed = true;
    }
    while (rows.length > selected.length + 3 && streamY + streamHeight - rowHeight(rows.at(-1)) - rowHeight(rows.at(-2)) > scrollY + compensation + innerHeight + buffer() * 1.8) {
      const row = rows.pop();
      streamHeight -= rowHeight(row);
      releaseCard(row.firstElementChild);
      rowObserver.unobserve(row);
      heights.delete(row);
      row.remove();
      changed = true;
    }
    if (changed) motion.rebase(compensation);
    if (changed || Math.abs(scrollY - lastAccessibilityY) > 100) syncAccessibility();
    working = false;
  }

  function fitFilterControls() {
    if (filterPanel) filterPanel.open = !compactControls.matches;
    menus.forEach((menu) => { menu.open = false; });
  }

  function closeFilters(menu) {
    if (compactControls.matches && filterPanel) {
      filterPanel.open = false;
      filterTrigger?.focus({ preventScroll: true });
    } else {
      menu.open = false;
      menu.querySelector("summary").focus({ preventScroll: true });
    }
  }

  fitFilterControls();
  compactControls.addEventListener("change", fitFilterControls);
  filterPanel?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && compactControls.matches && filterPanel.open) {
      event.preventDefault();
      closeFilters();
    }
  });

  stream.addEventListener("focusin", syncAccessibility);
  history.scrollRestoration = "manual";
  document.body.classList.add("has-archive-loop");
  render(state.version === 3 ? state : undefined);
  menus.forEach((menu) => {
    menu.addEventListener("change", (event) => {
      if (!event.target.matches("input")) return;
      if (menu.dataset.filterMenu === "category") category = event.target.value;
      else order = event.target.value;
      pristine = true;
      render();
      save();
      closeFilters(menu);
    });
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !compactControls.matches) closeFilters(menu);
    });
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link?.href.includes("project.html")) {
      focusSlug = new URL(link.href).searchParams.get("p");
      save();
    }
    if (link?.classList.contains("skip-link")) {
      event.preventDefault();
      main.focus({ preventScroll: true });
    }
  });
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    const position = storedState();
    pristine = Boolean(position.pristine);
    render(position);
    const card = rows.find((row) => row.firstElementChild.dataset.slug === focusSlug && row.getBoundingClientRect().bottom > 0);
    card?.querySelector("a").focus({ preventScroll: true });
  });
  window.addEventListener("resize", () => {
    // Mobile browser chrome changes height while scrolling. Keep the cards intact.
    if (innerWidth === viewportWidth) {
      recycle();
      return;
    }
    viewportWidth = innerWidth;
    const position = anchor();
    cancelAnimationFrame(resizeFrame);
    const atBeginning = pristine && position.sequence === 0 && position.offset < 0;
    resizeFrame = requestAnimationFrame(() => render(atBeginning ? undefined : position));
  }, { passive: true });
  await waitForImages(stream);
}
