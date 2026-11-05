let pending = 0;
let overlay;
let hideTimer;
const minimumDisplay = 700;

export function startLoading(label = "Cargando") {
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "site-loader";
    overlay.hidden = true;
    overlay.setAttribute("role", "status");
    const rose = document.createElement("span");
    rose.className = "site-loader__rose";
    rose.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "visually-hidden";
    overlay.append(rose, text);
    document.body.append(overlay);
  }
  clearTimeout(hideTimer);
  pending += 1;
  overlay.lastElementChild.textContent = label;
  overlay.hidden = false;
  document.querySelector("main")?.setAttribute("aria-busy", "true");
  const started = performance.now();
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    pending = Math.max(0, pending - 1);
    if (pending) return;
    hideTimer = setTimeout(() => {
      if (pending) return;
      overlay.hidden = true;
      document.querySelector("main")?.removeAttribute("aria-busy");
    }, Math.max(0, minimumDisplay - (performance.now() - started)));
  };
}

export async function waitForImages(container = document) {
  const visible = [...container.querySelectorAll("img")].filter((image) => {
    const rect = image.getBoundingClientRect();
    return image.loading !== "lazy" || (rect.top < innerHeight && rect.bottom > 0);
  });
  await Promise.all(visible.map((image) => {
    image.loading = "eager";
    return image.decode().catch(() => {});
  }));
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
