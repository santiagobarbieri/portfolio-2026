// CSS 3D collection adapted from the local BOOKS interaction prototype.
// Only the front is supplied artwork; the other faces are neutral display supports.
export function createBookShelf({ project, makePalette, onOpen }) {
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const button = (className, text, action) => {
    const node = element("button", className, text);
    node.type = "button";
    node.setAttribute("aria-label", action);
    node.dataset.cursorAction = action;
    return node;
  };
  const image = (item, eager = false) => {
    const node = element("img");
    node.src = item.src;
    node.alt = item.alt || "";
    node.width = item.w;
    node.height = item.h;
    node.loading = eager ? "eager" : "lazy";
    node.decoding = "async";
    node.draggable = false;
    if (item.sources?.length) {
      node.srcset = item.sources.map((source) => `${source.src} ${source.w}w`).join(", ");
      node.sizes = "(max-width: 600px) 70vw, 400px";
    }
    return node;
  };
  const root = element("article", "book-shelf");
  root.dataset.lenisPrevent = "";
  root.dataset.index = "0";
  const heading = element("header", "book-shelf__heading");
  heading.append(element("h1", null, project.title), element("p", null, "Passion project · Diseño editorial"));
  const stage = element("div", "book-shelf__stage");
  stage.setAttribute("aria-label", "Estante de libros: elegí una tapa o arrastrá el libro central para girarlo");
  const track = element("div", "book-shelf__track");
  stage.append(track);
  const previous = button("book-shelf__arrow", "←", "Libro anterior");
  const next = button("book-shelf__arrow", "→", "Libro siguiente");
  previous.classList.add("book-shelf__arrow--previous");
  next.classList.add("book-shelf__arrow--next");
  const toolbar = element("div", "book-shelf__toolbar");
  const caption = element("p", "book-shelf__caption");
  caption.setAttribute("aria-live", "polite");
  const counter = element("span", "book-shelf__counter");
  const name = element("span", "book-shelf__name");
  caption.append(counter, name);
  const inspect = button("book-shelf__inspect", "Ver ficha", "Ver ficha de la portada");
  const rotate = button("book-shelf__rotate", "↻", "Girar libro 45 grados");
  const reset = button("book-shelf__reset", "Vista frontal", "Volver a la portada");
  toolbar.append(previous, caption, next, inspect, rotate, reset);
  const hint = element("p", "book-shelf__hint", "Arrastrá para girar · Flechas para recorrer");
  const supportNote = element("p", "book-shelf__support-note", "Maqueta digital · Lomo y contratapa de referencia");
  const panel = element("section", "book-shelf__panel");
  panel.id = "shelf-detail";
  panel.hidden = true;
  panel.dataset.lenisPrevent = "";
  panel.setAttribute("aria-labelledby", "shelf-book-title");
  inspect.setAttribute("aria-controls", panel.id);
  inspect.setAttribute("aria-expanded", "false");
  const close = button("book-shelf__close", "← Volver al estante", "Cerrar ficha y volver al estante");
  const author = element("p", "book-shelf__author", project.shelf.author);
  const title = element("h2", "book-shelf__book-title");
  title.id = "shelf-book-title";
  const notes = element("div", "book-shelf__notes");
  const enlarge = button("book-shelf__enlarge", "Ampliar portada ↗", "Ampliar portada original");
  enlarge.setAttribute("aria-haspopup", "dialog");
  panel.append(close, author, title, notes, enlarge);
  root.append(heading, stage, toolbar, hint, supportNote, panel);

  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const lifetime = new AbortController();
  const listen = (target, type, callback, options = {}) => target.addEventListener(type, callback, { ...options, signal: lifetime.signal });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrap = (angle) => ((angle % 360 + 540) % 360) - 180;
  const normals = [[0, 0, 1], [0, 0, -1], [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0]];
  const light = [-0.45, -0.6, 0.65].map((value) => value / Math.hypot(-0.45, -0.6, 0.65));
  const books = project.sections.filter((section) => section.block === "cover-study" && section.items?.[0]).map((section, i) => {
    const item = section.items[0];
    const slot = element("div", "book-shelf__slot");
    slot.dataset.book = i;
    const shadow = element("span", "book-shelf__shadow");
    shadow.setAttribute("aria-hidden", "true");
    const object = button("shelf-book", null, `Elegir ${section.title}`);
    const faces = ["front", "back", "spine", "pages", "top", "bottom"].map((side) => element("span", `shelf-book__face shelf-book__face--${side}`));
    faces.forEach((face) => face.setAttribute("aria-hidden", "true"));
    const cover = image(item, i < 3);
    faces[0].append(cover);
    object.append(...faces);
    slot.style.setProperty("--book-width", `${460 * item.w / item.h}px`);
    slot.append(shadow, object);
    track.append(slot);
    return { section, item, selected: item, slot, object, faces, cover, ry: -28, rx: -6, vy: 0, vx: 0, snap: null };
  });
  let current = 0;
  let position = 0;
  let focused = false;
  let gesture = null;
  let frame = 0;
  let lastTime = 0;
  let visibility = null;
  let layout = { width: 0, height: 0 };

  function wake() {
    if (!frame && !document.hidden && !document.querySelector("dialog[open]")) frame = requestAnimationFrame(draw);
  }
  function updateUI() {
    root.dataset.index = String(current);
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(books.length).padStart(2, "0")}`;
    name.textContent = books[current].section.title;
    previous.disabled = current === 0 || focused;
    next.disabled = current === books.length - 1 || focused;
    books.forEach((book, i) => {
      book.object.tabIndex = i === current ? 0 : -1;
      book.object.setAttribute("aria-label", i === current ? `Ver ficha de ${book.section.title}` : `Elegir ${book.section.title}`);
      book.object.dataset.cursorAction = i === current ? "Arrastrar o ver ficha" : "Elegir libro";
      book.object.setAttribute("aria-expanded", String(i === current && focused));
      book.object.setAttribute("aria-controls", panel.id);
    });
    wake();
  }
  function select(index) {
    if (focused) return;
    const selected = clamp(index, 0, books.length - 1);
    if (selected === current) return;
    current = selected;
    const book = books[current];
    book.ry = wrap(book.ry);
    book.snap = { y: -28, x: -6 };
    book.vy = book.vx = 0;
    updateUI();
  }
  async function switchVariant(book, item) {
    book.pending = item;
    const replacement = image(item, true);
    // Decode first so switching variants never exposes an empty cover.
    try { await replacement.decode(); } catch { return; }
    if (book.pending !== item) return;
    book.selected = item;
    book.cover.replaceWith(replacement);
    book.cover = replacement;
    if (books[current] === book && focused) notes.querySelectorAll("[data-variant]").forEach((node) => node.setAttribute("aria-pressed", String(node.dataset.variant === item.src)));
  }
  function populateNotes(book) {
    const section = book.section;
    title.textContent = section.title;
    notes.replaceChildren();
    if (section.colors?.length) {
      notes.append(element("h3", null, "Paleta de la portada"), makePalette(section.colors));
      notes.append(element("p", "book-shelf__palette-note", "Colores muestreados de la tapa principal."));
    }
    if (section.inspiration) notes.append(element("h3", null, "Lectura visual"), element("p", null, section.inspiration));
    if (!section.variants?.length) return;
    notes.append(element("h3", null, "Variantes de portada"));
    const variants = element("div", "book-shelf__variants");
    [book.item, ...section.variants].forEach((item, i) => {
      const name = i === 0 ? "Principal" : item.caption || `Variante ${i}`;
      const preview = element("figure", "book-shelf__variant");
      if (item.gallery !== false) {
        const choose = button("book-shelf__variant-button", null, `Ver ${name} en el libro`);
        choose.dataset.variant = item.src;
        choose.setAttribute("aria-pressed", String(book.selected.src === item.src));
        choose.append(image(item));
        listen(choose, "click", () => switchVariant(book, item));
        preview.append(choose);
      } else preview.append(image(item));
      preview.append(element("figcaption", null, name));
      variants.append(preview);
    });
    notes.append(variants);
  }
  function openDetails() {
    if (focused) return;
    focused = true;
    const book = books[current];
    book.ry = wrap(book.ry);
    book.snap = { y: 0, x: 0 };
    book.vy = book.vx = 0;
    populateNotes(book);
    panel.hidden = false;
    panel.scrollTop = 0;
    root.classList.add("book-shelf--focused");
    inspect.setAttribute("aria-expanded", "true");
    updateUI();
    close.focus({ preventScroll: true });
  }
  function closeDetails() {
    if (!focused) return;
    focused = false;
    panel.hidden = true;
    root.classList.remove("book-shelf--focused");
    const book = books[current];
    book.ry = wrap(book.ry);
    book.snap = { y: -28, x: -6 };
    inspect.setAttribute("aria-expanded", "false");
    updateUI();
    book.object.focus({ preventScroll: true });
  }
  listen(previous, "click", () => select(current - 1));
  listen(next, "click", () => select(current + 1));
  listen(inspect, "click", openDetails);
  listen(close, "click", closeDetails);
  listen(enlarge, "click", () => { cancelAnimationFrame(frame); frame = 0; onOpen(books[current].selected); });
  listen(rotate, "click", () => { const book = books[current]; book.snap = { y: book.ry + 45, x: book.rx }; wake(); });
  listen(reset, "click", () => { const book = books[current]; book.ry = wrap(book.ry); book.snap = { y: 0, x: 0 }; wake(); });
  books.forEach((book, i) => listen(book.object, "click", (event) => {
    if (event.detail !== 0) return; // Pointer taps are resolved below after the drag threshold.
    if (current === i) openDetails();
    else select(i);
  }));
  listen(document, "keydown", (event) => {
    if (document.querySelector("dialog[open]") || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Escape" && focused) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDetails();
    } else if (!focused && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      select(current + (event.key === "ArrowRight" ? 1 : -1));
    }
  }, { capture: true });
  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0 || gesture) return;
    const slot = event.target.closest("[data-book]");
    if (!slot) return;
    const i = Number(slot.dataset.book);
    gesture = { id: event.pointerId, i, x: event.clientX, y: event.clientY, lx: event.clientX, ly: event.clientY, time: event.timeStamp, moved: false };
    stage.setPointerCapture(event.pointerId);
  });
  listen(stage, "pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId || gesture.i !== current) return;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 6) return;
    gesture.moved = true;
    const book = books[current];
    book.snap = null;
    const elapsed = Math.max(8, event.timeStamp - gesture.time) / (1000 / 60);
    const dx = (event.clientX - gesture.lx) * 0.45;
    const dy = -(event.clientY - gesture.ly) * 0.3;
    book.vy = clamp(dx / elapsed, -12, 12);
    book.vx = clamp(dy / elapsed, -6, 6);
    book.ry += dx;
    book.rx = clamp(book.rx + dy, -50, 50);
    gesture.lx = event.clientX;
    gesture.ly = event.clientY;
    gesture.time = event.timeStamp;
    root.classList.add("book-shelf--dragging");
    wake();
  });
  function release(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const previousGesture = gesture;
    gesture = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    root.classList.remove("book-shelf--dragging");
    if (event.type === "pointerup" && !previousGesture.moved && Math.hypot(event.clientX - previousGesture.x, event.clientY - previousGesture.y) < 6) {
      if (previousGesture.i !== current) select(previousGesture.i);
      else openDetails();
    }
    if (preference.matches || event.type !== "pointerup" || event.timeStamp - previousGesture.time > 100) books[current].vy = books[current].vx = 0;
    wake();
  }
  listen(stage, "pointerup", release);
  listen(stage, "pointercancel", release);
  listen(stage, "lostpointercapture", release);

  function shade(book, dim) {
    const r = Math.PI / 180;
    const cy = Math.cos(book.ry * r), sy = Math.sin(book.ry * r);
    const cx = Math.cos(book.rx * r), sx = Math.sin(book.rx * r);
    book.faces.forEach((face, i) => {
      const [x, y, z] = normals[i];
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const dot = x1 * light[0] + y2 * light[1] + z2 * light[2];
      face.style.setProperty("--face-shade", clamp(0.35 - dot * 0.5 + dim, 0, 0.8).toFixed(3));
    });
  }
  function draw(time) {
    frame = 0;
    const dt = clamp((time - lastTime) / (1000 / 60), 0.25, 2);
    lastTime = time;
    const smooth = (value, target, amount) => preference.matches ? target : value + (target - value) * (1 - (1 - amount) ** dt);
    position = smooth(position, current, 0.08);
    if (Math.abs(position - current) < 0.001) position = current;
    const mobile = layout.width <= 700;
    const focusWidth = focused && !mobile ? Math.min(400, layout.width * 0.35) : 0;
    const available = layout.width - focusWidth;
    const sc = focused && mobile
      ? Math.min(1, layout.height * 0.34 / (460 * 1.15), layout.width / 760)
      : Math.min(1, layout.height / 640, available / 760);
    let moving = position !== current;
    books.forEach((book, i) => {
      const off = i - position, distance = Math.abs(off), active = i === current;
      const hidden = focused ? !active : distance > 3.5;
      book.slot.style.visibility = hidden ? "hidden" : "visible";
      book.slot.inert = hidden;
      if (hidden && !active) return;
      if (active) {
        if (book.snap) {
          book.ry = smooth(book.ry, book.snap.y, 0.12);
          book.rx = smooth(book.rx, book.snap.x, 0.12);
          if (Math.abs(book.snap.y - book.ry) + Math.abs(book.snap.x - book.rx) < 0.05) {
            book.ry = book.snap.y; book.rx = book.snap.x; book.snap = null;
          } else moving = true;
        } else if (!gesture && !preference.matches) {
          book.vy *= 0.94 ** dt;
          book.vx *= 0.9 ** dt;
          if (Math.abs(book.vy) < 0.01) book.vy = 0;
          if (Math.abs(book.vx) < 0.01) book.vx = 0;
          book.ry += book.vy * dt;
          book.rx = clamp(book.rx + book.vx * dt, -50, 50);
          moving ||= Boolean(book.vy || book.vx);
        }
      } else {
        const target = -Math.sign(off) * Math.min(distance, 2) * 34;
        book.ry = smooth(target + wrap(book.ry - target), target, 0.1);
        book.rx = smooth(book.rx, -6, 0.1);
        book.vy = book.vx = 0;
        moving ||= Math.abs(book.ry - target) + Math.abs(book.rx + 6) > 0.05;
      }
      const scale = focused ? sc * 1.15 : sc * (1 - Math.min(distance, 3) * 0.17);
      const x = focused ? -focusWidth / 2 : Math.sign(off) * (distance < 1 ? distance * 310 : 310 + (distance - 1) * 190) * Math.max(0.55, sc);
      const y = focused && mobile ? -layout.height * 0.29 : focused ? 0 : 220 * sc - 230 * scale - 12;
      const z = focused ? mobile ? 0 : 100 : -distance * 160;
      book.slot.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
      book.slot.style.zIndex = String(100 - Math.round(distance * 10));
      book.object.style.transform = `rotateX(${book.rx}deg) rotateY(${book.ry}deg)`;
      shade(book, focused ? 0 : Math.min(0.5, distance * 0.26));
    });
    root.dataset.moving = String(moving);
    if (moving) wake();
  }
  const resize = new ResizeObserver(([entry]) => { layout = { width: entry.contentRect.width, height: entry.contentRect.height }; wake(); });
  resize.observe(stage);
  listen(preference, "change", () => {
    books.forEach((book) => { book.vx = book.vy = 0; });
    wake();
  });
  listen(document, "visibilitychange", () => {
    cancelAnimationFrame(frame); frame = 0;
    if (!document.hidden) wake();
  });
  // Returning from the shared image viewer must resume an interrupted settle.
  visibility = new MutationObserver(wake);
  visibility.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  listen(window, "pagehide", (event) => {
    cancelAnimationFrame(frame); frame = 0;
    gesture = null;
    if (!event.persisted) { lifetime.abort(); resize.disconnect(); visibility.disconnect(); }
  });
  listen(window, "pageshow", wake);
  updateUI();
  return root;
}
