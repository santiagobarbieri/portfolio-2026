const modulo = (value, length) => ((value % length) + length) % length;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function localURL(path) {
  if (!path) return null;
  const url = new URL(path, document.baseURI);
  return url.origin === location.origin ? url : null;
}

export function imageKey(item) {
  const url = localURL(item.original || item.src);
  return url ? decodeURIComponent(url.pathname) : "";
}

function makeDownload(item, index) {
  const source = localURL(item.original || item.src);
  const filename = decodeURIComponent(source.pathname.split("/").at(-1));
  const format = filename.split(".").at(-1).toUpperCase();
  const name = item.name || `imagen ${String(index + 1).padStart(2, "0")}`;
  const link = element("a", "image-gallery__download");
  link.href = source.href;
  link.download = filename;
  link.setAttribute("aria-label", `Descargar ${name}: ${filename} — original ${format}`);
  link.dataset.cursorAction = `Descargar ${format}`;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "1.5");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5");
  icon.append(path);
  const detail = element("span", "image-gallery__download-info");
  detail.setAttribute("aria-hidden", "true");
  detail.append(element("span", "image-gallery__download-label", "Descargar original"), element("span", "image-gallery__download-file", `${format} · ${filename}`));
  link.append(icon, detail);
  return link;
}

/** One project-wide, bounded filmstrip; every image owns its caption and download. */
export function createImageGallery({ onOpen, onClose } = {}) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let dialog = null;
  let viewport, track, counter;
  let items = [];
  let slots = [];
  let widths = [];
  let centers = [];
  let sizes = [];
  let pixelWidths = [];
  let position = 0;
  let cycleWidth = 1;
  let frame = 0;
  let animation = 0;
  let drag = null;
  let destination = null;

  function nearest(value = position) {
    const phase = modulo(value, cycleWidth);
    let index = 0;
    let minimum = Infinity;
    centers.forEach((center, i) => {
      const raw = Math.abs(phase - center);
      const distance = Math.min(raw, cycleWidth - raw);
      if (distance < minimum) { minimum = distance; index = i; }
    });
    return index;
  }

  function activeSlot() {
    const index = nearest();
    return items.length + index + Math.round((modulo(position, cycleWidth) - centers[index]) / cycleWidth) * items.length;
  }

  function layout(index = nearest()) {
    if (!dialog?.open || !items.length) return;
    cancelAnimationFrame(animation);
    destination = null;
    const width = viewport.clientWidth;
    const imageHeight = Math.max(1, viewport.clientHeight - 80);
    sizes = items.map((item, index) => {
      const ratio = (item.w || 1) / (item.h || 1);
      const roleWidth = { compact: 400, medium: 640, wide: 960 }[item.size] || Infinity;
      const w = Math.min(Math.max(1, width - 32), imageHeight * ratio, pixelWidths[index], roleWidth);
      return { w, h: w / ratio };
    });
    widths = sizes.map(({ w }) => Math.max(width / items.length, w + 32));
    let offset = 0;
    centers = widths.map((itemWidth) => { const center = offset + itemWidth / 2; offset += itemWidth; return center; });
    cycleWidth = offset;
    slots.forEach(({ node, piece, frame }, i) => {
      const size = sizes[i % items.length];
      node.style.flexBasis = `${widths[i % items.length]}px`;
      piece.style.width = `${size.w}px`;
      frame.style.height = `${size.h}px`;
    });
    position = centers[index] || 0;
    render();
  }

  function busy() {
    const image = slots[activeSlot()]?.image;
    viewport.setAttribute("aria-busy", String(Boolean(image && !image.complete)));
  }

  function render() {
    frame = 0;
    if (!dialog?.open || !items.length) return;
    const phase = modulo(position, cycleWidth);
    const index = nearest();
    const translate = -(cycleWidth + phase - viewport.clientWidth / 2);
    track.style.transform = `translate3d(${translate}px, 0, 0)`;
    const current = activeSlot();
    slots.forEach(({ node, image, download }, i) => {
      const n = i % items.length;
      const left = Math.floor(i / items.length) * cycleWidth + centers[n] - widths[n] / 2 + translate;
      const visible = left + widths[n] > 0 && left < viewport.clientWidth;
      node.setAttribute("aria-hidden", String(!visible));
      node.toggleAttribute("data-current", i === current);
      // A partially visible neighbor remains clickable; tab only to fully visible icons.
      const pieceWidth = sizes[n].w;
      const right = left + (widths[n] + pieceWidth) / 2 - 8;
      download.tabIndex = visible && right - 44 >= 0 && right <= viewport.clientWidth ? 0 : -1;
      if (visible || Math.abs(i - current) <= 1) image.loading = "eager";
    });
    const label = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    if (counter.textContent !== label) counter.textContent = label;
    dialog.dataset.index = index;
    busy();
  }

  function queueRender() { if (!frame) frame = requestAnimationFrame(render); }

  function step(direction) {
    cancelAnimationFrame(animation);
    const from = position;
    const base = destination ?? position;
    const index = modulo(nearest(base) + direction, items.length);
    let to = Math.floor(base / cycleWidth) * cycleWidth + centers[index];
    if (direction > 0 && to <= base + 0.1) to += cycleWidth;
    if (direction < 0 && to >= base - 0.1) to -= cycleWidth;
    destination = to;
    if (reducedMotion.matches) { position = modulo(to, cycleWidth); destination = null; render(); return; }
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / 200);
      position = from + (to - from) * progress;
      render();
      if (progress < 1) animation = requestAnimationFrame(tick);
      else { animation = 0; position = modulo(to, cycleWidth); destination = null; }
    }
    animation = requestAnimationFrame(tick);
  }

  function build() {
    dialog = element("dialog", "image-gallery");
    dialog.setAttribute("aria-label", "Carrusel de imágenes del proyecto");
    const header = element("div", "image-gallery__header");
    counter = element("output", "image-gallery__counter");
    counter.setAttribute("aria-live", "polite");
    counter.setAttribute("aria-label", "Imagen actual y total");
    const close = element("button", "image-gallery__control image-gallery__close");
    close.append(element("span", "image-gallery__control-glyph", "×"));
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar imágenes");
    close.addEventListener("click", () => dialog.close());
    header.append(counter, close);
    viewport = element("div", "image-gallery__viewport");
    viewport.dataset.cursorInteractive = "";
    track = element("div", "image-gallery__track");
    viewport.append(track);
    const footer = element("div", "image-gallery__footer");
    const previous = element("button", "image-gallery__control");
    const next = element("button", "image-gallery__control");
    previous.append(element("span", "image-gallery__control-glyph", "←"));
    next.append(element("span", "image-gallery__control-glyph", "→"));
    previous.type = next.type = "button";
    previous.dataset.galleryPrevious = "";
    next.dataset.galleryNext = "";
    previous.setAttribute("aria-label", "Imagen anterior");
    next.setAttribute("aria-label", "Imagen siguiente");
    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    footer.append(previous, next);
    dialog.append(header, viewport, footer);
    document.body.append(dialog);
    viewport.addEventListener("wheel", (event) => {
      if (event.ctrlKey || !items.length) return;
      event.preventDefault();
      cancelAnimationFrame(animation);
      destination = null;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      position = modulo(position + delta * unit, cycleWidth);
      queueRender();
    }, { passive: false });
    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !items.length || event.target.closest("a, button")) return;
      cancelAnimationFrame(animation);
      destination = null;
      drag = { id: event.pointerId, x: event.clientX, position };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      position = drag.position + drag.x - event.clientX;
      queueRender();
    });
    function endDrag(event) {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      position = modulo(position, cycleWidth);
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    dialog.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        step(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    dialog.addEventListener("close", () => {
      cancelAnimationFrame(animation);
      cancelAnimationFrame(frame);
      frame = animation = 0;
      drag = null;
      destination = null;
      track.replaceChildren();
      slots = [];
      onClose?.();
    });
    new ResizeObserver(() => layout()).observe(viewport);
  }

  function open(collection, selected = 0) {
    const chosenKey = imageKey(collection[selected] || {});
    const seen = new Set();
    items = collection.filter((item) => {
      const key = imageKey(item);
      if (!key || !localURL(item.src) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (!items.length) return;
    const previews = items.map((item) => [...(item.sources || [])].sort((a, b) => b.w - a.w)[0]);
    pixelWidths = items.map((item, index) => {
      const src = localURL(previews[index]?.src || item.src);
      return /\.svg$/i.test(src.pathname) ? Infinity : previews[index]?.w || item.w || Infinity;
    });
    if (!dialog) build();
    const initialIndex = Math.max(0, items.findIndex((item) => imageKey(item) === chosenKey));
    const fragment = document.createDocumentFragment();
    slots = [];
    for (let cycle = 0; cycle < 3; cycle += 1) items.forEach((item, index) => {
      const slot = element("div", "image-gallery__slide");
      const piece = element("figure", "image-gallery__piece");
      const frame = element("div", "image-gallery__frame");
      const image = document.createElement("img");
      const largest = previews[index];
      image.src = localURL(largest?.src || item.src).href;
      image.alt = item.alt || item.name || "";
      image.decoding = "async";
      image.loading = "lazy";
      image.draggable = false;
      image.addEventListener("load", () => {
        if (!image.isConnected) return;
        let resize = false;
        if (!item.w || !item.h) { item.w = image.naturalWidth; item.h = image.naturalHeight; resize = true; }
        if (!/\.svg$/i.test(new URL(image.currentSrc || image.src).pathname) && image.naturalWidth > 0) {
          pixelWidths[index] = image.naturalWidth;
          if (sizes[index]?.w > image.naturalWidth) resize = true;
        }
        if (resize) layout();
        busy();
      });
      image.addEventListener("error", () => { slot.classList.add("image-gallery__slide--error"); busy(); });
      const caption = element("figcaption", "image-gallery__caption", item.name || String(index + 1).padStart(2, "0"));
      const download = makeDownload(item, index);
      frame.append(image, download);
      piece.append(frame, caption);
      slot.append(piece);
      slots.push({ node: slot, piece, frame, image, download });
      fragment.append(slot);
    });
    track.replaceChildren(fragment);
    onOpen?.();
    if (!dialog.open) dialog.showModal();
    layout(initialIndex);
  }
  return { open };
}
