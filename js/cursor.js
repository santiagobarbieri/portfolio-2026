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
  document.addEventListener("click", schedule);
  document.addEventListener("close", () => { placeCursor(); schedule(); }, true);
  document.addEventListener("keydown", (event) => { if (event.key === "Tab") hide(); });
  window.addEventListener("blur", hide);
  window.addEventListener("resize", () => { measureSurface(); labelWidth = 0; schedule(); }, { passive: true });
  finePointer.addEventListener("change", hide);
  reducedMotion.addEventListener("change", schedule);
  document.fonts.ready.then(() => { labelWidth = 0; schedule(); });
}
