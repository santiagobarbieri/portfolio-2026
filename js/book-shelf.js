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
  const floor = element("div", "book-shelf__floor");
  floor.setAttribute("aria-hidden", "true");
  track.append(floor);
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
  // Exact critically damped response: stable across refresh rates, without bounce.
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
    const finish = element("span", "shelf-book__finish");
    finish.setAttribute("aria-hidden", "true");
    faces[0].append(cover, finish);
    object.append(...faces);
    slot.style.setProperty("--book-width", `${460 * item.w / item.h}px`);
    slot.append(shadow, object);
    track.append(slot);
    return {
      section, item, selected: item, slot, object, faces, cover, shadow,
      width: 460 * item.w / item.h, ry: -24, rx: -3,
      yaw: { value: -24, velocity: 0 }, pitch: { value: -3, velocity: 0 },
      target: { y: -24, x: -3 }, pose: null,
    };
  });
  let current = 0;
  let focused = false;
  let gesture = null;
  let frame = 0;
  let lastTime = 0;
  let visibility = null;
  let layout = { width: 0, height: 0, top: 0, viewportHeight: 0 };

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
    aim(book, -24, -3);
    updateUI();
  }
  function aim(book, yaw, pitch) {
    book.target.y = book.ry + wrap(yaw - book.ry);
    book.target.x = pitch;
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
    aim(book, 0, 0);
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
    aim(book, -24, -3);
    inspect.setAttribute("aria-expanded", "false");
    updateUI();
    book.object.focus({ preventScroll: true });
  }
  listen(previous, "click", () => select(current - 1));
  listen(next, "click", () => select(current + 1));
  listen(inspect, "click", openDetails);
  listen(close, "click", closeDetails);
  listen(enlarge, "click", () => { cancelAnimationFrame(frame); frame = 0; onOpen(books[current].selected); });
  listen(rotate, "click", () => { const book = books[current]; book.target.y += 45; wake(); });
  listen(reset, "click", () => { aim(books[current], 0, 0); wake(); });
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
    gesture = { id: event.pointerId, i, x: event.clientX, y: event.clientY, lx: event.clientX, ly: event.clientY, time: event.timeStamp, moved: false, vy: 0, pitch: books[i].rx };
    stage.setPointerCapture(event.pointerId);
  });
  listen(stage, "pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId || gesture.i !== current) return;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 6) return;
    const book = books[current];
    if (!gesture.moved) { book.target.y = book.ry; book.target.x = book.rx; }
    gesture.moved = true;
    const elapsed = Math.max(8, event.timeStamp - gesture.time) / 1000;
    const dx = (event.clientX - gesture.lx) * 0.32;
    const dy = -(event.clientY - gesture.ly) * 0.22;
    gesture.vy += (clamp(dx / elapsed, -220, 220) - gesture.vy) * 0.55;
    book.target.y += dx;
    gesture.pitch += dy;
    // Increasing resistance at the pitch limits keeps the book controllable.
    book.target.x = 28 * Math.tanh(gesture.pitch / 28);
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
    if (previousGesture.moved && previousGesture.i === current) {
      const book = books[current];
      const momentum = !preference.matches && event.type === "pointerup" && event.timeStamp - previousGesture.time < 90;
      // A short, bounded continuation replaces the previous long free spin.
      if (momentum) book.target.y += previousGesture.vy * 0.12;
      book.target.x = focused ? 0 : -3;
    }
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
    const dt = lastTime ? clamp((time - lastTime) / 1000, 1 / 240, 0.05) : 1 / 60;
    lastTime = time;
    const mobile = layout.width <= 700;
    const focusWidth = focused && !mobile ? Math.min(400, layout.width * 0.35) : 0;
    const available = layout.width - focusWidth;
    const sc = focused && mobile
      ? Math.min(1, layout.height * 0.34 / (460 * 1.15), layout.width / 760)
      : Math.min(1, layout.height / 660, available / 800);
    const ground = focused && !mobile ? 230 * sc * 1.15 : 215 * sc - 12;
    floor.style.setProperty("--shelf-ground", `${ground}px`);
    let moving = false;
    books.forEach((book, i) => {
      const off = i - current, distance = Math.abs(off), active = i === current;
      if (!active) aim(book, -Math.sign(off) * Math.min(distance, 2) * 30, -3);
      const response = gesture?.i === i ? 25 : 16;
      const yawMoving = spring(book.yaw, book.target.y, dt, response);
      const pitchMoving = spring(book.pitch, book.target.x, dt, response);
      moving = yawMoving || pitchMoving || moving;
      book.ry = book.yaw.value;
      book.rx = book.pitch.value;
      const scale = focused && active ? sc * 1.15 : sc * (1 - Math.min(distance, 3) * 0.14);
      const x = focused && active ? -focusWidth / 2 : Math.sign(off) * (distance < 1 ? distance * 340 : 340 + (distance - 1) * 215) * Math.max(0.55, sc);
      const y = focused && active ? mobile ? -layout.height * 0.29 : 0 : ground - 230 * scale;
      const z = focused && active ? mobile ? 0 : 100 : active ? 72 : -distance * 150;
      const targetPose = { x, y, z, scale, opacity: focused && !active ? 0 : 1 };
      if (!book.pose) book.pose = Object.fromEntries(Object.entries(targetPose).map(([key, value]) => [key, { value, velocity: 0 }]));
      for (const [key, target] of Object.entries(targetPose)) {
        const unsettled = spring(book.pose[key], target, dt, 18, key === "scale" || key === "opacity" ? 0.0001 : 0.02);
        moving = unsettled || moving;
      }
      const pose = Object.fromEntries(Object.entries(book.pose).map(([key, state]) => [key, state.value]));
      const hidden = !active && (distance > 3.5 || pose.opacity < 0.001);
      book.slot.style.visibility = hidden ? "hidden" : "visible";
      book.slot.inert = hidden || focused && !active;
      if (!hidden) {
        book.slot.style.opacity = pose.opacity.toFixed(4);
        book.slot.style.transform = `translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) scale(${pose.scale})`;
        book.slot.style.zIndex = String(active ? 110 : 100 - Math.round(distance * 10));
        // Lift only enough to keep the lowest rotated corner on the support plane.
        const radians = Math.PI / 180;
        const cy = Math.cos(book.ry * radians), sy = Math.sin(book.ry * radians);
        const pitch = book.rx * radians;
        const halfDepth = Math.abs(sy) * book.width / 2 + Math.abs(cy) * 17;
        const lift = Math.max(0, 230 * Math.cos(pitch) + halfDepth * Math.abs(Math.sin(pitch)) - 230);
        book.object.style.transform = `translateY(${-lift}px) rotateX(${book.rx}deg) rotateY(${book.ry}deg)`;
        const footprint = Math.max(40, Math.abs(cy) * book.width + Math.abs(sy) * 34) * 1.12;
        book.shadow.style.width = `${footprint}px`;
        book.shadow.style.left = `${-footprint / 2}px`;
        book.object.style.setProperty("--shine-x", `${50 + sy * 45}%`);
        book.object.style.setProperty("--shine-alpha", (0.012 + Math.abs(sy) * 0.025).toFixed(3));
        shade(book, focused ? 0 : Math.min(0.36, distance * 0.18));
      }
    });
    root.dataset.moving = String(moving);
    if (moving) wake();
  }
  const resize = new ResizeObserver(([entry]) => {
    const next = { width: entry.contentRect.width, height: entry.contentRect.height, top: stage.getBoundingClientRect().top, viewportHeight: innerHeight };
    const viewportChanged = next.width !== layout.width || next.viewportHeight !== layout.viewportHeight;
    books.forEach((book) => {
      if (viewportChanged || next.width <= 700) book.pose = null;
      else if (book.pose) book.pose.y.value += layout.top + layout.height / 2 - next.top - next.height / 2;
    });
    layout = next;
    wake();
  });
  resize.observe(stage);
  listen(preference, "change", () => {
    gesture = null;
    root.classList.remove("book-shelf--dragging");
    books.forEach((book) => { book.yaw.velocity = book.pitch.velocity = 0; });
    wake();
  });
  listen(document, "visibilitychange", () => {
    cancelAnimationFrame(frame); frame = 0;
    lastTime = 0;
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
