/*
 * Parser-blocking bootstrap: show the initial loader before body content paints.
 * The page module takes ownership once its dependencies have loaded.
 * https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
 */
(() => {
  const root = document.documentElement;
  if (root.hasAttribute("data-load-screen")) {
    root.setAttribute("data-page-loading", "");
    const started = performance.now();
    let claimed = false;
    // Recover on an actual module failure; slow downloads keep their loader.
    const recover = (event) => {
      const scriptFailed = event.target instanceof HTMLScriptElement && event.target.type === "module";
      const codeFailed = event instanceof ErrorEvent && /\/js\//.test(event.filename);
      if (!scriptFailed && !codeFailed) return;
      setTimeout(() => {
        if (claimed) return;
        root.removeAttribute("data-page-loading");
        document.querySelector(".site-loader")?.setAttribute("hidden", "");
        document.querySelector("main")?.removeAttribute("aria-busy");
        const fallback = document.querySelector(".entry-fallback");
        if (fallback) {
          fallback.querySelector("h1").textContent = "No se pudo cargar el proyecto";
          fallback.querySelector("p").textContent = "Recargá la página o volvé al archivo para intentarlo otra vez.";
        }
      }, Math.max(0, 700 - (performance.now() - started)));
    };
    window.addEventListener("error", recover, true);
    window.portfolioPageLoad = {
      started,
      claim() { claimed = true; window.removeEventListener("error", recover, true); },
    };
  }

  const observeTransition = ({ viewTransition }) => {
    if (!viewTransition) return;
    viewTransition.ready.catch((error) => {
      // A skipped transition still completes navigation normally.
      const expectedSkip = error.name === "AbortError" || error.name === "TimeoutError"
        || (error.name === "InvalidStateError" && /opt-in disabled|document.*hidden/i.test(error.message));
      if (!expectedSkip) window.reportError(error);
    });
  };
  window.addEventListener("pageswap", observeTransition);
  window.addEventListener("pagereveal", observeTransition);
})();
