import { startLoading, waitForImages, watchLazyImages } from "./loading.js";

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
    const hasPreviousTime = Boolean(clock.dateTime);
    clock.dateTime = now.toISOString();
    clock.textContent = label;
    if (hasPreviousTime && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clock.animate(
        [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
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
  if (document.body.classList.contains("entry-page")) {
    const complete = startLoading("Cargando proyecto");
    const timeout = setTimeout(complete, 10000);
    document.addEventListener("portfolio:content-ready", async () => {
      const content = document.querySelector("main");
      watchLazyImages(content);
      await waitForImages(content);
      clearTimeout(timeout);
      complete();
    }, { once: true });
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) document.querySelector(".site-loader")?.setAttribute("hidden", "");
  });
}
