const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function slugSeed(slug) {
  let seed = 2166136261;
  for (const character of slug) {
    seed = Math.imul(seed ^ character.codePointAt(0), 16777619);
  }
  return seed >>> 0;
}

function coverProfile(target, height) {
  const seed = slugSeed(target.closest(".archive-card")?.dataset.slug || "cover");
  const requestedAmplitude = Number(target.dataset.coverAmplitude) || 4 + (seed % 601) / 100;
  const requestedScale = Number(target.dataset.coverScale) || 1.025 + ((seed >>> 9) % 1001) / 100000;
  const direction = target.dataset.coverDirection === "-1" ? -1 : target.dataset.coverDirection === "1" ? 1 : seed % 2 ? -1 : 1;
  // Limit translation to the overscan available at 4.5% zoom. Even short banners
  // keep their original ratio without exposing a moving empty edge.
  const amplitude = Math.min(clamp(requestedAmplitude, 4, 10), Math.max(0, height * 0.045 / 2 - 0.75));
  const minimumScale = Math.max(clamp(requestedScale, 1.025, 1.045), height ? 1 + 2 * (amplitude + 0.75) / height : 1.025);
  return {
    amplitude,
    direction,
    minimumScale: Math.min(minimumScale, 1.045),
    maximumScale: Math.min(minimumScale + 0.01, 1.045),
    response: 0.08 + ((seed >>> 12) % 501) / 10000,
    curve: 0.85 + (seed % 401) / 1000,
  };
}

/**
 * Lenis only smooths wheel input. Touch, keyboard and the scrollbar stay native.
 * The archive owns repetition/recentering; this component owns motion only.
 */
export function initArchiveMotion({ onFrame } = {}) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coverEffects = new Map();
  let lenis = null;
  let lenisModule = null;
  let frame = 0;
  let destroyed = false;
  let lastY = window.scrollY;

  function wake() {
    if (!frame && !destroyed && !document.hidden) frame = window.requestAnimationFrame(tick);
  }

  function clearCoverEffects() {
    coverEffects.forEach(({ animation }) => animation.cancel());
    coverEffects.clear();
  }

  function progressAt(rect) {
    return clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
  }

  function collectCovers() {
    coverEffects.forEach((entry, target) => {
      if (!target.isConnected) {
        entry.animation.cancel();
        coverEffects.delete(target);
      }
    });
    if (preference.matches || !Element.prototype.animate) return;

    document.querySelectorAll(".archive-card__media").forEach((media) => {
      const target = media.querySelector("[data-cover-motion], .archive-card__image");
      if (!target) return;
      const rect = media.getBoundingClientRect();
      const existing = coverEffects.get(target);
      if (existing && Math.abs(existing.height - rect.height) < 1) {
        existing.top = rect.top + window.scrollY;
        return;
      }
      existing?.animation.cancel();

      const profile = coverProfile(target, rect.height);
      const translation = profile.amplitude * profile.direction;
      const animation = target.animate(
        [
          { transform: `translateY(${-translation}px) scale(${profile.minimumScale})` },
          { transform: `translateY(${translation}px) scale(${profile.maximumScale})` },
        ],
        { duration: 1000, fill: "both" },
      );
      animation.pause();
      const progress = progressAt(rect) ** profile.curve;
      animation.currentTime = progress * 1000;
      coverEffects.set(target, { animation, top: rect.top + window.scrollY, height: rect.height, progress, profile });
    });
    wake();
  }

  function updateCovers(delta) {
    const velocity = Math.abs(delta) < 240 ? clamp(delta / 600, -0.025, 0.025) : 0;
    let settling = false;
    coverEffects.forEach((entry) => {
      const rect = { top: entry.top - window.scrollY, height: entry.height };
      if (rect.top + rect.height < -80 || rect.top > window.innerHeight + 80) return;
      const target = clamp(progressAt(rect) ** entry.profile.curve + velocity * entry.profile.direction, 0, 1);
      const difference = target - entry.progress;
      if (Math.abs(difference) < 0.0005) return;
      entry.progress += difference * entry.profile.response;
      entry.animation.currentTime = entry.progress * 1000;
      settling = true;
    });
    return settling;
  }

  async function enableSmoothScroll() {
    if (preference.matches || destroyed || lenis) return;
    try {
      lenisModule ??= import("../assets/vendor/lenis/lenis.mjs");
      const { default: Lenis } = await lenisModule;
      if (preference.matches || destroyed || lenis) return;
      lenis = new Lenis({
        autoRaf: false,
        autoResize: false,
        smoothWheel: true,
        lerp: 0.14,
        wheelMultiplier: 1,
        syncTouch: false,
        infinite: false,
        anchors: true,
        prevent: (node) => node.matches("select, input, textarea, [data-lenis-prevent]"),
      });
      wake();
    } catch {
      // Native scrolling and the archive loop remain available without Lenis.
    }
  }

  function tick(time) {
    frame = 0;
    if (destroyed || document.hidden) return;
    lenis?.raf(time);

    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;

    // Recycle before updating transforms; the loop uses cached row dimensions.
    if (delta) onFrame?.({ time, scrollY: y, velocity: delta });
    const settling = !preference.matches && updateCovers(delta);
    if (settling || lenis?.isScrolling === "smooth") wake();
  }

  function reset() {
    // A recycled entry keeps its visual state while the archive recenters.
    lastY = window.scrollY;
  }

  function scrollTo(y, { immediate = false } = {}) {
    if (!Number.isFinite(y)) return;
    if (lenis) {
      lenis.scrollTo(y, { immediate, force: true });
    } else {
      window.scrollTo({ top: y, behavior: immediate || preference.matches ? "instant" : "smooth" });
    }
    if (immediate) reset();
    wake();
  }

  function resize() {
    collectCovers();
    lenis?.resize();
    reset();
  }

  function rebase(offset) {
    // Lenis.resize resets its target. Save the remaining input BEFORE resizing,
    // then restore it after one compensation for the whole recycling batch.
    const remaining = lenis ? lenis.targetScroll - lenis.animatedScroll : 0;
    const y = window.scrollY + offset;
    lenis?.resize();
    lenis?.reset();
    scrollTo(y, { immediate: true });
    if (lenis && Math.abs(remaining) > 0.5) {
      lenis.scrollTo(y + remaining, { programmatic: false, lerp: 0.14, force: true });
    }
    collectCovers();
  }

  function onPreferenceChange() {
    if (preference.matches) {
      lenis?.destroy();
      lenis = null;
      clearCoverEffects();
    } else {
      collectCovers();
      enableSmoothScroll();
    }
    reset();
    wake();
  }

  function onVisibilityChange() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden && !destroyed) {
      reset();
      wake();
    }
  }

  function destroy() {
    destroyed = true;
    window.cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
    clearCoverEffects();
    preference.removeEventListener("change", onPreferenceChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", wake);
    window.removeEventListener("wheel", wake);
  }

  preference.addEventListener("change", onPreferenceChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("wheel", wake, { passive: true });
  collectCovers();
  enableSmoothScroll();
  wake();

  return { scrollTo, resize, rebase, reset, destroy };
}
