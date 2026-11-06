import { initCursor } from "./cursor.js";

const timeZone = "America/Argentina/Buenos_Aires";

function initClock() {
  const clock = document.querySelector("[data-local-clock]");
  if (!clock) return;

  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  function updateClock() {
    const now = new Date();
    const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
    const label = `${parts.day} ${parts.month.replace(".", "")} ${parts.year} – ${parts.hour}:${parts.minute}`;
    if (clock.textContent === label) return;
    clock.dateTime = now.toISOString();
    clock.textContent = label;
  }

  updateClock();
  function scheduleNextMinute() {
    window.setTimeout(() => {
      updateClock();
      scheduleNextMinute();
    }, 60000 - Date.now() % 60000);
  }
  scheduleNextMinute();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateClock();
  });
}

export function initShell() {
  initClock();
  initCursor();
}
