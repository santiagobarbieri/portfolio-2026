let pending = 0;
let overlay;
let hideTimer;
let visibleSince = 0;
const minimumDisplay = 700;

export function startLoading(label = "Cargando") {
  const root = document.documentElement;
  const boot = window.portfolioPageLoad;
  boot?.claim();
  overlay ||= document.querySelector(".site-loader");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "site-loader";
    overlay.hidden = true;
    overlay.setAttribute("role", "status");
    const rose = document.createElement("span");
    rose.className = "site-loader__rose";
    rose.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "site-loader__label visually-hidden";
    overlay.append(rose, text);
    document.body.append(overlay);
  }
  if (!root.hasAttribute("data-page-loading")) visibleSince = performance.now();
  else if (!visibleSince) visibleSince = boot?.started ?? performance.now();
  clearTimeout(hideTimer);
  pending += 1;
  overlay.lastElementChild.textContent = label;
  overlay.hidden = false;
  root.setAttribute("data-page-loading", "");
  document.querySelector("main")?.setAttribute("aria-busy", "true");
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    pending = Math.max(0, pending - 1);
    if (pending) return;
    hideTimer = setTimeout(() => {
      if (pending) return;
      overlay.hidden = true;
      root.removeAttribute("data-page-loading");
      document.querySelector("main")?.removeAttribute("aria-busy");
    }, Math.max(0, minimumDisplay - (performance.now() - visibleSince)));
  };
}

export async function waitForImages(container = document) {
  // Fonts settle the layout before deciding which lazy images are in view.
  await document.fonts.ready;
  const visible = [...container.querySelectorAll("img")].filter((image) => {
    const rect = image.getBoundingClientRect();
    return image.loading !== "lazy" || (rect.top < innerHeight && rect.bottom > 0);
  });
  await Promise.all(visible.map((image) => {
    image.loading = "eager";
    return image.decode().catch(() => {});
  }));
  // Commit the final layout while the opaque loader still covers the page.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export function watchLazyImages(container) {
  const parents = new Set();
  container.querySelectorAll("img[loading=lazy]").forEach((image) => {
    const parent = image.closest(".project-section__images");
    if (!parent) return;
    parents.add(parent);
    const update = () => parent.setAttribute("aria-busy", String([...parent.querySelectorAll("img")].some((item) => !item.complete)));
    image.addEventListener("load", update, { once: true });
    image.addEventListener("error", update, { once: true });
  });
  parents.forEach((parent) => parent.setAttribute("aria-busy", String([...parent.querySelectorAll("img")].some((item) => !item.complete))));
}
