import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageZoom } from "./image-zoom.js";
import { initArchivePhysics } from "./archive-physics.js";
import { createEditorialLoop } from "./project-editorial-loop.js";
import { initProjectVideos } from "./project-videos.js";

const main = document.querySelector("main");
const complete = startLoading(`Cargando ${document.body.dataset.projectName}`);
const physics = initArchivePhysics();
const videos = initProjectVideos(main);
let loop;
const motion = initSmoothScroll({ onFrame: (frame) => {
  loop?.recycle();
  if (!loop?.paused) physics.feed(frame);
} });
loop = createEditorialLoop({ main, motion, physics });
const pause = () => { videos.pause(); loop.pause(); motion.stop(); };
const resume = () => requestAnimationFrame(() => { loop.resume(); videos.resume(); motion.start(); });
const zoom = createImageZoom({ onOpen: pause, onClose: resume });
const galleries = new Map();
const requests = new WeakMap();
let gallery;

function previewImage(item) {
  const image = new Image();
  image.src = item.src;
  image.alt = item.alt;
  image.width = item.w;
  image.height = item.h;
  image.decoding = "async";
  if (item.sources.length) {
    image.srcset = item.sources.map((source) => `${source.src} ${source.w}w`).join(", ");
    image.sizes = "(min-width: 934px) 400px, calc((100vw - 134px) / 2)";
  }
  return image;
}

function label(board, index) {
  const items = galleries.get(board.dataset.editorialGallery);
  board.dataset.galleryIndex = index;
  board.querySelector("[data-gallery-label]").textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")} · ${items[index].name}`;
  board.querySelector("[data-gallery-open]").setAttribute("aria-label", `Abrir carrusel: ${items[index].name}`);
  board.querySelectorAll('[data-gallery-select]').forEach((button, n) => {
    const selected = n === index;
    button.setAttribute('aria-pressed', String(selected));
    // A fixed four-slot rail avoids resizing the editorial card on each selection.
    button.hidden = n < Math.floor(index / 4) * 4 || n >= Math.floor(index / 4) * 4 + 4;
  });
}

async function step(board, direction, selected) {
  const items = galleries.get(board.dataset.editorialGallery);
  const state = requests.get(board) || { index: Number(board.dataset.galleryIndex), token: 0 };
  state.index = selected ?? (state.index + direction + items.length) % items.length;
  const token = ++state.token;
  requests.set(board, state);
  const image = previewImage(items[state.index]);
  const index = state.index;
  const stage = board.querySelector(".editorial-multimedia__stage");
  const timer = setTimeout(() => { if (state.token === token) stage.setAttribute("aria-busy", "true"); }, 120);
  try {
    await image.decode();
    if (state.token !== token) return;
    board.querySelector("[data-gallery-open]").replaceChildren(image);
    label(board, index);
  } catch {
    if (state.token === token) board.querySelector("[data-gallery-label]").textContent = "No se pudo cargar la foto. Probá con la siguiente.";
  } finally {
    clearTimeout(timer);
    if (state.token === token) stage.removeAttribute("aria-busy");
  }
}

