import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageZoom } from "./image-zoom.js";
import { createFolderStack } from "./project-folders.js";

const complete = startLoading("Cargando Club de Economía");
const stage = document.querySelector("[data-sheet-stage]");
const chapters = [...document.querySelectorAll("[data-sheet-section]")];
const counter = document.querySelector("[data-remaining]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const motion = initSmoothScroll({ onFrame: () => schedule() });
let frame = 0;
let resizeFrame = 0;
let initialized = false;
let zoomActive = false;
const zoom = createImageZoom({
  onOpen: () => { zoomActive = true; motion.stop(); },
  onClose: () => { motion.start(); requestAnimationFrame(() => { zoomActive = false; }); },
});
const folders = createFolderStack({ stage, chapters, motion, isZoomOpen: () => zoomActive, onChange: updateCounter });

function updateCounter(index) {
  const section = chapters[index];
  counter.textContent = `${index + 1}/${chapters.length}`;
  counter.setAttribute("aria-label", `Sección ${index + 1} de ${chapters.length}: ${section.dataset.sectionName}.`);
  stage.parentElement.dataset.activeSection = index;
}
function paint() {
  frame = 0;
  if (!initialized) return;
  if (folders.enabled) updateCounter(folders.paint());
  else {
    let active = 0;
    chapters.forEach((section, index) => { if (section.getBoundingClientRect().top <= innerHeight * .45) active = index; });
    updateCounter(active);
  }
}
function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
function measure(preserve = true) {
  if (reduced.matches) folders.disable();
  else { folders.enable(); folders.measure(preserve); }
  initialized = true;
  motion.resize();
  paint();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-zoom-original]");
  if (button) zoom.open({ src: button.dataset.zoomOriginal, alt: button.querySelector("img").alt || button.getAttribute("aria-label") });
  if (event.target.closest("[data-sheet-complete]")) {
    event.preventDefault();
    if (folders.enabled) folders.goTo(chapters.length - 1, true);
    else motion.scrollTo(chapters.at(-1).getBoundingClientRect().top + scrollY - 80, { immediate: true });
    const copy = chapters.at(-1).querySelector("[data-sheet-copy]");
    copy.tabIndex = -1;
    copy.focus({ preventScroll: true });
  }
});
window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => measure(true));
}, { passive: true });
reduced.addEventListener("change", () => measure(true));
window.addEventListener("pageshow", (event) => { if (event.persisted) measure(false); });
try {
  initShell();
  await document.fonts.ready;
  await waitForImages();
  measure(false);
} finally { complete(); }
