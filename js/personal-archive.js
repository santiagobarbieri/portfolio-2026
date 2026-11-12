import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageGallery, imageKey } from "./image-gallery.js";

const modulo = (value, length) => ((value % length) + length) % length;
const main = document.querySelector("main");
const stream = document.querySelector("[data-personal-stream]");
const view = document.body.dataset.personalView;
const storageKey = `portfolio:personal-grid:v1:${view}`;
const complete = startLoading(view === "all" ? "Cargando Obra propia" : "Cargando Posters");
const close = document.querySelector("[data-close-personal]");
close.dataset.cursorAction = "Volver al archivo";
function closeArchive(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const previous = document.referrer ? new URL(document.referrer) : null;
  if (previous?.origin === location.origin && /\/(?:index\.html|books\.html|posters\.html|self-made\.html)?$/.test(previous.pathname) && history.length > 1) {
    event.preventDefault(); history.back();
  } else if (event.type === "keydown") location.href = close.href;
}
close.addEventListener("click", closeArchive);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) closeArchive(event);
});
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function local(path) {
  if (!path) return null;
  const url = new URL(path, document.baseURI);
  return url.origin === location.origin ? url.href : null;
}
function readState() {
  try { return JSON.parse(sessionStorage.getItem(storageKey)) || {}; } catch { return {}; }
}

