import { initShell } from "./shell.js";
import { initAccordions } from "./accordion.js";
import { initSmoothScroll } from "./motion.js";
import { startLoading, waitForImages } from "./loading.js";

function initTestamentReader() {
  const text = document.querySelector("[data-testament]");
  const label = document.querySelector("[data-text-zoom-label]");
  const increase = document.querySelector('[data-text-zoom="increase"]');
  const decrease = document.querySelector('[data-text-zoom="decrease"]');
  const levels = [100, 125, 150, 175, 200];
  let level = 150;
  try {
    const saved = Number(localStorage.getItem("portfolio-text-zoom"));
    if (levels.includes(saved)) level = saved;
  } catch {}

  function applyZoom() {
    // Keep the complete text and its reading position inside the fixed card.
    const progress = text.scrollTop / Math.max(1, text.scrollHeight - text.clientHeight);
    text.className = `about-entry__body${level === 100 ? "" : ` about-entry__body--${level}`}`;
    label.textContent = `${level}%`;
    increase.disabled = level === levels.at(-1);
    decrease.disabled = level === levels[0];
    text.scrollTop = progress * Math.max(0, text.scrollHeight - text.clientHeight);
    try { localStorage.setItem("portfolio-text-zoom", String(level)); } catch {}
  }

  increase.addEventListener("click", () => {
    level = levels[Math.min(levels.length - 1, levels.indexOf(level) + 1)];
    applyZoom();
  });
  decrease.addEventListener("click", () => {
    level = levels[Math.max(0, levels.indexOf(level) - 1)];
    applyZoom();
  });
  applyZoom();
}

const complete = startLoading("Cargando About");
try {
  initShell();
  initAccordions();
  initTestamentReader();
  const scroll = initSmoothScroll();
  const links = [...document.querySelectorAll(".about-index a")];
  links.forEach((link) => link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    scroll.scrollTo(scrollY + target.getBoundingClientRect().top - 120);
  }));
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    const first = [...visible].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    links.forEach((link) => first && link.hash === `#${first.id}` ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current"));
  }, { rootMargin: "-100px 0px -40%" });
  document.querySelectorAll(".about-chapter").forEach((chapter) => observer.observe(chapter));
  await waitForImages(document.querySelector("main"));
} finally { complete(); }
