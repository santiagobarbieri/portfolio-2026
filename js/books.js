import { initShell, setProjectTitle } from "./shell.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";

const content = document.querySelector("[data-entry-content]");
const complete = startLoading("Cargando biblioteca");
const requested = new URLSearchParams(location.search).get("shelf");
const close = document.querySelector("[data-close-entry]");
if (requested) {
  close.href = "./books.html";
  close.setAttribute("aria-label", "Volver a la biblioteca Librería");
  close.dataset.cursorAction = "Volver a la biblioteca";
  const arrow = document.createElement("span");
  arrow.className = "entry-bar__back-icon";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "←";
  const label = document.createElement("span");
  label.textContent = "Librería";
  close.replaceChildren(arrow, label);
  document.body.classList.replace("books-page--library", "books-page--shelf");
} else close.dataset.cursorAction = "Volver al archivo";

function closeBooks(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const previous = document.referrer ? new URL(document.referrer) : null;
  const previousLibrary = previous?.pathname.endsWith("/books.html") && !previous.searchParams.has("shelf");
  const previousArchive = previous && /\/(?:index\.html|self-made\.html)?$/.test(previous.pathname);
  if (previous?.origin === location.origin && history.length > 1 && (requested ? previousLibrary : previousArchive)) {
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
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function renderLibrary(shelves) {
  const library = element("section", "book-library");
  const heading = element("header", "book-library__heading");
  heading.append(element("h1", null, "Librería"), element("p", null, "Tapas rediseñadas, organizadas por estantes."));
  library.append(heading);
  for (const entry of shelves) {
    const data = entry.shelf;
    const section = element("section", "book-library__shelf");
    const link = element("a", "book-library__link");
    link.href = `./books.html?shelf=${encodeURIComponent(entry.slug)}`;
    link.dataset.cursorAction = "Abrir estante";
    link.setAttribute("aria-label", `Abrir Estante ${data.number} — ${data.author || entry.title}`);
    const label = element("header", "book-library__label");
    label.append(element("span", "book-library__number", `Estante ${data.number}`), element("h2", "book-library__author", data.author || entry.title));
    if (Number.isInteger(data.bookCount)) label.append(element("span", "book-library__count", `${data.bookCount} tapas`));
    const preview = element("div", "book-library__preview");
    preview.setAttribute("aria-hidden", "true");
    for (const item of (data.preview || []).slice(0, 10)) {
      const volume = element("span", "book-library__volume");
      volume.style.setProperty("--volume-scale", Math.min(1, Math.max(0.6, item.scale || 1)));
      const image = element("img");
      image.src = item.src;
      image.alt = "";
      image.width = item.w;
      image.height = item.h;
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;
      volume.append(image);
      preview.append(volume);
    }
    link.append(label, preview);
    section.append(link);
    library.append(section);
  }
  content.classList.remove("entry-fallback");
  content.replaceChildren(library);
  document.body.classList.add("books-page--library");
  document.title = "Librería — Santiago Barbieri";
  initSmoothScroll();
}

try {
  initShell();
  const registry = await read("./data/projects.json");
  const shelves = registry.filter((entry) => entry.shelf?.number);
  if (!requested) renderLibrary(shelves);
  else {
    const entry = shelves.find((shelf) => shelf.slug === requested);
    if (!entry) throw new Error("Estante no encontrado");
    const [details, { createBookShelf }, { makePalette }, { collectProjectAssets }, { createImageGallery, imageKey }] = await Promise.all([
      read(entry.details), import("./book-shelf.js"), import("./project-palette.js"), import("./project-assets.js"), import("./image-gallery.js"),
    ]);
    const project = { ...entry, ...details };
    const assets = collectProjectAssets(project);
    const gallery = createImageGallery();
    const shelf = createBookShelf({ project, shelves, makePalette, onOpen: (item) => {
      const index = assets.findIndex((asset) => imageKey(asset) === imageKey(item));
      if (index >= 0) gallery.open(assets, index);
    } });
    document.body.classList.add("entry-page--shelf");
    content.classList.remove("entry-fallback");
    content.replaceChildren(shelf);
    setProjectTitle(project);
    document.querySelector('[data-entry-title]').textContent = project.title;
    const cover = document.createElement("meta");
    cover.setAttribute("property", "og:image");
    cover.content = new URL(project.cover, document.baseURI).href;
    document.head.append(cover);
  }
  document.querySelector('meta[property="og:title"]').content = document.title;
  await waitForImages(content);
} catch {
  document.body.classList.remove("entry-page--shelf");
  content.classList.add("entry-fallback");
  const back = element("a", "entry-fallback__link", "Volver a Librería");
  back.href = "./books.html";
  content.replaceChildren(element("h1", null, "No se pudo cargar la biblioteca"), element("p", null, "Recargá la página o volvé a Librería para elegir un estante."), back);
} finally { complete(); }
