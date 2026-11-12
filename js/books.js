import { createBookShelf } from "./book-shelf.js";
import { makePalette } from "./project-palette.js";
import { collectProjectAssets } from "./project-assets.js";
import { createImageGallery, imageKey } from "./image-gallery.js";
import { initShell } from "./shell.js";
import { startLoading, waitForImages } from "./loading.js";

const content = document.querySelector("[data-entry-content]");
const complete = startLoading("Cargando biblioteca");
const close = document.querySelector("[data-close-entry]");
close.dataset.cursorAction = "Volver al archivo";
function closeBooks(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const previous = document.referrer ? new URL(document.referrer) : null;
  if (previous?.origin === location.origin && /\/(?:index\.html|self-made\.html|posters\.html)?$/.test(previous.pathname) && history.length > 1) {
    event.preventDefault(); history.back();
  } else if (event.type === "keydown") location.href = close.href;
}
close.addEventListener("click", closeBooks);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) closeBooks(event);
});
async function read(path) {
  const response = await fetch(new URL(path, document.baseURI), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Biblioteca no disponible");
  return response.json();
}
try {
  initShell();
  const registry = await read("./data/projects.json");
  const shelves = registry.filter((entry) => entry.shelf?.number);
  const requested = new URLSearchParams(location.search).get("shelf");
  const entry = requested ? shelves.find((shelf) => shelf.slug === requested) : shelves[0];
  if (!entry) throw new Error("Estante no encontrado");
  const project = { ...entry, ...await read(entry.details) };
  const assets = collectProjectAssets(project);
  const gallery = createImageGallery();
  const shelf = createBookShelf({ project, shelves, makePalette, onOpen: (item) => {
    const index = assets.findIndex((asset) => imageKey(asset) === imageKey(item));
    if (index >= 0) gallery.open(assets, index);
  } });
  document.body.classList.add("entry-page--shelf");
  content.classList.remove("entry-fallback");
  content.replaceChildren(shelf);
  document.title = `Books · ${project.title} — Santiago Barbieri`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  const cover = document.createElement("meta");
  cover.setAttribute("property", "og:image");
  cover.content = new URL(project.cover, document.baseURI).href;
  document.head.append(cover);
  document.querySelector('[data-entry-title]').textContent = "Books";
  await waitForImages(content);
} catch {
  content.classList.add("entry-fallback");
  content.querySelector("h1").textContent = "No se pudo cargar la biblioteca";
  content.querySelector("p").textContent = "Recargá la página o volvé al Archivo para intentarlo otra vez.";
} finally { complete(); }