async function initGrid() {
  const response = await fetch("./data/personal-work.json", { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Archivo no disponible");
  const catalogue = await response.json();
  const seen = new Set();
  const items = catalogue.items.filter((item) => {
    const key = imageKey(item);
    if (!key || seen.has(key) || !local(item.src) || !local(item.thumbnail?.src) || !(item.w > 0 && item.h > 0) || view !== "all" && item.kind !== view) return false;
    seen.add(key);
    return true;
  });
  document.querySelector("[data-personal-status]").textContent = `${items.length} imágenes${items.length ? ". Usá las flechas para recorrer la grilla." : ""}`;
  stream.dataset.total = items.length;
  if (!items.length) return;

  const state = readState();
  let rows = [];
  let columns = 7;
  let rowHeight = 1;
  let startY = 0;
  let pristine = state.pristine !== false;
  let working = false;
  let width = innerWidth;
  let resizeFrame = 0;
  let openerSequence = null;
  const buffer = () => Math.max(400, innerHeight);
  const motion = initSmoothScroll({ onFrame: recycle });
  const gallery = createImageGallery({ onOpen: () => motion.stop(), onClose: () => {
    motion.start();
    const opener = stream.querySelector(`[data-item-sequence="${openerSequence}"] button`);
    (opener || main).focus({ preventScroll: true });
    recycle();
  } });
  stream.style.setProperty("--piece-ratio", Math.max(...items.map((item) => item.h / item.w)));
  stream.setAttribute("role", "grid");
  stream.setAttribute("aria-label", view === "all" ? "Obra propia: archivo visual infinito" : "Posters: archivo visual infinito");
  stream.setAttribute("aria-rowcount", "-1");

  function reveal(image) {
    if (image.hasAttribute("data-requested") || pristine && image.closest("[data-history]")) return;
    const item = items[Number(image.dataset.preview)];
    const media = image.parentElement;
    image.dataset.requested = "";
    media.setAttribute("aria-busy", "true");
    image.addEventListener("load", async () => {
      try { await image.decode(); } catch { /* Error state is handled below. */ }
      if (!image.isConnected) return;
      image.classList.add("is-ready");
      media.removeAttribute("aria-busy");
    }, { once: true });
    image.addEventListener("error", () => {
      media.removeAttribute("aria-busy"); media.dataset.error = "";
    }, { once: true });
    // Only near-screen cells receive a URL; native prefetch distance cannot load the catalogue.
    const preview = item.thumbnail;
    const sources = [preview, ...(item.sources || []).filter((source) => source.w <= 800 && source.w > preview.w)];
    image.sizes = `${Math.ceil(media.getBoundingClientRect().width)}px`;
    image.srcset = sources.map((source) => `${local(source.src)} ${source.w}w`).join(", ");
    image.src = local(preview.src);
    image.loading = "eager";
    observer?.unobserve(image);
  }
  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target); });
  }, { rootMargin: "240px 0px" }) : null;

  function makeCell(sequence) {
    const index = modulo(sequence, items.length);
    const item = items[index];
    const cell = element("figure", "personal-archive__cell");
    cell.dataset.itemSequence = sequence;
    cell.dataset.itemId = item.id;
    cell.setAttribute("role", "gridcell");
    const open = element("button", "personal-archive__open");
    open.type = "button";
    open.tabIndex = -1;
    open.setAttribute("aria-haspopup", "dialog");
    open.setAttribute("aria-label", `Abrir imagen ${String(index + 1).padStart(2, "0")}${item.name ? ` — ${item.name}` : ""}`);
    open.dataset.cursorAction = "Ampliar imagen";
    const media = element("span", "personal-archive__media");
    const image = element("img");
    image.width = item.w; image.height = item.h;
    image.alt = item.alt || item.name || "";
    image.decoding = "async";
    image.loading = "lazy";
    image.dataset.preview = index;
    media.append(image);
    open.append(media, element("span", "personal-archive__number", String(index + 1).padStart(2, "0")));
    cell.append(open);
    observer?.observe(image);
    return cell;
  }
  function makeRow(sequence, row = element("div", "personal-archive__row")) {
    row.querySelectorAll("img[data-preview]").forEach((image) => observer?.unobserve(image));
    row.dataset.sequence = sequence;
    row.toggleAttribute("data-history", sequence < 0);
    row.setAttribute("role", "row");
    row.replaceChildren(...Array.from({ length: columns }, (_, i) => makeCell(sequence * columns + i)));
    return row;
  }
  function loadNear() {
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      if (rect.bottom < -240 || rect.top > innerHeight + 240) return;
      row.querySelectorAll("img[data-preview]").forEach(reveal);
    });
  }
  function syncAccessibility() {
    const representatives = new Map();
    const bounds = new Map(rows.map((row) => [row, row.getBoundingClientRect()]));
    const top = innerWidth <= 600 ? 80 : 0;
    rows.forEach((row) => {
      const rect = bounds.get(row);
      const visible = !(pristine && row.hasAttribute("data-history")) && rect.bottom > top && rect.top < innerHeight;
      const hidden = String(!visible);
      if (row.getAttribute("aria-hidden") !== hidden) row.setAttribute("aria-hidden", hidden);
      if (!visible) return;
      [...row.children].forEach((cell) => {
        const current = representatives.get(cell.dataset.itemId);
        const distance = Math.abs(rect.top - innerHeight / 2);
        if (!current || distance < current.distance || cell.contains(document.activeElement)) representatives.set(cell.dataset.itemId, { cell, distance });
      });
    });
    rows.forEach((row) => [...row.children].forEach((cell) => {
      const open = cell.firstElementChild;
      const next = representatives.get(cell.dataset.itemId)?.cell === cell ? 0 : -1;
      if (open.tabIndex !== next) open.tabIndex = next;
    }));
  }
  function anchor() {
    const row = rows.find((row) => row.getBoundingClientRect().bottom > (innerWidth <= 600 ? 80 : 0)) || rows[0];
    if (!row) return {};
    return { itemSequence: Number(row.dataset.sequence) * columns, offset: scrollY - stream.offsetTop - row.offsetTop, rowHeight, pristine };
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(anchor())); } catch { /* Optional session memory. */ }
  }
  function render(position = {}) {
    working = true;
    columns = parseInt(getComputedStyle(document.body).getPropertyValue("--piece-columns"), 10);
    stream.setAttribute("aria-colcount", columns);
    const centerSequence = Number.isSafeInteger(position.itemSequence) ? Math.floor(position.itemSequence / columns) : 0;
    const center = makeRow(centerSequence);
    rows.forEach((row) => row.querySelectorAll("img[data-preview]").forEach((image) => observer?.unobserve(image)));
    stream.replaceChildren(center);
    rowHeight = center.getBoundingClientRect().height;
    const before = Math.ceil(buffer() / rowHeight) + 1;
    const after = Math.ceil((innerHeight + buffer()) / rowHeight) + 1;
    rows = Array.from({ length: before + after + 1 }, (_, i) => i === before ? center : makeRow(centerSequence - before + i));
    stream.replaceChildren(...rows);
    document.body.dataset.pristine = String(pristine);
    const offset = Number.isFinite(position.offset) && position.offset >= 0 ? position.offset * rowHeight / (position.rowHeight || rowHeight) : -stream.offsetTop;
    motion.resize();
    motion.scrollTo(stream.offsetTop + center.offsetTop + offset, { immediate: true });
    startY = scrollY;
    working = false;
    loadNear(); syncAccessibility();
  }
  function recycle() {
    if (working || !rows.length || document.querySelector("dialog[open]")) return;
    working = true;
    const zero = rows.find((row) => Number(row.dataset.sequence) === 0);
    if (pristine && (scrollY < startY - 1 || !zero || zero.getBoundingClientRect().bottom < 0)) {
      pristine = false; document.body.dataset.pristine = "false";
    }
    let compensation = 0, guard = 0;
    const top = stream.offsetTop;
    while (top + rowHeight < scrollY + compensation - buffer() && guard++ < 300) {
      const first = rows.shift();
      if (first.contains(document.activeElement)) main.focus({ preventScroll: true });
      stream.append(makeRow(Number(rows.at(-1).dataset.sequence) + 1, first));
      rows.push(first); compensation -= rowHeight;
    }
    guard = 0;
    while (top > scrollY + compensation - buffer() && guard++ < 300) {
      const last = rows.pop();
      if (last.contains(document.activeElement)) main.focus({ preventScroll: true });
      stream.prepend(makeRow(Number(rows[0].dataset.sequence) - 1, last));
      rows.unshift(last); compensation += rowHeight;
    }
    if (compensation) { startY += compensation; motion.rebase(compensation); }
    working = false;
    loadNear(); syncAccessibility();
  }
  stream.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-item-sequence]");
    if (!cell || !event.target.closest("button")) return;
    openerSequence = Number(cell.dataset.itemSequence);
    gallery.open(items, modulo(openerSequence, items.length));
  });
  stream.addEventListener("keydown", (event) => {
    const cell = event.target.closest("[data-item-sequence]");
    if (!cell || event.altKey || event.ctrlKey || event.metaKey) return;
    const sequence = Number(cell.dataset.itemSequence);
    const column = modulo(sequence, columns);
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns, Home: -column, End: columns - column - 1 };
    if (!(event.key in deltas)) return;
    event.preventDefault();
    const target = stream.querySelector(`[data-item-sequence="${sequence + deltas[event.key]}"] button`);
    if (!target) return;
    target.focus({ preventScroll: true });
    const rect = target.getBoundingClientRect();
    const top = innerWidth <= 600 ? 96 : 48;
    if (rect.top < top) motion.scrollTo(scrollY + rect.top - top, { immediate: true });
    else if (rect.bottom > innerHeight - 16) motion.scrollTo(scrollY + rect.bottom - innerHeight + 16, { immediate: true });
    recycle();
  });
  window.addEventListener("resize", () => {
    if (width === innerWidth) { recycle(); return; }
    width = innerWidth;
    const position = anchor();
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => render(position));
  }, { passive: true });
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    const nextColumns = parseInt(getComputedStyle(document.body).getPropertyValue("--piece-columns"), 10);
    if (nextColumns === columns) { motion.resize(); loadNear(); syncAccessibility(); }
    else { const state = readState(); pristine = state.pristine !== false; render(state); }
  });
  history.scrollRestoration = "manual";
  await document.fonts.ready;
  render(state);
  await waitForImages(stream);
}
try { initShell(); await initGrid(); }
catch { await waitForImages(stream); }
finally { complete(); }
