import { createImageGallery } from "./image-gallery.js";

const modulo = (value, length) => ((value % length) + length) % length;

/** A quiet, arrow-driven preview in the folder; a full filmstrip on activation. */
export function initProjectMultimedia({ onOpen, onClose }) {
  const gallery = createImageGallery({ onOpen, onClose, downloads: false });
  document.querySelectorAll("[data-multimedia]").forEach((board) => {
    const source = board.querySelector(".folder-board__grid");
    const items = [...source.querySelectorAll(".folder-piece")].map((figure) => {
      const image = figure.querySelector("img");
      const original = figure.querySelector("[data-zoom-original]")?.dataset.zoomOriginal;
      if (!original) return null;
      return {
        src: image.getAttribute("src"), original, w: Number(image.getAttribute("width")), h: Number(image.getAttribute("height")),
        alt: image.alt, name: figure.querySelector("figcaption")?.textContent.trim(),
        sources: (image.getAttribute("srcset") || "").split(",").filter(Boolean).map((part) => {
          const [src, descriptor] = part.trim().split(/\s+/);
          const w = parseInt(descriptor, 10);
          return { src, w, h: w * Number(image.getAttribute("height")) / Number(image.getAttribute("width")) };
        }),
      };
    }).filter(Boolean);
    if (!items.length) return;
    let index = 0;
    let version = 0;
    const stage = document.createElement("div");
    stage.className = "folder-multimedia__stage";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "folder-multimedia__open";
    open.setAttribute("aria-haspopup", "dialog");
    open.dataset.cursorAction = "Abrir carrusel";
    open.addEventListener("click", () => {
      open.focus({ preventScroll: true });
      gallery.open(items, index);
    });
    stage.append(open);
    const controls = document.createElement("div");
    controls.className = "folder-multimedia__controls";
    const label = document.createElement("output");
    label.className = "folder-multimedia__label";
    label.setAttribute("aria-live", "polite");
    function control(direction, text) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "folder-multimedia__arrow";
      button.textContent = direction < 0 ? "←" : "→";
      button.setAttribute("aria-label", text);
      button.dataset.cursorAction = text;
      button.addEventListener("click", () => show(index + direction));
      return button;
    }
    const previous = control(-1, "Foto anterior");
    const next = control(1, "Foto siguiente");
    controls.append(previous, label, next);
    board.addEventListener("keydown", (event) => {
      if (!event.target.closest(".folder-multimedia__stage, .folder-multimedia__controls") || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      show(index + (event.key === "ArrowLeft" ? -1 : 1));
    });
    async function show(requested) {
      index = modulo(requested, items.length);
      const token = ++version;
      const item = items[index];
      const image = new Image();
      image.alt = item.alt;
      image.decoding = "async";
      image.draggable = false;
      image.src = item.src;
      image.width = item.w;
      image.height = item.h;
      if (item.sources.length) {
        image.srcset = item.sources.map((source) => `${source.src} ${source.w}w`).join(", ");
        image.sizes = "min(1000px, 80vw)";
      }
      const busy = setTimeout(() => { if (token === version) stage.setAttribute("aria-busy", "true"); }, 120);
      try {
        await image.decode();
        if (token !== version) return;
        open.replaceChildren(image);
        open.setAttribute("aria-label", `Abrir carrusel: ${item.name || 'fotografía'}`);
        label.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")} · ${item.name || 'Fotografía'}`;
      } catch {
        if (token === version) label.textContent = "No se pudo cargar esta foto. Probá con la siguiente.";
      } finally {
        clearTimeout(busy);
        if (token === version) stage.removeAttribute("aria-busy");
      }
    }
    board.classList.add("folder-multimedia");
    source.hidden = true;
    board.prepend(stage);
    board.append(controls);
    show(0);
  });
}
