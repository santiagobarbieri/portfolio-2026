import { initShell } from "./shell.js";
import { initAccordions } from "./accordion.js";

initShell({ invertTheme: true });
initAccordions();

const pages = {
  archive: { label: "Archivo", path: "./index.html" },
  about: { label: "Sobre mí", path: "./about.html" },
  contact: { label: "Contacto", path: "./contact.html" },
};
const origin = new URLSearchParams(window.location.search).get("from");
const page = pages[origin] || pages.archive;
const closeLink = document.querySelector("[data-close-navigation]");
closeLink.href = page.path;
closeLink.setAttribute("aria-label", `Cerrar navegación y volver a ${page.label}`);
document.querySelector("[data-origin-label]").textContent = "Archivo";

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    window.location.href = page.path;
  }
});

const directory = document.querySelector(".navigation-directory");
const main = document.querySelector(".navigation-layout");
const groups = [...directory.querySelectorAll("details")];
let compactLayout = null;

function fitNavigation() {
  const threshold = window.matchMedia("(pointer: coarse)").matches ? 600 : 470;
  const compact = main.getBoundingClientRect().height < threshold;
  if (compact === compactLayout) return;
  compactLayout = compact;
  document.body.dataset.compact = String(compact);
  groups.forEach((group) => {
    if (compact) group.setAttribute("name", "navigation-group");
    else group.removeAttribute("name");
    group.open = !compact;
  });
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

async function initPreview() {
  const feature = document.querySelector("[data-navigation-preview]");
  const link = feature.querySelector("[data-preview-link]");
  const caption = feature.querySelector("[data-preview-caption]");
  let projects;
  try {
    const response = await fetch(new URL("../data/projects.json", import.meta.url));
    if (!response.ok) return;
    projects = await response.json();
    projects = projects.filter((project) => project.slug && project.title);
    if (!projects.length) return;
  } catch {
    return; // The static project preview remains available.
  }

  let index = 0;
  let wheelDistance = 0;
  let lastStep = 0;
  let renderVersion = 0;
  let touchStart = null;

  function placeholder(project) {
    const block = makeElement("div", "navigation-feature__placeholder");
    block.dataset.previewMedia = "";
    block.setAttribute("aria-hidden", "true");
    block.append(
      makeElement("span", "navigation-feature__label", "Portada pendiente"),
      makeElement("span", "navigation-feature__title", project.title),
      makeElement("p", "navigation-feature__text", project.description || "Completar"),
    );
    return block;
  }

  async function renderPreview() {
    const version = ++renderVersion;
    const project = projects[index];
    feature.setAttribute("aria-busy", "true");
    let preview = placeholder(project);
    if (project.cover) {
      const source = new URL(project.cover, document.baseURI);
      if (source.origin === window.location.origin) {
        const image = new Image();
        image.className = "navigation-feature__image";
        image.dataset.previewMedia = "";
        image.alt = project.alt || `${project.title} — ${project.type || "Proyecto"}`;
        if (project.w > 0 && project.h > 0) {
          image.width = project.w;
          image.height = project.h;
        }
        image.decoding = "async";
        image.src = source.href;
        try {
          await image.decode();
          preview = image;
        } catch {
          // A missing original never becomes a broken image in the navigation.
        }
      }
    }
    if (version !== renderVersion) return;
    link.replaceChildren(preview);
    link.href = `./project.html?p=${encodeURIComponent(project.slug)}`;
    link.setAttribute("aria-label", `Abrir ${project.title}`);
    feature.dataset.previewSlug = project.slug;
    caption.textContent = project.title;
    feature.setAttribute("aria-busy", "false");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      preview.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    }
  }

  function step(direction) {
    index = (index + direction + projects.length) % projects.length;
    renderPreview();
  }

  directory.addEventListener("wheel", (event) => {
    if (event.ctrlKey || !event.deltaY) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (Math.sign(delta) !== Math.sign(wheelDistance)) wheelDistance = 0;
    wheelDistance += delta;
    const now = performance.now();
    if (Math.abs(wheelDistance) >= 60 && now - lastStep >= 220) {
      step(Math.sign(wheelDistance));
      wheelDistance = 0;
      lastStep = now;
    }
  }, { passive: false });

  directory.addEventListener("keydown", (event) => {
    const direction = ["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) ? 1
      : ["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    step(direction);
  });

  directory.addEventListener("touchstart", (event) => {
    touchStart = event.touches[0]?.clientY ?? null;
  }, { passive: true });
  directory.addEventListener("touchend", (event) => {
    if (touchStart === null) return;
    const distance = touchStart - event.changedTouches[0].clientY;
    touchStart = null;
    if (Math.abs(distance) < 30) return;
    event.preventDefault();
    step(Math.sign(distance));
  }, { passive: false });

  renderPreview();
}

fitNavigation();
window.addEventListener("resize", fitNavigation, { passive: true });
initPreview();
