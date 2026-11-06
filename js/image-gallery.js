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
  return localURL(item.original || item.src)?.pathname || "";
}

/** A bounded, repeating filmstrip. Wheel and drag move linearly; arrows move one image. */
export function createImageGallery({ onOpen, onClose } = {}) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let dialog = null;
  let viewport, track, name, counter, download;
  let items = [];
  let slots = [];
  let position = 0;
  let frame = 0;
  let animation = 0;
  let drag = null;
  let widths = [];
  let centers = [];
  let cycleWidth = 1;
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
    const height = Math.max(1, viewport.clientHeight - 32);
    widths = items.map((item) => Math.max(width / items.length, Math.min(width, height * ((item.w || 1) / (item.h || 1)) + 32)));
    let offset = 0;
    centers = widths.map((itemWidth) => { const center = offset + itemWidth / 2; offset += itemWidth; return center; });
    cycleWidth = offset;
    slots.forEach((slot, i) => { slot.style.flexBasis = `${widths[i % items.length]}px`; });
    position = centers[index] || 0;
    render();
  }

  function busy() {
    const image = slots[activeSlot()]?.querySelector("img");
    viewport.setAttribute("aria-busy", String(Boolean(image && !image.complete)));
  }

  function render() {
    frame = 0;
    if (!dialog?.open || !items.length) return;
    const phase = modulo(position, cycleWidth);
    const index = nearest();
    const item = items[index];
    track.style.transform = `translate3d(${-(cycleWidth + phase - viewport.clientWidth / 2)}px, 0, 0)`;
    const current = activeSlot();
    slots.forEach((slot, i) => {
      slot.setAttribute("aria-hidden", String(i !== current));
      if (Math.abs(i - current) <= 1) slot.querySelector("img").loading = "eager";
    });
    name.textContent = item.name || "";
    name.hidden = !item.name;
    const label = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    if (counter.textContent !== label) counter.textContent = label;
    dialog.dataset.index = index;
    const source = localURL(item.original || item.src);
    download.href = source.href;
    download.download = decodeURIComponent(source.pathname.split("/").at(-1));
    busy();
  }

  function queueRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

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
    dialog.setAttribute("aria-label", "Visor de imágenes");
    const header = element("div", "image-gallery__header");
    name = element("h2", "image-gallery__name");
    counter = element("output", "image-gallery__counter");
    counter.setAttribute("aria-live", "polite");
    counter.setAttribute("aria-label", "Imagen actual y total");
    const close = element("button", "image-gallery__control image-gallery__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar imágenes");
    close.addEventListener("click", () => dialog.close());
    header.append(name, counter, close);
    viewport = element("div", "image-gallery__viewport");
    viewport.dataset.cursorInteractive = "";
    track = element("div", "image-gallery__track");
    viewport.append(track);
    const footer = element("div", "image-gallery__footer");
    const previous = element("button", "image-gallery__control", "←");
    const next = element("button", "image-gallery__control", "→");
    previous.type = next.type = "button";
    previous.dataset.galleryPrevious = "";
    next.dataset.galleryNext = "";
    previous.setAttribute("aria-label", "Imagen anterior");
    next.setAttribute("aria-label", "Imagen siguiente");
    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    download = element("a", "image-gallery__download", "Descargar");
    download.setAttribute("aria-label", "Descargar imagen en calidad original");
    footer.append(previous, next, download);
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
      if (event.button !== 0 || !items.length) return;
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
    if (!dialog) build();
    const initialIndex = Math.max(0, items.findIndex((item) => imageKey(item) === chosenKey));
    const fragment = document.createDocumentFragment();
    slots = [];
    for (let cycle = 0; cycle < 3; cycle += 1) items.forEach((item) => {
      const slot = element("div", "image-gallery__slide");
      const image = document.createElement("img");
      const largest = [...(item.sources || [])].sort((a, b) => b.w - a.w)[0];
      image.src = localURL(largest?.src || item.src).href;
      image.alt = item.alt || item.name || "";
      image.decoding = "async";
      image.loading = "lazy";
      image.draggable = false;
      image.addEventListener("load", busy);
      image.addEventListener("error", () => { slot.classList.add("image-gallery__slide--error"); busy(); });
      slot.append(image);
      slots.push(slot);
      fragment.append(slot);
    });
    track.replaceChildren(fragment);
    onOpen?.();
    if (!dialog.open) dialog.showModal();
    layout(initialIndex);
  }
  return { open };
}
