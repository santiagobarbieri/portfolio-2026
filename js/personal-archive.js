import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { initArchivePhysics } from "./archive-physics.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageGallery, imageKey } from "./image-gallery.js";

const modulo = (value, count) => ((value % count) + count) % count;
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
const local = (path) => {
  if (!path) return null;
  const url = new URL(path, document.baseURI);
  return url.origin === location.origin ? url.href : null;
};
const main = document.querySelector("main");
const stream = document.querySelector("[data-personal-stream]");
const controls = document.querySelector("[data-personal-controls]");
const status = document.querySelector("[data-personal-status]");
const search = document.querySelector("[data-personal-search]");
const reset = document.querySelector("[data-personal-reset]");
const storageKey = "portfolio:personal-editorial:v2";
const complete = startLoading("Cargando Archivo");
const kinds = { book: "Tapa de libro", photo: "Fotografía", poster: "Afiche", logo: "Logo" };
const groups = { book: "Stephen King", photo: "Zapallar" };
const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });
const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const titleOf = (item, index) => item.name || item.caption || `Fotografía ${String(item.id?.match(/\d+$/)?.[0] || index + 1).padStart(2, "0")}`;

function download(item, index) {
  const link = element("a", "personal-archive__download", "Descargar");
  const url = new URL(local(item.original || item.src));
  link.href = url.href;
  link.download = decodeURIComponent(url.pathname.split("/").at(-1));
  const label = item.downloadLabel || "Descargar original";
  link.setAttribute("aria-label", `${label} de ${titleOf(item, index)}`);
  link.dataset.cursorAction = label;
  return link;
}

