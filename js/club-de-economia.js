import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageZoom } from "./image-zoom.js";

const complete = startLoading("Cargando Club de Economía");
const sheet = document.querySelector("[data-sheet]");
const stage = document.querySelector("[data-sheet-stage]");
const chapters = [...document.querySelectorAll("[data-sheet-section]")];
const copies = chapters.map((chapter) => chapter.querySelector("[data-sheet-copy]"));
const counter = document.querySelector("[data-remaining]");
const introTitle = document.querySelector(".club-intro__title");
const desktop = matchMedia("(min-width: 1000px) and (min-height: 740px)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const motion = initSmoothScroll({ onFrame: () => schedule() });
let zoomActive = false;
const zoom = createImageZoom({
  onOpen: () => { zoomActive = true; motion.stop(); },
  onClose: () => { motion.start(); requestAnimationFrame(() => { zoomActive = false; }); },
});
const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, n));
const ease = (n) => n * n * (3 - 2 * n);
let layout = null;
let enhanced = false;
let initialized = false;
let frame = 0;
let resizeFrame = 0;
let phase = 0;
let active = 0;
let oldHeight = innerHeight;
let shownSection = -1;

function setBox(node, width) { node.style.width = `${width}px`; }
function pose(node, x, y, scale, reveal = 1) {
  node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  node.style.opacity = String(clamp(reveal * 2));
  node.style.pointerEvents = reveal > 0.05 ? "" : "none";
}
function measure(keepPosition = true) {
  const wasEnhanced = enhanced;
  const previousPhase = phase;
  const previousActive = active;
  enhanced = desktop.matches && !reduced.matches;
  document.body.classList.toggle("club-page--sheet", enhanced);
  for (const node of [...copies, ...document.querySelectorAll("[data-sheet-art]")]) node.removeAttribute("style");
  introTitle.removeAttribute("style");
  if (enhanced) {
    const style = getComputedStyle(document.documentElement);
    const left = parseFloat(style.getPropertyValue("--club-left")) / 100 * innerWidth;
    const copyWidth = Math.min(400, innerWidth * .2645);
    const gap = clamp(innerWidth * .0463, 40, 70);
    const rightMargin = clamp(innerWidth * .0873, 60, 132);
    const right = left + copyWidth + gap;
    const rightWidth = innerWidth - right - rightMargin;
    const top = innerWidth < 1200 ? 72 : 88;
    const available = innerHeight - top - 38;
    copies.forEach((node) => setBox(node, copyWidth));
    stage.style.removeProperty("--sheet-title-size");
    stage.style.removeProperty("--sheet-heading-size");
    let copyHeights = copies.map((node) => node.offsetHeight);
    const required = () => copyHeights.reduce((a, b) => a + b, 0) + 12 * (chapters.length - 1);
    const nominalTitle = parseFloat(getComputedStyle(copies[1].querySelector("h2")).fontSize);
    const excess = required() - available;
    if (excess > 0) {
      stage.style.setProperty("--sheet-title-size", `${Math.max(20, nominalTitle - excess / (chapters.length - 1) - 1)}px`);
      copyHeights = copies.map((node) => node.offsetHeight);
    }
    let headingSize = parseFloat(getComputedStyle(introTitle).fontSize);
    while (required() > available && headingSize > 28) {
      headingSize -= 2;
      stage.style.setProperty("--sheet-heading-size", `${headingSize}px`);
      copyHeights = copies.map((node) => node.offsetHeight);
    }
    const copyGap = Math.min(28, Math.max(12, (available - copyHeights.reduce((a, b) => a + b, 0)) / (chapters.length - 1)));
    const copyY = [top];
    for (let index = 1; index < chapters.length; index += 1) copyY.push(copyY[index - 1] + copyHeights[index - 1] + copyGap);
    const arts = [...stage.querySelectorAll("[data-sheet-art]")];
    for (const art of arts) setBox(art, rightWidth);
    setBox(arts[0], Math.min(400, rightWidth));
    setBox(arts[4], Math.min(500, rightWidth * .88));
    arts[1].style.setProperty("--process-height", `${Math.min(64, rightWidth * .09)}px`);
    arts[2].style.setProperty("--brand-size", `${Math.min(140, rightWidth * .27)}px`);
    arts[3].style.setProperty("--template-height", `${Math.min(180, rightWidth * .34)}px`);
    let artHeight = 0;
    const entries = arts.map((node, index) => {
      const entry = { node, section: index + 1, x: (rightWidth - node.offsetWidth) / 2, y: artHeight };
      artHeight += node.offsetHeight + (index < arts.length - 1 ? 24 : 0);
      return entry;
    });
    const artScale = Math.min(1, available / artHeight);
    const artX = right + (rightWidth - rightWidth * artScale) / 2;
    const step = innerHeight * .8;
    sheet.style.setProperty("--sheet-height", `${innerHeight + step * (chapters.length - 1)}px`);
    layout = { left, right, top, available, copyY, entries, artScale, artX, step, start: sheet.getBoundingClientRect().top + scrollY };
    if (initialized && keepPosition && (wasEnhanced !== enhanced || innerHeight !== oldHeight)) {
      const position = wasEnhanced ? previousPhase : previousActive;
      motion.scrollTo(layout.start + position * step, { immediate: true });
    }
  } else {
    sheet.style.removeProperty("--sheet-height");
    stage.style.removeProperty("--sheet-title-size");
    stage.style.removeProperty("--sheet-heading-size");
    layout = null;
    chapters.forEach((chapter, index) => {
      chapter.style.setProperty("--chapter-order", index + 1);
      const desired = 88 + index * 8;
      const height = chapter.getBoundingClientRect().height;
      chapter.style.setProperty("--mobile-sticky-top", `${Math.min(desired, innerHeight - height - 16)}px`);
    });
    if (initialized && wasEnhanced && keepPosition) {
      const chapter = chapters[Math.min(previousActive, chapters.length - 1)];
      motion.scrollTo(chapter.offsetTop - 100, { immediate: true });
    }
  }
  oldHeight = innerHeight;
  initialized = true;
  motion.resize();
  paint();
}
function updateCounter(index) {
  active = index;
  const value = index + 1;
  if (shownSection === value) return;
  shownSection = value;
  counter.textContent = `${value}/${chapters.length}`;
  counter.setAttribute("aria-label", `Sección ${value} de ${chapters.length}: ${chapters[index].dataset.sectionName}.`);
  sheet.dataset.activeSection = index;
}
function paint() {
  frame = 0;
  if (!initialized) return;
  if (!enhanced || !layout) {
    let index = 0;
    chapters.forEach((chapter, i) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= innerHeight * .55 && rect.bottom > 20) index = i;
    });
    updateCounter(index);
    return;
  }
  phase = clamp((scrollY - layout.start) / layout.step, 0, chapters.length - 1);
  const totalProgress = phase / (chapters.length - 1);
  pose(copies[0], layout.left, layout.top, 1);
  for (let i = 1; i < copies.length; i += 1) {
    const reveal = ease(clamp(phase - i + 1));
    const spread = (1 - totalProgress) * i * Math.min(90, layout.available * .12);
    const entry = (1 - reveal) * innerHeight * .45;
    pose(copies[i], layout.left, layout.copyY[i] + spread + entry, 1, reveal);
  }
  for (const piece of layout.entries) {
    const reveal = ease(clamp(phase - piece.section + 1));
    const spread = (1 - totalProgress) * (piece.section - 1) * 50;
    const entry = (1 - reveal) * innerHeight * .45;
    pose(piece.node, layout.artX + piece.x * layout.artScale, layout.top + piece.y * layout.artScale + spread + entry, layout.artScale, reveal);
  }
  updateCounter(Math.min(chapters.length - 1, Math.floor(phase + .3)));
  sheet.dataset.progress = totalProgress.toFixed(4);
}
function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
function goToChapter(index, immediate = false) {
  if (!initialized) return;
  if (enhanced) motion.scrollTo(layout.start + index * layout.step, { immediate });
  else motion.scrollTo(chapters[index].getBoundingClientRect().top + scrollY - 100, { immediate });
  if (immediate) paint();
}
function initInteraction() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-zoom-original]");
    if (button) {
      const image = button.querySelector("img");
      zoom.open({ src: button.dataset.zoomOriginal, alt: image.alt || button.getAttribute("aria-label") });
    }
    const completeLink = event.target.closest("[data-sheet-complete]");
    if (completeLink) {
      event.preventDefault();
      goToChapter(chapters.length - 1, true);
      copies[1].tabIndex = -1;
      copies[1].focus({ preventScroll: true });
    }
  });
  stage.addEventListener("focusin", (event) => {
    if (!enhanced || zoomActive) return;
    const chapter = event.target.closest("[data-sheet-section]");
    const index = chapters.indexOf(chapter);
    if (index > 0 && phase < index - .05 && event.target.matches(":focus-visible")) goToChapter(index, true);
  });
  stage.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => measure(false));
    }, { once: true });
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => measure(true));
  }, { passive: true });
  reduced.addEventListener("change", () => measure(true));
  desktop.addEventListener("change", () => measure(true));
  window.addEventListener("pageshow", (event) => { if (event.persisted) measure(false); });
}
try {
  initShell();
  await document.fonts.ready;
  chapters.forEach((chapter, index) => chapter.style.setProperty("--chapter-order", index + 1));
  initInteraction();
  measure(false);
  await waitForImages();
  motion.resize();
  paint();
} finally { complete(); }
