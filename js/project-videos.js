/** Play visible videos without starting measurement or offscreen loop copies. */
export function initProjectVideos(main) {
  const visible = new Map();
  const desktop = matchMedia('(min-width: 901px)');
  let suspended = false;

  function update(video) {
    if (video.isConnected && main.contains(video) && !suspended && !document.hidden && desktop.matches && visible.get(video)) {
      video.muted = true;
      if (video.paused) video.play().catch(() => {});
    } else video.pause();
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!visible.has(entry.target)) continue;
      visible.set(entry.target, entry.isIntersecting);
      update(entry.target);
    }
  });

  function forget(video) {
    video.pause();
    observer.unobserve(video);
    visible.delete(video);
  }

  function scan(records = []) {
    // Reinserted pooled cards get a fresh observation, even at the same position.
    for (const record of records) for (const node of record.removedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches('video')) forget(node);
      node.querySelectorAll('video').forEach(forget);
    }
    for (const video of visible.keys()) if (!main.contains(video)) forget(video);
    for (const video of main.querySelectorAll('video')) {
      if (visible.has(video)) continue;
      // Native autoplay remains in the HTML fallback. The observer owns it here.
      video.autoplay = false;
      video.defaultMuted = video.muted = true;
      video.loop = video.playsInline = true;
      video.pause();
      visible.set(video, false);
      observer.observe(video);
    }
  }

  const refresh = () => visible.forEach((_, video) => update(video));
  scan();
  new MutationObserver(scan).observe(main, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', refresh);
  desktop.addEventListener('change', refresh);
  addEventListener('pagehide', () => visible.forEach((_, video) => video.pause()));
  addEventListener('pageshow', refresh);

  return {
    pause() { suspended = true; refresh(); },
    resume() { suspended = false; refresh(); },
  };
}
