function interactionAt(target) {
  if (!(target instanceof Element)) return null;
  let control = target.closest('a[href], button, summary, input, select, textarea, [data-cursor-interactive]');
  if (!control) control = target.closest("label")?.control;
  if (!control || control.matches(':disabled, [aria-disabled="true"], input[type="hidden"]') || control.closest("[inert]")) return null;
  if (control.dataset.cursorAction) return { control, text: control.dataset.cursorAction };
  const action = (text) => ({ control, text });
  if (control.matches(".archive-card__link")) return action("Abrir\nproyecto");
  if (control.matches(".identity, [data-close-entry]")) return action("Volver\nal archivo");
  if (control.matches(".image-gallery__close")) return action("Cerrar\nvisor");
  if (control.matches("[data-gallery-previous]")) return action("Imagen\nanterior");
  if (control.matches("[data-gallery-next]")) return action("Imagen\nsiguiente");
  if (control.matches(".image-gallery__download")) return action("Descargar\noriginal");
  if (control.matches(".image-gallery__viewport")) return action("Deslizar\nimágenes");
  if (control.matches('.photo-collection__open, [aria-haspopup="dialog"]')) return action("Ampliar\nimagen");
  if (control.matches(".project-catalogue__link")) return action("Ver\nportada");
  if (control.closest(".project-index")) return action("Ver\nsección");
  if (control.matches("summary")) {
    const details = control.parentElement;
    if (details.matches("[data-archive-filter-panel]")) return action(details.open ? "Cerrar\nfiltros" : "Abrir\nfiltros");
    if (details.dataset.filterMenu === "category") return action(details.open ? "Cerrar\nfiltro" : "Filtrar\nproyectos");
    if (details.dataset.filterMenu === "order") return action(details.open ? "Cerrar\norden" : "Ordenar\nproyectos");
    if (details.matches(".project-overview")) return action(details.open ? "Cerrar\nficha" : "Ver\nficha");
    return action(details.open ? "Cerrar\nlista" : "Abrir\nlista");
  }
  if (control.matches("[data-archive-zoom], [data-text-zoom]")) {
    return action((control.dataset.archiveZoom || control.dataset.textZoom) === "increase" ? "Ampliar\ntexto" : "Reducir\ntexto");
  }
  if (control.matches("input[type=radio]")) return action(control.closest('[data-filter-menu="order"]') ? "Cambiar\norden" : "Aplicar\nfiltro");
  if (control.matches("input[type=checkbox], select")) return action("Elegir\nopción");
  if (control.matches("input, textarea")) return action("Escribir");
  if (control.matches('a[target="_blank"]')) return action("Abrir\npestaña");
  if (control.matches("a[href]")) return action(control.getAttribute("href").startsWith("#") ? "Ir a\nsección" : "Volver\nal archivo");
  return action("Activar");
}

/** Only opaque, neutral blacks count; photographs are intentionally unknown. */
function isBlack(color) {
  const match = color.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return false;
  const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).map(Number);
  return a === 1 && Math.max(r, g, b) <= 12 && Math.max(r, g, b) - Math.min(r, g, b) <= 1;
}

function createBackdropCheck(cursor, schedule) {
  let dirty = true;
  let candidates = [];
  const media = "img, video, canvas, svg";
  const transparent = (color) => color === "transparent" || color === "rgba(0, 0, 0, 0)";
  const intersection = (a, b) => {
    const left = Math.max(a.left, b.left), right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top), bottom = Math.min(a.bottom, b.bottom);
    return right > left && bottom > top ? { left, right, top, bottom } : null;
  };
  function points(rect) {
    const insetX = Math.min(0.25, (rect.right - rect.left) / 4);
    const insetY = Math.min(0.25, (rect.bottom - rect.top) / 4);
    return [rect.left + insetX, (rect.left + rect.right) / 2, rect.right - insetX]
      .flatMap((x) => [rect.top + insetY, (rect.top + rect.bottom) / 2, rect.bottom - insetY].map((y) => [x, y]));
  }
  function fullyBlack(rectangles) {
    const styles = new Map();
    const styleOf = (node) => {
      if (!styles.has(node)) styles.set(node, getComputedStyle(node));
      return styles.get(node);
    };
    const effects = (style) => (style.maskImage || style.webkitMaskImage || "none") !== "none"
      || style.filter !== "none" || (style.backdropFilter && style.backdropFilter !== "none")
      || style.mixBlendMode !== "normal" || Number(style.opacity) < 1;
    const textured = (style) => style.backgroundImage !== "none" || effects(style);
    function blackAt(x, y) {
      let found = false;
      for (let node = document.elementFromPoint(x, y); node; node = node.parentElement) {
        const style = styleOf(node);
        if (effects(style)) return false;
        if (found) continue;
        if (node.matches(media) || node.closest("svg") || style.backgroundImage !== "none") return false;
        if (!transparent(style.backgroundColor)) {
          if (!isBlack(style.backgroundColor)) return false;
          found = true;
        }
      }
      return found;
    }
    if (dirty) {
      candidates = [...document.body.querySelectorAll("*")].filter((node) => {
        if (node === cursor || cursor.contains(node) || node.closest("svg") && !node.matches("svg")) return false;
        const style = styleOf(node);
        return node.matches(media) || textured(style) || !transparent(style.backgroundColor) && !isBlack(style.backgroundColor);
      });
      dirty = false;
    }
    const selection = getSelection();
    const selected = selection && !selection.isCollapsed
      ? Array.from({ length: selection.rangeCount }, (_, i) => [...selection.getRangeAt(i).getClientRects()]).flat() : [];
    const field = document.querySelector("input:focus, textarea:focus");
    if (field?.selectionStart != null && field.selectionStart !== field.selectionEnd) selected.push(field.getBoundingClientRect());
    return rectangles.every((rect) => {
      if (rect.left < 0 || rect.top < 0 || rect.right > innerWidth || rect.bottom > innerHeight) return false;
      if (selected.some((range) => intersection(rect, range)) || !points(rect).every(([x, y]) => blackAt(x, y))) return false;
      // Inspect crossing surfaces too: a narrow photo/light sliver can miss the corners.
      return candidates.every((node) => {
        const overlap = intersection(rect, node.getBoundingClientRect());
        return !overlap || points(overlap).every(([x, y]) => blackAt(x, y));
      });
    });
  }
  new MutationObserver((records) => {
    let changed = false;
    for (const record of records) {
      if (record.target === cursor || cursor.contains(record.target)) continue;
      if (record.type === "childList") {
        if (![...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1 && node !== cursor)) continue;
        dirty = true;
      } else if (record.attributeName === "class") {
        if (record.target !== document.documentElement && !record.target.matches(".archive-card__link")) dirty = true;
      } else if (record.attributeName === "style") {
        // Motion updates only geometry; rescan styles when a painted surface changes.
        if (/background|mask|filter|opacity|--bg|--fg/.test(record.target.style.cssText + record.oldValue)) dirty = true;
      }
      changed = true;
    }
    if (changed) schedule();
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ["style", "class", "hidden", "open"] });
  return { fullyBlack, invalidate: () => { dirty = true; } };
}

