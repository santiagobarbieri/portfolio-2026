const levels = [100, 125, 150, 175, 200];
let level = 150;
try {
  const saved = Number(localStorage.getItem("portfolio-text-zoom"));
  if (levels.includes(saved)) level = saved;
} catch {}

export function prepareArchiveAbout(card) {
  const text = card.querySelector("[data-archive-testament]");
  if (!text) return;
  const progress = text.scrollTop / Math.max(1, text.scrollHeight - text.clientHeight);
  text.dataset.zoom = level;
  card.querySelector("[data-archive-zoom-label]").textContent = `${level}%`;
  card.querySelector('[data-archive-zoom="increase"]').disabled = level === levels.at(-1);
  card.querySelector('[data-archive-zoom="decrease"]').disabled = level === levels[0];
  text.scrollTop = progress * Math.max(0, text.scrollHeight - text.clientHeight);
}

export function initArchiveAbout(stream) {
  stream.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archive-zoom]");
    if (!button) return;
    const step = button.dataset.archiveZoom === "increase" ? 1 : -1;
    level = levels[Math.max(0, Math.min(levels.length - 1, levels.indexOf(level) + step))];
    stream.querySelectorAll(".archive-about").forEach(prepareArchiveAbout);
    try { localStorage.setItem("portfolio-text-zoom", String(level)); } catch {}
  });
}
