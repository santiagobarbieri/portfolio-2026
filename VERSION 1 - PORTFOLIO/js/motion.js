/** Short wheel smoothing only. Touch, keyboard and internal readers remain native. */
export function initSmoothScroll({ onFrame } = {}) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let lenis = null;
  let frame = 0;
  let destroyed = false;
  let lastY = scrollY;
  let module = null;

  function wake() {
    if (!frame && !destroyed && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function reset() { lastY = scrollY; }
  function resize() { lenis?.resize(); reset(); }
  async function enable() {
    if (preference.matches || destroyed || lenis) return;
    try {
      module ??= import("../assets/vendor/lenis/lenis.mjs");
      const { default: Lenis } = await module;
      if (preference.matches || destroyed || lenis) return;
      lenis = new Lenis({
        autoRaf: false, autoResize: false, smoothWheel: true,
        lerp: 0.2, wheelMultiplier: 0.95, syncTouch: false,
        infinite: false, anchors: false,
        prevent: (node) => node.matches("select, input, textarea, dialog[open], [data-lenis-prevent]"),
      });
      wake();
    } catch { /* Native scrolling remains available if the local module fails. */ }
  }
  function tick(time) {
    frame = 0;
    if (destroyed || document.hidden) return;
    lenis?.raf(time);
    const y = scrollY;
    const delta = y - lastY;
    lastY = y;
    if (delta) onFrame?.({ time, scrollY: y, velocity: delta });
    if (lenis?.isScrolling === "smooth") wake();
  }
  function scrollTo(y, { immediate = false } = {}) {
    if (!Number.isFinite(y)) return;
    if (lenis) lenis.scrollTo(y, { immediate, force: true });
    else window.scrollTo({ top: y, behavior: immediate || preference.matches ? "instant" : "smooth" });
    if (immediate) reset();
    wake();
  }
  function rebase(offset) {
    const remaining = lenis ? lenis.targetScroll - lenis.animatedScroll : 0;
    const y = scrollY + offset;
    lenis?.resize();
    lenis?.reset();
    scrollTo(y, { immediate: true });
    if (lenis && Math.abs(remaining) > 0.5) lenis.scrollTo(y + remaining, { programmatic: false, lerp: 0.2, force: true });
  }
  function changePreference() {
    if (preference.matches) { lenis?.destroy(); lenis = null; }
    else enable();
    reset();
    wake();
  }
  function visibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) { resize(); wake(); }
  }
  const observer = onFrame ? null : new ResizeObserver(resize);
  observer?.observe(document.body);
  function destroy() {
    destroyed = true;
    cancelAnimationFrame(frame);
    lenis?.destroy();
    observer?.disconnect();
    preference.removeEventListener("change", changePreference);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", wake);
    window.removeEventListener("wheel", wake);
  }
  preference.addEventListener("change", changePreference);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("wheel", wake, { passive: true });
  enable();
  return { scrollTo, resize, rebase, reset, destroy, stop: () => lenis?.stop(), start: () => lenis?.start() };
}

export const initArchiveMotion = initSmoothScroll;