export function initCursor() {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches) return;
  const cursor = document.createElement("div");
  cursor.className = "site-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.hidden = true;
  const point = document.createElement("span");
  point.className = "site-cursor__point";
  const label = document.createElement("span");
  label.className = "site-cursor__label";
  cursor.append(point, label);
  document.body.append(cursor);
  let frame = 0;
  let x = 0;
  let y = 0;
  let visible = false;
  let labelWidth = 0;
  let labelHeight = 0;
  let surface = document.body;
  let bounds = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  const backdrop = createBackdropCheck(cursor, schedule);

  function measureSurface() {
    bounds = surface === document.body ? { left: 0, top: 0, right: innerWidth, bottom: innerHeight } : surface.getBoundingClientRect();
  }
  function placeCursor() {
    const next = document.querySelector("dialog[open]") || document.body;
    if (cursor.parentElement !== next) {
      next.append(cursor);
      surface = next;
      measureSurface();
    }
  }
  function hide() {
    visible = false;
    cursor.hidden = true;
    document.documentElement.classList.remove("has-custom-cursor");
  }
  function render() {
    frame = 0;
    if (!visible || !finePointer.matches) return;
    placeCursor();
    const interaction = interactionAt(document.elementFromPoint(x, y));
    const editing = interaction?.control.matches("input, textarea") && interaction.control === document.activeElement;
    cursor.classList.toggle("site-cursor--interactive", Boolean(interaction));
    cursor.classList.toggle("site-cursor--labelled", Boolean(interaction && !editing));
    cursor.classList.toggle("site-cursor--still", reducedMotion.matches);
    const text = interaction?.text.replace(/\n/g, " ");
    if (text && (label.textContent !== text || !labelWidth)) {
      label.textContent = text;
      labelWidth = label.offsetWidth;
      labelHeight = label.offsetHeight;
    }
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const gap = 24;
    const inset = 8;
    const labelX = x + gap + labelWidth > bounds.right - inset ? -gap - labelWidth : gap;
    const labelY = Math.max(bounds.top + inset - y, Math.min(-labelHeight / 2, bounds.bottom - inset - labelHeight - y));
    label.style.transform = `translate3d(${labelX}px, ${labelY}px, 0)`;
    // The larger footprint also contains the point throughout its rotation/growth.
    const areas = [{ left: x - 13, right: x + 13, top: y - 13, bottom: y + 13 }];
    if (getComputedStyle(label).visibility === "visible") {
      areas.push({ left: x + labelX, right: x + labelX + labelWidth, top: y + labelY, bottom: y + labelY + labelHeight });
    }
    cursor.classList.toggle("site-cursor--on-black", backdrop.fullyBlack(areas));
  }
  function schedule() { if (visible && !frame) frame = requestAnimationFrame(render); }
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || event.pointerType !== "mouse") { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    visible = true;
    cursor.hidden = false;
    document.documentElement.classList.add("has-custom-cursor");
    schedule();
  }, { passive: true });
  document.addEventListener("pointerdown", (event) => { if (event.pointerType !== "mouse") hide(); }, { passive: true });
  document.addEventListener("pointerover", schedule, { passive: true });
  document.addEventListener("pointerout", (event) => { if (!event.relatedTarget) hide(); else schedule(); }, { passive: true });
  document.addEventListener("scroll", schedule, { capture: true, passive: true });
  document.addEventListener("toggle", schedule, true);
  document.addEventListener("selectionchange", schedule);
  document.addEventListener("click", schedule);
  document.addEventListener("close", () => { placeCursor(); schedule(); }, true);
  document.addEventListener("keydown", (event) => { if (event.key === "Tab") hide(); });
  window.addEventListener("blur", hide);
  window.addEventListener("resize", () => { measureSurface(); backdrop.invalidate(); labelWidth = 0; schedule(); }, { passive: true });
  finePointer.addEventListener("change", hide);
  reducedMotion.addEventListener("change", schedule);
  document.fonts.ready.then(() => { labelWidth = 0; schedule(); });
}