async function prepareMultimedia() {
  const boards = [...main.querySelectorAll("[data-editorial-gallery]")];
  if (!boards.length) return;
  const { createImageGallery } = await import("./image-gallery.js");
  gallery = createImageGallery({ onOpen: pause, onClose: resume, downloads: false });
  for (const board of boards) {
    const items = [...board.querySelectorAll("figure")].map((figure) => {
      const image = figure.querySelector("img");
      const original = figure.querySelector("[data-zoom-original]")?.dataset.zoomOriginal;
      if (!original) return null;
      const w = Number(image.getAttribute("width")), h = Number(image.getAttribute("height"));
      return {
        src: image.getAttribute("src"), original, w, h, alt: image.alt,
        name: figure.querySelector("figcaption")?.textContent.trim() || "Fotografía",
        sources: (image.getAttribute("srcset") || "").split(",").filter(Boolean).map((source) => {
          const [src, size] = source.trim().split(/\s+/); const width = parseInt(size, 10);
          return { src, w: width, h: width * h / w };
        }),
      };
    }).filter(Boolean);
    if (!items.length) continue;
    const key = board.dataset.editorialGallery;
    galleries.set(key, items);
    const source = document.createElement("div");
    source.hidden = true;
    source.className = "editorial-photo-source";
    source.append(...board.children);
    const stage = document.createElement("div");
    stage.className = "editorial-multimedia__stage";
    const open = document.createElement("button");
    open.className = "editorial-multimedia__open";
    open.type = "button";
    open.dataset.galleryOpen = key;
    open.dataset.cursorAction = "Abrir carrusel";
    open.setAttribute("aria-haspopup", "dialog");
    open.append(previewImage(items[0])); stage.append(open);
    const controls = document.createElement("div");
    controls.className = "editorial-multimedia__controls";
    if (items.length === 1) controls.classList.add('editorial-multimedia__controls--single');
    for (const direction of [-1, 1]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "editorial-multimedia__arrow";
      button.dataset.galleryStep = direction;
      button.textContent = direction < 0 ? "←" : "→";
      button.setAttribute("aria-label", direction < 0 ? "Foto anterior" : "Foto siguiente");
      button.hidden = items.length < 2;
      controls.append(button);
      if (direction < 0) {
        const output = document.createElement("output");
        output.className = "editorial-multimedia__label";
        output.dataset.galleryLabel = "";
        output.setAttribute("aria-live", "polite");
        controls.append(output);
      }
    }
    board.className = "editorial-multimedia";
    board.append(source, stage, controls);
    if (board.hasAttribute('data-gallery-thumbnails') && items.length > 1) {
      board.classList.add('editorial-multimedia--thumbnails');
      const rail = document.createElement('div');
      rail.className = 'editorial-multimedia__thumbnails';
      rail.setAttribute('role', 'group');
      rail.setAttribute('aria-label', 'Elegir fotografía');
      items.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'editorial-multimedia__thumbnail';
        button.dataset.gallerySelect = index;
        button.setAttribute('aria-label', item.name);
        const thumb = previewImage(item);
        // Thumbnails use their smallest source, never the fullscreen asset.
        thumb.removeAttribute('srcset');
        thumb.src = item.sources[0]?.src || item.src;
        thumb.loading = 'lazy';
        button.append(thumb); rail.append(button);
      });
      stage.append(rail);
    }
    label(board, 0);
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest('.skip-link[href="#main-content"]')) {
    event.preventDefault(); main.focus({ preventScroll: true }); return;
  }
  if (event.target.closest("[data-editorial-start]")) {
    event.preventDefault(); loop.goTo("intro"); main.focus({ preventScroll: true }); return;
  }
  const next = event.target.closest("[data-gallery-step]");
  if (next) { step(next.closest("[data-editorial-gallery]"), Number(next.dataset.galleryStep)); return; }
  const selected = event.target.closest('[data-gallery-select]');
  if (selected) { step(selected.closest('[data-editorial-gallery]'), 0, Number(selected.dataset.gallerySelect)); return; }
  const open = event.target.closest("[data-gallery-open]");
  if (open) {
    open.focus({ preventScroll: true });
    const board = open.closest("[data-editorial-gallery]");
    gallery.open(galleries.get(board.dataset.editorialGallery), Number(board.dataset.galleryIndex));
    return;
  }
  const button = event.target.closest("[data-zoom-original]");
  if (button) zoom.open({ src: button.dataset.zoomOriginal, alt: button.dataset.zoomAlt || button.querySelector("img")?.alt });
});
document.addEventListener("keydown", (event) => {
  const board = event.target.closest("[data-editorial-gallery]");
  if (!board || event.ctrlKey || event.metaKey || event.altKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault(); step(board, event.key === "ArrowLeft" ? -1 : 1);
});

try {
  initShell();
  await document.fonts.ready;
  await prepareMultimedia();
  loop.start();
  await waitForImages();
  motion.resize();
} finally { complete(); }
