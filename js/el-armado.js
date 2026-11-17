import { initShell } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";
import { createImageZoom } from "./image-zoom.js";
import { initArchivePhysics } from "./archive-physics.js";
import { createArmadoLoop } from "./el-armado-loop.js";

const complete = startLoading("Cargando El Armado");
const physics = initArchivePhysics();
let loop;
const motion = initSmoothScroll({ onFrame: (frame) => {
  loop?.recycle();
  if (!loop?.paused) physics.feed(frame);
} });
loop = createArmadoLoop({ main: document.querySelector("main"), motion, physics });
const zoom = createImageZoom({
  onOpen: () => { loop.pause(); motion.stop(); },
  onClose: () => requestAnimationFrame(() => { loop.resume(); motion.start(); }),
});

document.addEventListener("click", (event) => {
  if (event.target.closest('.skip-link[href="#main-content"]')) {
    event.preventDefault();
    document.querySelector("main").focus({ preventScroll: true });
    return;
  }
  const button = event.target.closest("[data-zoom-original]");
  if (!button) return;
  zoom.open({
    src: button.dataset.zoomOriginal,
    alt: button.dataset.zoomAlt || button.querySelector("img")?.alt,
  });
});

try {
  initShell();
  await document.fonts.ready;
  loop.start();
  await waitForImages();
  motion.resize();
} finally {
  complete();
}