async function initArchive() {
  const response = await fetch("./data/personal-work.json", { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("No se pudo leer el archivo");
  const source = await response.json();
  const seen = new Set();
  const items = source.items.filter((item) => {
    const key = imageKey(item);
    if (!key || seen.has(key) || !local(item.src) || !(item.w > 0 && item.h > 0)) return false;
    seen.add(key); return true;
  }).map((item, index) => ({ ...item, archiveOrder: index, archiveTitle: titleOf(item, index) }));
  const signature = items.map((item) => item.id).join("|");
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { /* Storage is optional. */ }
  if (saved.signature !== signature) saved = {};
  let columns = [2, 4, 6].includes(saved.columns) ? saved.columns : 2;
  let query = typeof saved.query === "string" ? saved.query : "";
  let kind = ["all", ...Object.keys(kinds)].includes(saved.kind) ? saved.kind : "all";
  let order = ["archive", "az", "za"].includes(saved.order) ? saved.order : "archive";
  let selected = [], rows = [], metrics = [];
  let top = 0, extent = 0, width = 0, tile = 0, gap = 0, half = 0;
  let working = false, paused = false, pendingResize = false, resizeFrame = 0;
  let openerSequence = null;
  const physics = initArchivePhysics();
  const motion = initSmoothScroll({ onFrame: (frame) => { recycle(); if (!paused) physics.feed(frame); } });
  const gallery = createImageGallery({ downloads: true, onOpen() {
    paused = true; physics.reset(); motion.stop();
  }, onClose() {
    paused = false;
    if (pendingResize) { const position = anchor(); render(position); pendingResize = false; }
    const opener = stream.querySelector(`[data-item-sequence="${openerSequence}"] .personal-archive__open`);
    (opener || main).focus({ preventScroll: true });
    motion.start(); recycle();
  } });
  const buffer = () => Math.max(900, innerHeight * 1.2, ...metrics.map((item) => item.height));
  const metric = (sequence) => metrics[modulo(sequence, metrics.length)];
  const rowHeight = (row) => metric(Number(row.dataset.sequence)).advance;
  const rowExtent = (row) => Math.max(rowHeight(row), metric(Number(row.dataset.sequence)).height);
  const loading = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) reveal(target); });
  }, { rootMargin: "240px 0px" });

  function reveal(image) {
    if (image.dataset.requested) return;
    image.dataset.requested = "";
    const item = selected[Number(image.dataset.preview)];
    if (!item) return;
    const media = image.parentElement;
    media.setAttribute("aria-busy", "true");
    image.addEventListener("load", async () => {
      try { await image.decode(); } catch { /* Keep the error treatment local. */ }
      if (image.isConnected) { image.classList.add("is-ready"); media.removeAttribute("aria-busy"); }
    }, { once: true });
    image.addEventListener("error", () => { media.dataset.error = ""; media.removeAttribute("aria-busy"); }, { once: true });
    const sources = [item.thumbnail, ...(item.sources || [])].filter((source) => source?.src && source.w <= 1600);
    image.sizes = `${Math.ceil(tile)}px`;
    image.srcset = [...new Map(sources.map((source) => [source.w, source])).values()].map((source) => `${local(source.src)} ${source.w}w`).join(", ");
    image.src = local(item.thumbnail?.src || item.src);
    image.loading = "eager";
    loading.unobserve(image);
  }

  function makeCard(sequence, measuring = false) {
    const index = modulo(sequence, selected.length), item = selected[index];
    const card = element("article", "personal-archive__cell");
    Object.assign(card.dataset, { itemSequence: sequence, itemId: item.id, slug: item.id });
    const lane = modulo(sequence, columns), split = columns / 2;
    const x = Math.floor(lane / split) * (half + gap) + (lane % split) * (tile + (split > 1 ? 16 : 0));
    card.style.setProperty("--piece-left", `${measuring ? 0 : x}px`);
    const body = element("div", "personal-archive__motion archive-card__link");
    const open = element("button", "personal-archive__open");
    open.type = "button"; open.setAttribute("aria-haspopup", "dialog");
    open.setAttribute("aria-label", `Ampliar ${item.archiveTitle}`);
    open.dataset.cursorAction = "Ampliar imagen";
    const media = element("span", "personal-archive__media");
    const image = element("img");
    image.width = item.w; image.height = item.h; image.alt = item.alt || item.archiveTitle;
    image.decoding = "async"; image.loading = "lazy"; image.dataset.preview = index;
    media.append(image); open.append(media);
    const caption = element("div", "personal-archive__caption");
    caption.append(element("h2", "personal-archive__name", item.archiveTitle));
    const metadata = element("p", "personal-archive__meta", [groups[item.kind], kinds[item.kind] || "Pieza gráfica", item.format, item.year].filter(Boolean).join(" · "));
    caption.append(metadata, download(item, item.archiveOrder));
    body.append(open, caption); card.append(body);
    if (!measuring) loading.observe(image);
    return card;
  }

  function measure() {
    gap = parseFloat(getComputedStyle(main).columnGap);
    half = (main.clientWidth - gap) / 2;
    const split = columns / 2;
    tile = (half - 16 * (split - 1)) / split;
    main.style.setProperty("--piece-width", `${tile}px`);
    const bank = element("div", "personal-archive__measure");
    bank.setAttribute("aria-hidden", "true"); bank.inert = true;
    selected.forEach((_, index) => bank.append(makeCard(index, true)));
    main.append(bank);
    metrics = [...bank.children].map((card, index) => ({
      height: card.getBoundingClientRect().height,
      advance: Math.max(28, tile * selected[index].h / selected[index].w / (columns - 1)),
    }));
    // Every same-lane successor clears the entire image, caption and hover allowance.
    // Increasing an advance only improves the other cyclic constraints.
    metrics.forEach((item, index) => {
      let span = 0;
      for (let n = 0; n < columns; n++) span += metrics[(index + n) % metrics.length].advance;
      item.advance += Math.max(0, item.height + 80 - span);
    });
    bank.remove(); width = innerWidth;
  }

  function row(sequence, reusable) {
    const result = reusable || element("div", "personal-archive__row");
    if (reusable) {
      reusable.querySelectorAll("img[data-preview]").forEach((image) => loading.unobserve(image));
      physics.forget(reusable.querySelector(".personal-archive__motion"));
      if (reusable.contains(document.activeElement)) main.focus({ preventScroll: true });
    }
    result.dataset.sequence = sequence;
    result.style.setProperty("--piece-advance", `${metric(sequence).advance}px`);
    result.replaceChildren(makeCard(sequence));
    return result;
  }

  function anchor() {
    if (!rows.length) return null;
    const candidates = rows.filter((row) => {
      const bounds = row.firstElementChild.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < innerHeight;
    });
    candidates.sort((a, b) => Math.abs(a.getBoundingClientRect().top - 144) - Math.abs(b.getBoundingClientRect().top - 144));
    const found = candidates[0] || rows[0];
    const sequence = Number(found.dataset.sequence);
    return { sequence, id: found.firstElementChild.dataset.itemId, offset: found.getBoundingClientRect().top };
  }

  function accessibility() {
    const representatives = new Map();
    rows.forEach((row) => {
      const id = row.firstElementChild.dataset.itemId;
      const r = row.firstElementChild.getBoundingClientRect();
      const focused = row.contains(document.activeElement);
      const distance = Math.abs(r.top - 144);
      const previous = representatives.get(id);
      if (!previous || focused || (!previous.focused && distance < previous.distance)) representatives.set(id, { row, focused, distance });
    });
    rows.forEach((row) => {
      const primary = representatives.get(row.firstElementChild.dataset.itemId).row === row;
      if (primary) row.removeAttribute("aria-hidden");
      else row.setAttribute("aria-hidden", "true");
      row.querySelectorAll("button,a").forEach((control) => { control.tabIndex = primary ? 0 : -1; });
    });
  }

  function render(position) {
    working = true; physics.reset();
    rows.forEach((row) => row.querySelectorAll("img[data-preview]").forEach((image) => loading.unobserve(image)));
    stream.replaceChildren(); rows = [];
    document.body.dataset.columns = columns;
    main.classList.add("personal-archive__main--loop");
    if (!selected.length) {
      stream.append(element("p", "personal-archive__empty", "No hay piezas que coincidan con tu búsqueda."));
      motion.resize(); motion.scrollTo(0, { immediate: true }); working = false; return;
    }
    measure();
    let sequence = Number.isSafeInteger(position?.sequence) ? position.sequence : 0;
    const item = selected.findIndex((item) => item.id === position?.id);
    if (item >= 0 && selected[modulo(sequence, selected.length)].id !== position.id) sequence = Math.floor(sequence / selected.length) * selected.length + item;
    else if (position?.id && item < 0) position = null;
    const center = row(sequence); stream.append(center); rows.push(center);
    let before = 0;
    while (before < buffer() + Math.max(0, -(position?.offset || 0))) {
      const next = row(Number(rows[0].dataset.sequence) - 1);
      stream.prepend(next); rows.unshift(next); before += rowHeight(next);
    }
    let ahead = rowHeight(center);
    while (ahead < innerHeight + buffer()) {
      const next = row(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(next); rows.push(next); ahead += rowHeight(next);
    }
    top = stream.getBoundingClientRect().top + scrollY;
    extent = rows.reduce((sum, row) => sum + rowHeight(row), 0);
    motion.resize();
    motion.scrollTo(top + center.offsetTop - (Number.isFinite(position?.offset) ? position.offset : 144), { immediate: true });
    physics.setRows(rows, top); accessibility(); working = false;
    loadNear();
  }

  function loadNear() {
    rows.forEach((row) => {
      const r = row.firstElementChild.getBoundingClientRect();
      if (r.bottom > -240 && r.top < innerHeight + 240) row.querySelectorAll("img[data-preview]").forEach(reveal);
    });
  }

  function recycle() {
    if (working || paused || !rows.length || innerWidth <= 900) return;
    working = true;
    let compensation = 0, changed = false, guard = 0;
    while (rows.length > 1 && top + rowExtent(rows[0]) < scrollY + compensation - buffer() && guard++ < 200) {
      const first = rows.shift(), previous = rowHeight(first);
      first.remove(); stream.append(row(Number(rows.at(-1).dataset.sequence) + 1, first)); rows.push(first);
      extent += rowHeight(first) - previous; compensation -= previous; changed = true;
    }
    guard = 0;
    while (top > scrollY + compensation - buffer() && guard++ < 200) {
      const last = rows.at(-1), lastTop = top + extent - rowHeight(last);
      const reuse = rows.length > columns * 2 && lastTop > scrollY + compensation + innerHeight + buffer();
      const next = reuse ? rows.pop() : null;
      if (next) { extent -= rowHeight(next); next.remove(); }
      const previous = row(Number(rows[0].dataset.sequence) - 1, next);
      stream.prepend(previous); rows.unshift(previous); const advance = rowHeight(previous);
      extent += advance; compensation += advance; changed = true;
    }
    guard = 0;
    while (top + extent < scrollY + compensation + innerHeight + buffer() && guard++ < 200) {
      const next = row(Number(rows.at(-1).dataset.sequence) + 1);
      stream.append(next); rows.push(next); extent += rowHeight(next); changed = true;
    }
    if (changed) { motion.rebase(compensation); physics.setRows(rows, top); }
    working = false; loadNear(); accessibility();
  }

  function select() {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    selected = items.filter((item) => (kind === "all" || item.kind === kind) && terms.every((term) => normalize([item.archiveTitle, item.alt, item.caption, kinds[item.kind], groups[item.kind]].filter(Boolean).join(" ")).includes(term)));
    if (order !== "archive") selected.sort((a, b) => collator.compare(a.archiveTitle, b.archiveTitle) * (order === "za" ? -1 : 1));
    stream.dataset.total = selected.length;
    status.textContent = `${selected.length} ${selected.length === 1 ? "pieza" : "piezas"}`;
    reset.hidden = !query && kind === "all";
  }

  function syncControls() {
    search.value = query;
    controls.querySelectorAll("[data-density]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.density) === columns)));
    controls.querySelectorAll("[data-personal-menu]").forEach((menu) => {
      const value = menu.dataset.personalMenu === "kind" ? kind : order;
      const input = menu.querySelector(`input[value="${CSS.escape(value)}"]`);
      if (input) { input.checked = true; menu.querySelector("[data-menu-label]").textContent = input.nextElementSibling.textContent; }
    });
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ signature, columns, query, kind, order, position: anchor() })); } catch { /* Optional session memory. */ }
  }
  function update() { physics.reset(); select(); syncControls(); render(); save(); }
  let searchTimer;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer); searchTimer = setTimeout(() => { query = search.value; update(); }, 160);
  });
  controls.addEventListener("submit", (event) => event.preventDefault());
  controls.addEventListener("change", (event) => {
    if (!event.target.matches("input[type=radio]")) return;
    if (event.target.name === "personal-kind") kind = event.target.value;
    else order = event.target.value;
    update();
    const menu = event.target.closest("details"); menu.open = false; menu.querySelector("summary").focus({ preventScroll: true });
  });
  controls.addEventListener("click", (event) => {
    const density = event.target.closest("[data-density]");
    if (density) {
      const position = anchor(); columns = Number(density.dataset.density);
      syncControls(); render(position); save();
    }
    if (event.target.closest("[data-personal-reset]")) { query = ""; kind = "all"; update(); search.focus(); }
  });
  stream.addEventListener("click", (event) => {
    const open = event.target.closest(".personal-archive__open");
    if (!open) return;
    const cell = open.closest("[data-item-sequence]"); openerSequence = Number(cell.dataset.itemSequence);
    open.focus({ preventScroll: true }); gallery.open(selected, modulo(openerSequence, selected.length));
  });
  stream.addEventListener("focusin", accessibility);
  stream.addEventListener("keydown", (event) => {
    if (!event.target.matches(".personal-archive__open") || event.altKey || event.metaKey || event.ctrlKey) return;
    const sequence = Number(event.target.closest("[data-item-sequence]").dataset.itemSequence);
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
    if (!delta) return;
    event.preventDefault(); const next = stream.querySelector(`[data-item-sequence="${sequence + delta}"] .personal-archive__open`);
    if (next) { next.focus({ preventScroll: true }); const r = next.getBoundingClientRect(); if (r.top < 32 || r.bottom > innerHeight - 32) motion.scrollTo(scrollY + r.top - 144, { immediate: true }); recycle(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
    const menu = document.querySelector("[data-personal-menu][open]");
    if (menu) { menu.open = false; menu.querySelector("summary").focus(); return; }
    if (event.target.closest("input,textarea,select")) return;
    location.href = document.querySelector("[data-close-personal]").href;
  });
  window.addEventListener("resize", () => {
    if (paused || innerWidth <= 900) { pendingResize = true; return; }
    if (width === innerWidth && !pendingResize) { motion.resize(); recycle(); return; }
    const position = anchor(); cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { render(position); pendingResize = false; });
  }, { passive: true });
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", (event) => { if (event.persisted) { motion.resize(); recycle(); } });
  history.scrollRestoration = "manual";
  await document.fonts.ready;
  controls.querySelectorAll("input,button").forEach((control) => { control.disabled = false; });
  select(); syncControls(); render(saved.position);
  await waitForImages(stream);
}

try { initShell(); await initArchive(); }
catch {
  controls.querySelectorAll("input,button").forEach((control) => { control.disabled = true; });
  status.textContent = "Mostrando la selección disponible. Recargá para activar búsqueda y vistas.";
}
finally { complete(); }
