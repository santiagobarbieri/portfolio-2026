// Physical supports built with CSS: the supplied artwork remains an untouched image.
export function createMediumCollection({ items, medium = "book", title, onOpen, renderNotes }) {
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const root = element("section", "medium-collection");
  root.dataset.medium = medium;
  root.setAttribute("aria-label", title);
  const stage = element("div", "medium-collection__stage");
  const previousPreview = element("button", "medium-collection__neighbor");
  const nextPreview = element("button", "medium-collection__neighbor");
  previousPreview.type = nextPreview.type = "button";
  const center = element("div", "medium-collection__center");
  const object = element("div", "medium-object");
  const back = element("span", "medium-object__back");
  const spine = element("span", "medium-object__spine");
  const pages = element("span", "medium-object__pages");
  const bottom = element("span", "medium-object__bottom");
  [back, spine, pages, bottom].forEach((node) => node.setAttribute("aria-hidden", "true"));
  const open = element("button", "medium-object__front");
  open.type = "button";
  open.setAttribute("aria-haspopup", "dialog");
  open.dataset.cursorAction = "Ampliar original";
  object.append(back, spine, pages, bottom, open);
  center.append(object);
  stage.append(previousPreview, center, nextPreview);
  const toolbar = element("div", "medium-collection__toolbar");
  const previous = element("button", "medium-collection__arrow", "←");
  const next = element("button", "medium-collection__arrow", "→");
  previous.type = next.type = "button";
  previous.setAttribute("aria-label", "Pieza anterior");
  next.setAttribute("aria-label", "Pieza siguiente");
  previous.dataset.cursorAction = "Anterior";
  next.dataset.cursorAction = "Siguiente";
  const caption = element("p", "medium-collection__caption");
  caption.setAttribute("aria-live", "polite");
  const counter = element("span", "medium-collection__counter");
  const name = element("span", "medium-collection__name");
  caption.append(counter, name);
  toolbar.append(previous, caption, next);
  const rotate = element("button", "medium-collection__rotate", "Girar soporte ↻");
  rotate.type = "button";
  rotate.dataset.cursorAction = "Girar soporte";
  const hint = element("p", "medium-collection__hint", "Maqueta digital · arrastrá la pieza para girarla");
  const index = element("div", "medium-collection__index project-poster-grid");
  index.setAttribute("role", "group");
  index.setAttribute("aria-label", "Elegir pieza de la colección");
  const details = element("details", "medium-collection__details");
  const summary = element("summary", "tab", medium === "book" ? "Ficha de la portada" : "Ficha del afiche");
  const notes = element("div", "medium-collection__notes");
  details.append(summary, notes);
  root.append(stage, toolbar, rotate, hint);
  if (renderNotes) root.append(details);
  root.append(index);
  let current = 0;
  let angle = -22;
  let gesture = null;
  let dragged = false;

  function image(item, small = false) {
    const img = element("img");
    const preview = [...(item.sources || [])].sort((a, b) => a.w - b.w)[0];
    img.src = preview?.src || item.src;
    img.alt = item.alt || item.name || "";
    img.width = item.w;
    img.height = item.h;
    img.decoding = "async";
    img.loading = small ? "lazy" : "eager";
    img.draggable = false;
    return img;
  }
  function orient() {
    object.style.setProperty("--object-angle", `${angle}deg`);
  }
  function select(value) {
    current = (value + items.length) % items.length;
    const item = items[current];
    angle = -22;
    orient();
    object.style.setProperty("--object-ratio", `${item.w} / ${item.h}`);
    const base = item.colors?.find((color) => /negro|fondo|vino/i.test(color.name))?.hex || "#242424";
    if (/^#[0-9a-f]{6}$/i.test(base)) object.style.setProperty("--object-ink", base);
    open.replaceChildren(image(item));
    open.setAttribute("aria-label", `Ampliar ${item.name}`);
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    name.textContent = item.name;
    for (const [button, offset] of [[previousPreview, -1], [nextPreview, 1]]) {
      const neighbor = items[(current + offset + items.length) % items.length];
      button.replaceChildren(image(neighbor, true));
      button.setAttribute("aria-label", `Ver ${neighbor.name}`);
      button.dataset.cursorAction = "Ver pieza";
      button.hidden = items.length < 2;
    }
    previous.hidden = next.hidden = items.length < 2;
    [...index.children].forEach((button, i) => button.setAttribute("aria-pressed", String(i === current)));
    if (renderNotes) {
      notes.replaceChildren();
      renderNotes(item, notes);
    }
  }
  items.forEach((item, i) => {
    const button = element("button", "medium-collection__thumbnail");
    button.type = "button";
    button.setAttribute("aria-label", `Ver ${item.name} sobre ${medium === "book" ? "libro" : "papel"}`);
    button.dataset.cursorAction = "Ver pieza";
    button.append(image(item, true), element("span", null, item.name));
    button.addEventListener("click", () => select(i));
    index.append(button);
  });
  previous.addEventListener("click", () => select(current - 1));
  next.addEventListener("click", () => select(current + 1));
  previousPreview.addEventListener("click", () => select(current - 1));
  nextPreview.addEventListener("click", () => select(current + 1));
  rotate.addEventListener("click", () => { angle = angle < 0 ? 28 : angle > 0 ? 0 : -22; orient(); });
  open.addEventListener("click", (event) => {
    if (dragged) { event.preventDefault(); return; }
    onOpen(items[current]);
  });
  center.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragged = false;
    gesture = { id: event.pointerId, x: event.clientX, angle };
  });
  window.addEventListener("pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const distance = event.clientX - gesture.x;
    if (Math.abs(distance) > 6) {
      dragged = true;
      center.setPointerCapture(event.pointerId);
      object.classList.add("medium-object--dragging");
    }
    if (dragged) { angle = Math.max(-48, Math.min(48, gesture.angle + distance * 0.25)); orient(); }
  });
  const release = () => { gesture = null; object.classList.remove("medium-object--dragging"); setTimeout(() => { dragged = false; }, 0); };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  center.addEventListener("lostpointercapture", release);
  root.addEventListener("keydown", (event) => {
    if (!event.target.closest(".medium-collection__stage, .medium-collection__toolbar, .medium-collection__index")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      select(current + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  select(0);
  return root;
}
