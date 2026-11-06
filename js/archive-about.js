const levels = [100, 125, 150, 175, 200];
let level = 150;
let readingProgress = 0;
const noteState = new Map([["testament", false], ["certificates", false], ["interests", false]]);
try {
  const saved = Number(localStorage.getItem("portfolio-text-zoom"));
  if (levels.includes(saved)) level = saved;
} catch {}

export function prepareArchiveAbout(card) {
  const text = card.querySelector("[data-archive-testament]");
  if (!text) return;
  text.dataset.zoom = level;
  card.querySelector("[data-archive-zoom-label]").textContent = `${level}%`;
  card.querySelector('[data-archive-zoom="increase"]').disabled = level === levels.at(-1);
  card.querySelector('[data-archive-zoom="decrease"]').disabled = level === levels[0];
  card.querySelectorAll("[data-archive-note]").forEach((note) => {
    if (note.open !== noteState.get(note.dataset.archiveNote)) note.open = noteState.get(note.dataset.archiveNote);
  });
  function restoreReadingPosition() {
    if (!text.isConnected || !text.closest("details").open || !text.clientHeight) return;
    text.scrollTop = readingProgress * Math.max(0, text.scrollHeight - text.clientHeight);
  }
  restoreReadingPosition();
  if (!text.isConnected) requestAnimationFrame(restoreReadingPosition);
}

export function initArchiveAbout(stream) {
  stream.addEventListener("scroll", (event) => {
    const text = event.target;
    if (!text.matches?.("[data-archive-testament]") || !text.closest("details").open || !text.clientHeight) return;
    readingProgress = text.scrollTop / Math.max(1, text.scrollHeight - text.clientHeight);
  }, { capture: true, passive: true });
  stream.addEventListener("toggle", (event) => {
    const note = event.target;
    if (!note.matches("[data-archive-note]")) return;
    // Read this copy as a whole before syncing: several notes may toggle together.
    let changed = false;
    note.closest(".archive-about").querySelectorAll("[data-archive-note]").forEach((item) => {
      if (noteState.get(item.dataset.archiveNote) === item.open) return;
      noteState.set(item.dataset.archiveNote, item.open);
      changed = true;
    });
    if (changed) stream.querySelectorAll(".archive-about").forEach(prepareArchiveAbout);
  }, true);
  stream.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archive-zoom]");
    if (!button) return;
    const step = button.dataset.archiveZoom === "increase" ? 1 : -1;
    level = levels[Math.max(0, Math.min(levels.length - 1, levels.indexOf(level) + step))];
    stream.querySelectorAll(".archive-about").forEach(prepareArchiveAbout);
    try { localStorage.setItem("portfolio-text-zoom", String(level)); } catch {}
  });
}
