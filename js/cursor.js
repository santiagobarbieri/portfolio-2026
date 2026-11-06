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
  cursor.append(point);
  document.body.append(cursor);
  let frame = 0;
  let x = 0;
  let y = 0;

  function placeCursor() {
    const surface = document.querySelector("dialog[open]") || document.body;
    if (cursor.parentElement !== surface) surface.append(cursor);
  }
  function hide() {
    cursor.hidden = true;
    document.documentElement.classList.remove("has-custom-cursor");
  }
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || event.pointerType !== "mouse") { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    const interactive = event.target.closest('a[href], button:not(:disabled), summary, input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [role="button"], [tabindex="0"]');
    const label = event.target.closest("label")?.querySelector("input:not(:disabled)");
    cursor.classList.toggle("site-cursor--interactive", Boolean(interactive || label));
    cursor.classList.toggle("site-cursor--still", reducedMotion.matches);
    cursor.hidden = false;
    document.documentElement.classList.add("has-custom-cursor");
    placeCursor();
    if (!frame) frame = requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = 0;
    });
  }, { passive: true });
  document.addEventListener("pointerdown", (event) => { if (event.pointerType !== "mouse") hide(); }, { passive: true });
  document.addEventListener("pointerout", (event) => { if (!event.relatedTarget) hide(); }, { passive: true });
  document.addEventListener("click", () => requestAnimationFrame(placeCursor));
  document.addEventListener("close", placeCursor, true);
  window.addEventListener("blur", hide);
  finePointer.addEventListener("change", hide);
}
