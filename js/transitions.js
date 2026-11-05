/*
 * Classic, parser-blocking bootstrap after CSS: pagereveal can fire before modules.
 * https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
 */
(() => {
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
