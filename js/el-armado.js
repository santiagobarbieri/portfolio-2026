import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { collectProjectAssets } from "./project-assets.js";
import { createImageGallery, imageKey } from "./image-gallery.js";

const complete = startLoading("Cargando El Armado");
const motion = initSmoothScroll();
const gallery = createImageGallery({ onOpen: () => motion.stop(), onClose: () => motion.start() });
const originals = {
  afiche: "FLYER A4 - EL ARMADO.png", marca: "Logo.png", sello: "Variante Logo.png",
  color: "Iconography 1.png", trazo: "Iconography 2.png", historia: "HISTORIA IG - EL ARMADO (1).png",
};
const previews = {
  afiche: ["afiche-1000.webp", 1000, 1415], marca: ["marca-863.webp", 863, 343],
  sello: ["sello-640.webp", 640, 640], color: ["ilustracion-color-760.webp", 760, 754],
  trazo: ["ilustracion-trazo-976.webp", 976, 813], historia: ["historia-800.webp", 800, 1422],
};
let assets = [];

function originalKey(key) {
  return imageKey({ src: `assets/images/el-armado/${originals[key]}` });
}
function initViewer() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-piece]");
    if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const index = assets.findIndex((item) => imageKey(item) === originalKey(link.dataset.piece));
    if (index < 0) return; // An original remains a working link if the catalogue fails.
    event.preventDefault();
    gallery.open(assets, index);
  });
}
function initDrawing() {
  const controls = document.querySelector("[data-drawing-controls]");
  const view = document.querySelector("[data-drawing-view]");
  const link = view.querySelector("a");
  const currentImage = view.querySelector("img");
  const caption = view.querySelector("figcaption");
  let request = 0;
  controls.hidden = false;
  controls.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-drawing]");
    if (!button || button.getAttribute("aria-pressed") === "true") return;
    const key = button.dataset.drawing;
    const revision = ++request;
    const [filename, w, h] = previews[key];
    const image = new Image();
    image.src = new URL(`../assets/images/el-armado-web/${filename}`, import.meta.url).href;
    view.setAttribute("aria-busy", "true");
    try {
      await image.decode();
      if (request !== revision) return;
      currentImage.src = image.src;
      currentImage.width = w;
      currentImage.height = h;
      currentImage.alt = key === "color" ? "Ilustración en color: manos, micrófono y botella" : "Ilustración en trazo blanco: manos, micrófono y botella";
      link.href = new URL(`../assets/images/el-armado/${originals[key]}`, import.meta.url).href;
      link.dataset.piece = key;
      link.setAttribute("aria-label", key === "color" ? "Ampliar ilustración en color" : "Ampliar ilustración en trazo blanco");
      caption.textContent = key === "color" ? "Ilustración en color" : "Ilustración en trazo blanco";
      controls.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    } catch { /* Keep the decoded illustration and original link. */ }
    finally { if (request === revision) view.removeAttribute("aria-busy"); }
  });
}
function initNavigation() {
  const links = [...document.querySelectorAll('.armado-navigation a')];
  function navigate(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    const offset = document.querySelector(".armado-header").offsetHeight;
    motion.scrollTo(target.getBoundingClientRect().top + scrollY - offset);
    history.replaceState(null, "", link.hash);
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  document.addEventListener("click", navigate);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    for (const link of links) {
      if (link.hash === `#${visible.target.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }, { rootMargin: "-115px 0px -50% 0px" });
  links.forEach((link) => observer.observe(document.getElementById(link.hash.slice(1))));
}

try {
  initShell();
  initNavigation();
  initDrawing();
  initViewer();
  try {
    const response = await fetch(new URL("../data/projects/el-armado.json", import.meta.url), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Catálogo no disponible");
    assets = collectProjectAssets(await response.json()).map((item) => {
      const key = Object.keys(originals).find((key) => originalKey(key) === imageKey(item));
      const preview = previews[key];
      return preview ? { ...item, original: item.original || item.src, src: `assets/images/el-armado-web/${preview[0]}`, w: preview[1], h: preview[2], sources: undefined } : item;
    });
  } catch { /* The complete static page and original image links stay usable. */ }
  await waitForImages();
  motion.resize();
} finally { complete(); }
