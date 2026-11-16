/* Keep the temporary small-screen notice independent of the desktop experience. */
(() => {
  const smallScreen = matchMedia("(max-width: 900px)");
  const root = document.documentElement;
  const notice = document.querySelector(".mobile-status");
  const entries = [...document.querySelectorAll("script[data-desktop-src]")];
  const previousInert = new WeakMap();
  let started = false;

  function lock(element) {
    if (!(element instanceof HTMLElement) || element === notice || element.matches("script, style")) return;
    if (smallScreen.matches) {
      if (!previousInert.has(element)) previousInert.set(element, element.inert);
      if (!element.inert) element.inert = true;
    } else if (previousInert.has(element)) {
      element.inert = previousInert.get(element);
      previousInert.delete(element);
    }
  }

  function update() {
    if (smallScreen.matches) {
      document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
      root.removeAttribute("data-page-loading");
      document.querySelector(".site-loader")?.setAttribute("hidden", "");
      document.querySelector("main")?.removeAttribute("aria-busy");
    }
    [...document.body.children].forEach(lock);
    if (smallScreen.matches) {
      if (document.activeElement !== notice) notice?.focus({ preventScroll: true });
      return;
    }
    if (started) return;
    started = true;
    // Restore the normal Rose handoff when a desktop viewport becomes available.
    if (window.portfolioPageLoad) window.portfolioPageLoad.started = performance.now();
    root.setAttribute("data-page-loading", "");
    document.querySelector(".site-loader")?.removeAttribute("hidden");
    for (const entry of entries) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = entry.dataset.desktopSrc;
      script.dataset.desktopEntry = "";
      entry.replaceWith(script);
    }
  }

  smallScreen.addEventListener("change", update);
  new MutationObserver((records) => {
    if (!smallScreen.matches) return;
    for (const record of records) {
      if (record.type === "childList" && record.target === document.body) record.addedNodes.forEach(lock);
      // Desktop resize handlers must not reactivate controls beneath the notice.
      if (record.type === "attributes" && record.target.parentElement === document.body) lock(record.target);
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["inert"] });
  update();
})();
