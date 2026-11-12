// CSS 3D display supports; supplied front artwork keeps its native proportions.
export function createBookShelf({ project, shelves = [], makePalette, onOpen }) {
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
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrap = (angle) => ((angle % 360 + 540) % 360) - 180;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const lifetime = new AbortController();
  const listen = (target, type, callback, options = {}) => target.addEventListener(type, callback, { ...options, signal: lifetime.signal });
  const sections = project.sections.filter((section) => section.block === "cover-study" && section.items?.[0]);
  const storageKey = `portfolio:shelf:v2:${project.slug}`;
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
  if (saved?.version !== 2) saved = null;

  const root = element("article", "book-shelf");
  root.dataset.lenisPrevent = "";
  const heading = element("header", "book-shelf__heading");
  heading.append(element("h1", null, project.title), element("p", null, "Ediciones · Libros"));
  // Only published registry entries can become shelf destinations.
  if (shelves.length > 1) {
    const navigation = element("details", "book-shelf__library");
    navigation.append(element("summary", null, "Biblioteca"));
    const list = element("nav");
    list.setAttribute("aria-label", "Estantes publicados");
    shelves.forEach((shelf) => {
      const link = element("a", null, shelf.title);
      link.href = `./project.html?p=${encodeURIComponent(shelf.slug)}`;
      if (shelf.slug === project.slug) link.setAttribute("aria-current", "page");
      list.append(link);
    });
    navigation.append(list);
    heading.append(navigation);
  }
  const stage = element("div", "book-shelf__stage");
  stage.setAttribute("aria-label", "Desplazá el estante; tocá un libro para abrir su ficha o arrastrá el central para girarlo");
  const track = element("div", "book-shelf__track");
  const floor = element("div", "book-shelf__floor");
  floor.setAttribute("aria-hidden", "true");
  track.append(floor);
  stage.append(track);
  const previous = button("book-shelf__arrow book-shelf__arrow--previous", "←", "Libro anterior");
  const next = button("book-shelf__arrow", "→", "Libro siguiente");
  const toolbar = element("div", "book-shelf__toolbar");
  const caption = element("p", "book-shelf__caption");
  caption.setAttribute("aria-live", "polite");
  caption.setAttribute("aria-atomic", "true");
  const counter = element("span", "book-shelf__counter");
  const name = element("span", "book-shelf__name");
  const format = element("span", "book-shelf__format");
  caption.append(counter, name, format);
  const indexToggle = button("book-shelf__index-toggle", "Índice de tapas", "Elegir una portada del índice");
  indexToggle.setAttribute("aria-haspopup", "dialog");
  indexToggle.setAttribute("aria-controls", "shelf-index");
  indexToggle.setAttribute("aria-expanded", "false");
  const rotate = button("book-shelf__rotate", "↻", "Girar libro 45 grados");
  const reset = button("book-shelf__reset", "Vista frontal", "Volver a la portada");
  toolbar.append(previous, caption, next, indexToggle, rotate, reset);
  const hint = element("p", "book-shelf__hint", "Scroll o deslizá el fondo para recorrer · Arrastrá el libro para girar · Tocá para leer");
  const supportNote = element("p", "book-shelf__support-note", "Maqueta digital · Lomos y contratapas neutros");

  const note = element("dialog", "book-note");
  note.id = "shelf-detail";
  note.dataset.lenisPrevent = "";
  note.setAttribute("aria-labelledby", "shelf-book-title");
  const noteHeader = element("header", "book-note__header");
  const noteHeading = element("div");
  const title = element("h2", "book-note__title");
  title.id = "shelf-book-title";
  const metadata = element("p", "book-note__metadata");
  noteHeading.append(title, metadata);
  const close = button("book-note__close", "×", "Cerrar ficha");
  close.autofocus = true;
  noteHeader.append(noteHeading, close);
  const notes = element("div", "book-note__body");
  const noteFooter = element("footer", "book-note__footer");
  const enlarge = button("book-note__enlarge", "Ampliar portada ↗", "Ampliar portada original");
  enlarge.setAttribute("aria-haspopup", "dialog");
  const source = element("a", "book-note__source", "Fuente de la sinopsis ↗");
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.dataset.cursorAction = "Consultar sinopsis original";
  noteFooter.append(enlarge, source);
  note.append(noteHeader, notes, noteFooter);

  const index = element("dialog", "shelf-index");
  index.id = "shelf-index";
  index.dataset.lenisPrevent = "";
  index.setAttribute("aria-labelledby", "shelf-index-title");
  const indexHeader = element("header", "shelf-index__header");
  const indexTitle = element("h2", null, "Las diez portadas");
  indexTitle.id = "shelf-index-title";
  const indexClose = button("book-note__close", "×", "Cerrar índice de tapas");
  indexHeader.append(indexTitle, indexClose);
  const indexGrid = element("div", "shelf-index__grid");
  index.append(indexHeader, indexGrid);
  root.append(heading, stage, toolbar, hint, supportNote, note, index);

  // Exact critically damped response; stable across refresh rates and idle at rest.
  function spring(state, target, dt, frequency = 18, tolerance = 0.01) {
    if (preference.matches) { state.value = target; state.velocity = 0; return false; }
    const offset = state.value - target;
    const impulse = state.velocity + frequency * offset;
    const decay = Math.exp(-frequency * dt);
    state.value = target + (offset + impulse * dt) * decay;
    state.velocity = (state.velocity - frequency * impulse * dt) * decay;
    if (Math.abs(state.value - target) < tolerance && Math.abs(state.velocity) < tolerance * frequency) {
      state.value = target; state.velocity = 0;
      return false;
    }
    return true;
  }
  const measuredSize = (edition) => {
    const size = edition?.dimensionsMm;
    return size && [size.width, size.height, size.depth].every((value) => Number.isFinite(value) && value > 0) ? size : null;
  };
  const referenceHeight = Math.max(1, ...sections.map((section) => measuredSize(section.edition)?.height || 0));
  const unitsPerMm = 460 / referenceHeight;
  const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
  const books = sections.map((section, i) => {
    const item = section.items[0];
    const memory = saved?.books?.[item.src];
    const selected = [item, ...(section.variants || []).filter((variant) => variant.gallery !== false)].find((variant) => variant.src === memory?.src) || item;
    const measured = measuredSize(section.edition);
    const height = measured ? measured.height * unitsPerMm : 460;
    const width = height * selected.w / selected.h;
    const depth = measured ? measured.depth * unitsPerMm : 34;
    // Relative rotational inertia, not an asserted physical weight.
    const mass = clamp(Math.pow(height * width * depth / (460 * 320 * 65), 0.35), 0.7, 1.65);
    const rest = {
      y: Number.isFinite(memory?.y) ? wrap(memory.y) : -24,
      x: Number.isFinite(memory?.x) ? clamp(memory.x, -28, 28) : -3,
    };
    const slot = element("div", "book-shelf__slot");
    slot.dataset.book = i;
    slot.dataset.binding = section.edition?.binding || "paperback";
    const shadow = element("span", "book-shelf__shadow");
    shadow.setAttribute("aria-hidden", "true");
    const object = button("shelf-book", null, `Ver ficha de ${section.title}`);
    object.setAttribute("aria-haspopup", "dialog");
    object.setAttribute("aria-controls", note.id);
    const faces = ["front", "back", "spine", "pages", "top", "bottom"].map((side) => element("span", `shelf-book__face shelf-book__face--${side}`));
    faces.forEach((face) => face.setAttribute("aria-hidden", "true"));
    const cover = image(selected, i < 3 || i === saved?.current);
    const finish = element("span", "shelf-book__finish");
    finish.setAttribute("aria-hidden", "true");
    faces[0].append(cover, finish);
    object.append(...faces);
    slot.style.setProperty("--book-width", `${width}px`);
    slot.style.setProperty("--book-height", `${height}px`);
    slot.style.setProperty("--book-depth", `${depth}px`);
    slot.append(shadow, object);
    track.append(slot);
    return { section, item, selected, slot, object, faces, cover, shadow, width, height, depth, mass, rest,
      ry: rest.y, rx: rest.x, yaw: { value: rest.y, velocity: 0 }, pitch: { value: rest.x, velocity: 0 } };
  });
  let current = Number.isInteger(saved?.current) ? clamp(saved.current, 0, books.length - 1) : 0;
  let inspected = null;
  let returnFocus = null;
  let focusRequest = null;
  let gesture = null;
  let frame = 0;
  let lastTime = 0;
  let saveTimer = 0;
  let snapTimer = 0;
  let wheelOrigin = null;
  let centers = [];
  let layout = { width: 0, height: 0 };
  const camera = { value: 0, velocity: 0, target: 0 };

  function positionBooks() {
    centers = [0];
    for (let i = 1; i < books.length; i++) centers[i] = centers[i - 1] + (books[i - 1].width + books[i].width) / 2 + 38;
  }
  positionBooks();
  camera.target = camera.value = Number.isFinite(saved?.position)
    ? clamp(saved.position, 0, 1) * centers.at(-1) : centers[current];
  function save() {
    clearTimeout(saveTimer);
    const state = { version: 2, current, position: centers.at(-1) ? camera.value / centers.at(-1) : 0, books: {} };
    books.forEach((book) => { state.books[book.item.src] = { src: book.selected.src, y: wrap(book.rest.y), x: book.rest.x }; });
    try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Private browsing/storage quotas must not break the scene. */ }
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 240); }
  function wake() {
    if (!frame && !document.hidden && !document.querySelector("dialog[open]")) frame = requestAnimationFrame(draw);
  }
  function pause() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    clearTimeout(snapTimer);
    wheelOrigin = null;
    root.dataset.moving = "false";
    save();
  }
  function updateUI() {
    root.dataset.index = String(current);
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(books.length).padStart(2, "0")}`;
    name.textContent = books[current].section.title;
    const edition = books[current].section.edition;
    format.textContent = edition?.pages ? `${number.format(edition.pages)} págs.` : "";
    format.hidden = !format.textContent;
    previous.disabled = current === 0;
    next.disabled = current === books.length - 1;
    books.forEach((book, i) => {
      book.object.tabIndex = i === current ? 0 : -1;
      book.object.dataset.cursorAction = "Ver ficha · Arrastrar para girar";
      book.object.setAttribute("aria-expanded", String(i === inspected));
      book.indexButton?.setAttribute("aria-current", String(i === current));
    });
  }
  function select(index) {
    current = clamp(index, 0, books.length - 1);
    focusRequest = document.activeElement?.matches(".shelf-book") ? { i: current, from: document.activeElement } : null;
    clearTimeout(snapTimer);
    wheelOrigin = null;
    camera.target = centers[current];
    updateUI();
    queueSave();
    wake();
  }
  function nearest(value) {
    return centers.reduce((best, center, i) => Math.abs(center - value) < Math.abs(centers[best] - value) ? i : best, 0);
  }
  function travel(value) {
    camera.target = clamp(value, 0, centers.at(-1));
    const chosen = nearest(camera.target);
    if (chosen !== current) { current = chosen; updateUI(); }
    wake();
  }
  function snap() { select(nearest(camera.target)); }
  function sceneScale() { return Math.max(0.1, Math.min(1, layout.height / 660, layout.width / 800)); }

  function fitCover(book) {
    const cover = book.cover;
    const update = () => {
      if (book.cover !== cover || !cover.naturalWidth || !cover.naturalHeight) return;
      const source = (book.selected.sources || []).find((item) => new URL(item.src, document.baseURI).href === cover.currentSrc);
      const ratio = source?.w > 0 && source?.h > 0 ? source.w / source.h : cover.naturalWidth / cover.naturalHeight;
      const width = book.height * ratio;
      if (Math.abs(width - book.width) < 0.0001) return;
      const anchor = camera.value - centers[current];
      const targetOffset = camera.target - centers[current];
      book.width = width;
      book.slot.style.setProperty("--book-width", `${width}px`);
      positionBooks();
      camera.value = centers[current] + anchor;
      camera.target = clamp(centers[current] + targetOffset, 0, centers.at(-1));
      wake();
    };
    listen(cover, "load", update);
    update();
  }
  async function switchVariant(book, item) {
    book.pending = item;
    const replacement = image(item, true);
    try { await replacement.decode(); } catch { return; }
    if (book.pending !== item || lifetime.signal.aborted) return;
    book.selected = item;
    book.cover.replaceWith(replacement);
    book.cover = replacement;
    fitCover(book);
    if (books[inspected] === book) notes.querySelectorAll("[data-variant]").forEach((node) => node.setAttribute("aria-pressed", String(node.dataset.variant === item.src)));
    queueSave();
  }
  function populateNotes(book) {
    const section = book.section;
    title.textContent = section.title;
    const binding = { hardcover: "Tapa dura", paperback: "Rústica", "mass-market-paperback": "Bolsillo" }[section.edition?.binding];
    metadata.textContent = [project.shelf.author, section.edition?.pages && `${number.format(section.edition.pages)} págs.`, binding].filter(Boolean).join(" · ");
    notes.replaceChildren();
    const block = (label, text) => {
      if (!text) return;
      const group = element("section", "book-note__section");
      group.append(element("h3", null, label), element("p", null, text));
      notes.append(group);
    };
    if (section.colors?.length) {
      const palette = element("section", "book-note__section");
      palette.append(element("h3", null, "Paleta de la tapa principal"), makePalette(section.colors));
      notes.append(palette);
    }
    block("La tapa", section.designNote || section.inspiration);
    block("Técnica", section.technique || project.shelf.technique);
    block("El libro", section.synopsis);
    source.hidden = !section.synopsisSource?.url;
    if (section.synopsisSource?.url) source.href = section.synopsisSource.url;
    if (!section.variants?.length) return;
    const disclosure = element("details", "book-note__variants");
    disclosure.append(element("summary", null, "Variantes y proceso"));
    const variants = element("div", "book-note__variant-grid");
    [book.item, ...section.variants].forEach((item, i) => {
      const label = i === 0 ? "Principal" : item.caption || `Variante ${i}`;
      const preview = element("figure", "book-note__variant");
      if (item.gallery !== false) {
        const choose = button("book-note__variant-button", null, `Usar ${label} en el libro`);
        choose.dataset.variant = item.src;
        choose.setAttribute("aria-pressed", String(book.selected.src === item.src));
        choose.append(image(item));
        listen(choose, "click", () => switchVariant(book, item));
        preview.append(choose);
      } else preview.append(image(item));
      preview.append(element("figcaption", null, label));
      variants.append(preview);
    });
    disclosure.append(variants);
    notes.append(disclosure);
  }
  function openDetails(i) {
    if (note.open || index.open) return;
    inspected = i;
    returnFocus = books[i].object;
    populateNotes(books[i]);
    pause();
    updateUI();
    note.showModal();
    notes.scrollTop = 0;
  }
  function closeDetails() { if (note.open) note.close(); }
  listen(close, "click", closeDetails);
  listen(note, "close", () => {
    inspected = null;
    updateUI();
    returnFocus?.focus({ preventScroll: true });
    wake();
  });
  listen(enlarge, "click", () => { if (inspected !== null) { pause(); enlarge.focus({ preventScroll: true }); onOpen(books[inspected].selected); } });
  function backdropClose(dialog, event) {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
  [note, index].forEach((dialog) => listen(dialog, "click", (event) => backdropClose(dialog, event)));
  books.forEach((book, i) => {
    const choose = button("shelf-index__book", null, `Ir a ${book.section.title}`);
    const preview = image(book.item);
    preview.sizes = "100px";
    choose.append(preview, element("span", "shelf-index__number", String(i + 1).padStart(2, "0")), element("span", null, book.section.title));
    book.indexButton = choose;
    listen(choose, "click", () => {
      index.close();
      select(i);
      focusRequest = { i, from: document.activeElement };
      wake();
    });
    indexGrid.append(choose);
    listen(book.object, "click", (event) => { if (event.detail === 0) openDetails(i); });
  });
  indexTitle.textContent = `${books.length} portadas`;
  listen(indexToggle, "click", () => {
    pause();
    indexToggle.setAttribute("aria-expanded", "true");
    index.showModal();
    books[current].indexButton.focus({ preventScroll: true });
    books[current].indexButton.scrollIntoView({ block: "nearest" });
  });
  listen(index, "keydown", (event) => {
    const focused = books.findIndex((book) => book.indexButton === event.target);
    if (focused < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft: focused - 1, ArrowRight: focused + 1, ArrowUp: focused - 5, ArrowDown: focused + 5, Home: 0, End: books.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    const chosen = books[clamp(destinations[event.key], 0, books.length - 1)].indexButton;
    chosen.focus({ preventScroll: true });
    chosen.scrollIntoView({ block: "nearest" });
  });
  listen(indexClose, "click", () => index.close());
  listen(index, "close", () => { indexToggle.setAttribute("aria-expanded", "false"); wake(); });
  listen(previous, "click", () => select(current - 1));
  listen(next, "click", () => select(current + 1));
  listen(rotate, "click", () => { books[current].rest.y += 45; queueSave(); wake(); });
  listen(reset, "click", () => { books[current].rest = { y: 0, x: 0 }; queueSave(); wake(); });
  listen(document, "keydown", (event) => {
    if (document.querySelector("dialog[open]") || event.altKey || event.ctrlKey || event.metaKey || event.target.closest("a, summary")) return;
    const actions = { ArrowLeft: () => select(current - 1), ArrowRight: () => select(current + 1), Home: () => select(0), End: () => select(books.length - 1) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  });
  listen(stage, "wheel", (event) => {
    if (event.ctrlKey || document.querySelector("dialog[open]") || gesture) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? layout.height : 1;
    if (wheelOrigin === null) wheelOrigin = camera.target;
    travel(camera.target + clamp(delta * unit, -900, 900) * 0.75 / sceneScale());
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const start = nearest(wheelOrigin);
      const shift = camera.target - wheelOrigin;
      const destination = nearest(camera.target);
      // A deliberate single wheel tick advances too; tiny trackpad noise does not.
      select(destination === start && Math.abs(shift) > 32 / sceneScale() ? start + Math.sign(shift) : destination);
    }, 160);
  }, { passive: false });
  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0 || gesture || document.querySelector("dialog[open]")) return;
    focusRequest = null;
    const slot = event.target.closest("[data-book]");
    const i = slot ? Number(slot.dataset.book) : null;
    const book = books[i];
    clearTimeout(snapTimer);
    wheelOrigin = null;
    gesture = { id: event.pointerId, i, mode: i === current ? "rotate" : "travel", x: event.clientX, y: event.clientY,
      lx: event.clientX, ly: event.clientY, time: event.timeStamp, moved: false, velocity: 0, pitch: book?.rx || 0 };
    stage.setPointerCapture(event.pointerId);
  });
  listen(stage, "pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 6) return;
    const elapsed = Math.max(8, event.timeStamp - gesture.time) / 1000;
    const dx = event.clientX - gesture.lx;
    const dy = event.clientY - gesture.ly;
    if (gesture.mode === "travel") {
      if (!gesture.moved) camera.target = camera.value;
      travel(camera.target - dx / sceneScale());
      gesture.velocity += (clamp(-dx / elapsed, -1400, 1400) - gesture.velocity) * 0.55;
    } else {
      const book = books[gesture.i];
      if (!gesture.moved) book.rest = { y: book.ry, x: book.rx };
      const turn = dx * 0.32 / Math.sqrt(book.mass);
      gesture.velocity += (clamp(turn / elapsed, -220, 220) - gesture.velocity) * 0.55;
      book.rest.y += turn;
      gesture.pitch -= dy * 0.22 / Math.sqrt(book.mass);
      book.rest.x = 28 * Math.tanh(gesture.pitch / 28);
    }
    gesture.moved = true;
    gesture.lx = event.clientX; gesture.ly = event.clientY; gesture.time = event.timeStamp;
    root.classList.add("book-shelf--dragging");
    wake();
  });
  function release(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const ended = gesture;
    gesture = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    root.classList.remove("book-shelf--dragging");
    if (event.type === "pointerup" && !ended.moved && ended.i !== null && Math.hypot(event.clientX - ended.x, event.clientY - ended.y) < 6) openDetails(ended.i);
    if (ended.moved) {
      const momentum = !preference.matches && event.type === "pointerup" && event.timeStamp - ended.time < 90;
      if (ended.mode === "travel") {
        if (momentum) travel(camera.target + ended.velocity * 0.12 / sceneScale());
        snap();
      } else {
        const book = books[ended.i];
        if (momentum) book.rest.y += ended.velocity * 0.12 / book.mass;
        book.rest.x = -3;
        queueSave();
      }
    }
    wake();
  }
  listen(stage, "pointerup", release);
  listen(stage, "pointercancel", release);
  listen(stage, "lostpointercapture", release);

  const normals = [[0, 0, 1], [0, 0, -1], [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0]];
  const light = [-0.45, -0.6, 0.65].map((value) => value / Math.hypot(-0.45, -0.6, 0.65));
  function shade(book, dim) {
    const r = Math.PI / 180;
    const cy = Math.cos(book.ry * r), sy = Math.sin(book.ry * r);
    const cx = Math.cos(book.rx * r), sx = Math.sin(book.rx * r);
    book.faces.forEach((face, i) => {
      const [x, y, z] = normals[i];
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const dot = x1 * light[0] + y2 * light[1] + z2 * light[2];
      // Neutral diffuse light; front artwork remains almost unshaded when facing us.
      face.style.setProperty("--face-shade", clamp((i === 0 ? 0.16 - dot * 0.3 : 0.35 - dot * 0.5) + dim, 0, 0.8).toFixed(3));
    });
  }
  function draw(time) {
    frame = 0;
    if (document.querySelector("dialog[open]")) return;
    const dt = lastTime ? clamp((time - lastTime) / 1000, 1 / 240, 0.05) : 1 / 60;
    lastTime = time;
    const sc = sceneScale();
    const ground = 215 * sc - 12;
    floor.style.setProperty("--shelf-ground", `${ground}px`);
    let moving = spring(camera, camera.target, dt, 18, 0.02);
    root.dataset.position = camera.value.toFixed(2);
    books.forEach((book, i) => {
      const offset = centers[i] - camera.value;
      const distance = Math.abs(offset) / Math.max(1, book.width + 38);
      const active = i === current;
      const yaw = active ? book.rest.y : -Math.sign(offset) * Math.min(distance, 2) * 30;
      const pitchTarget = active ? book.rest.x : -3;
      const targetYaw = book.ry + wrap(yaw - book.ry);
      const response = (gesture?.i === i ? 25 : 16) / Math.sqrt(book.mass);
      const yawMoving = spring(book.yaw, targetYaw, dt, response);
      const pitchMoving = spring(book.pitch, pitchTarget, dt, response);
      moving = yawMoving || pitchMoving || moving;
      book.ry = book.yaw.value; book.rx = book.pitch.value;
      const x = offset * sc, y = ground - book.height / 2 * sc;
      // A continuous depth field avoids a camera jump when the selected title changes.
      const z = 72 - Math.min(distance, 6) * 75;
      const hidden = Math.abs(x) > layout.width / 2 + book.width * sc * 1.5;
      book.slot.style.visibility = hidden ? "hidden" : "visible";
      book.slot.inert = hidden;
      if (hidden) return;
      book.slot.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${sc})`;
      book.slot.style.zIndex = String(110 - Math.round(distance * 10));
      const radians = Math.PI / 180;
      const cy = Math.cos(book.ry * radians), sy = Math.sin(book.ry * radians);
      const pitch = book.rx * radians;
      const halfDepth = Math.abs(sy) * book.width / 2 + Math.abs(cy) * book.depth / 2;
      const lift = Math.max(0, book.height / 2 * Math.cos(pitch) + halfDepth * Math.abs(Math.sin(pitch)) - book.height / 2);
      book.object.style.transform = `translateY(${-lift}px) rotateX(${book.rx}deg) rotateY(${book.ry}deg)`;
      const footprint = Math.max(40, Math.abs(cy) * book.width + Math.abs(sy) * book.depth) * 1.12;
      book.shadow.style.width = `${footprint}px`;
      book.shadow.style.left = `${-footprint / 2}px`;
      book.object.style.setProperty("--shine-x", `${50 + sy * 45}%`);
      book.object.style.setProperty("--shine-alpha", (0.01 + Math.abs(sy) * 0.02).toFixed(3));
      shade(book, Math.min(0.22, distance * 0.1));
    });
    if (focusRequest) {
      const requested = books[focusRequest.i];
      const active = document.activeElement;
      if (active !== focusRequest.from && active !== document.body) focusRequest = null;
      else if (!requested.slot.inert) {
        const bounds = requested.object.getBoundingClientRect();
        if (bounds.left >= 0 && bounds.right <= innerWidth) {
          requested.object.focus({ preventScroll: true });
          focusRequest = null;
        }
      }
    }
    root.dataset.moving = String(moving);
    if (moving) wake();
    else { lastTime = 0; queueSave(); }
  }
  const resize = new ResizeObserver(([entry]) => {
    layout = { width: entry.contentRect.width, height: entry.contentRect.height };
    wake();
  });
  resize.observe(stage);
  listen(preference, "change", () => {
    gesture = null;
    root.classList.remove("book-shelf--dragging");
    books.forEach((book) => { book.yaw.velocity = book.pitch.velocity = 0; });
    camera.velocity = 0;
    wake();
  });
  listen(document, "visibilitychange", () => { if (document.hidden) pause(); else wake(); });
  // Resume only after the last native dialog (including the shared gallery) closes.
  const visibility = new MutationObserver(wake);
  visibility.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  listen(window, "pagehide", (event) => {
    pause();
    gesture = null;
    clearTimeout(saveTimer);
    if (!event.persisted) { lifetime.abort(); resize.disconnect(); visibility.disconnect(); }
  });
  listen(window, "pageshow", wake);
  books.forEach(fitCover);
  updateUI();
  wake();
  return root;
}
