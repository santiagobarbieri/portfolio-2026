import { initShell } from "./shell.js";
import { initAccordions } from "./accordion.js";

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

initShell();
initAccordions();
initTestamentReader();
