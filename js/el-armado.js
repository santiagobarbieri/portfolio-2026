import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageZoom } from "./image-zoom.js";

// This case reads in the document flow; it does not initialize the folder stack.
const complete = startLoading("Cargando El Armado");
const motion = initSmoothScroll();
const zoom = createImageZoom({
  onOpen: () => motion.stop(),
  onClose: () => motion.start(),
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-zoom-original]");
  if (!button) return;
  zoom.open({
    src: button.dataset.zoomOriginal,
    alt: button.dataset.zoomAlt || button.querySelector("img")?.alt,
  });
});

try {
  initShell();
  await waitForImages();
  motion.resize();
} finally {
  complete();
}
