/** Individual client-work enlargement. No bank navigation or download controls. */
export function createImageZoom({ onOpen, onClose } = {}) {
  let dialog, figure, image, status, close, opener;
  let request = 0;
  function fit() {
    if (!dialog?.open || !image?.naturalWidth) return;
    const compact = innerWidth <= 600;
    const width = innerWidth - (compact ? 32 : 96);
    const height = innerHeight - (compact ? 80 : 96);
    const density = Math.max(1, devicePixelRatio || 1);
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight, 1 / density);
    image.style.setProperty("--zoom-width", `${image.naturalWidth * scale}px`);
    image.style.setProperty("--zoom-height", `${image.naturalHeight * scale}px`);
  }
  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "image-zoom";
    dialog.setAttribute("aria-label", "Ampliación de imagen");
    figure = document.createElement("figure");
    figure.className = "image-zoom__figure";
    image = document.createElement("img");
    image.className = "image-zoom__image";
    image.draggable = false;
    image.decoding = "async";
    close = document.createElement("button");
    close.className = "image-zoom__close";
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar ampliación");
    close.dataset.cursorAction = "Cerrar ampliación";
    const glyph = document.createElement("span");
    glyph.textContent = "×";
    glyph.setAttribute("aria-hidden", "true");
    close.append(glyph);
    figure.append(image, close);
    status = document.createElement("div");
    status.className = "image-zoom__status";
    status.setAttribute("role", "status");
    dialog.append(figure, status);
    if (document.querySelector("[data-sheet-stage]")) {
      const home = document.createElement("a");
      home.className = "image-zoom__home";
      home.href = "./index.html";
      home.setAttribute("aria-label", "Volver al archivo");
      home.dataset.cursorAction = "Volver al archivo";
      const mark = document.createElement("span");
      mark.className = "identity__glyph";
      mark.setAttribute("aria-hidden", "true");
      home.append(mark);
      dialog.append(home);
    }
    document.body.append(dialog);
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (!event.target.closest(".image-zoom__figure, .image-zoom__home, .image-zoom__error")) dialog.close();
    });
    dialog.addEventListener("close", () => {
      request += 1;
      image.removeAttribute("src");
      onClose?.();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    window.addEventListener("resize", fit, { passive: true });
  }
  async function open(item) {
    const source = new URL(item.original || item.src, document.baseURI);
    if (source.origin !== location.origin) return;
    if (!dialog) build();
    const revision = ++request;
    opener = document.activeElement;
    dialog.classList.remove("image-zoom--error");
    dialog.setAttribute("aria-busy", "true");
    const rose = document.createElement("span");
    rose.className = "image-zoom__rose";
    rose.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = "Cargando imagen";
    status.replaceChildren(rose, label);
    status.hidden = false;
    image.alt = item.alt || item.name || "Imagen del proyecto";
    image.src = source.href;
    onOpen?.();
    if (!dialog.open) dialog.showModal();
    close.focus({ preventScroll: true });
    try {
      await image.decode();
      if (revision !== request || !dialog.open) return;
      fit();
      dialog.removeAttribute("aria-busy");
      status.hidden = true;
    } catch {
      if (revision !== request || !dialog.open) return;
      dialog.classList.add("image-zoom--error");
      dialog.removeAttribute("aria-busy");
      image.removeAttribute("src");
      const text = document.createElement("p");
      text.className = "image-zoom__error";
      text.textContent = "No se pudo cargar la imagen. Cerrá la ampliación e intentá otra vez.";
      status.replaceChildren(text);
    }
  }
  return { open };
}
