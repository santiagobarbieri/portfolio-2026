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


/** Browser-tab metadata follows the actual page surface and the project objective. */
async function updateFavicon() {
  try {
    const response = await fetch(new URL("../assets/Favicon.svg", import.meta.url));
    if (!response.ok) return;
    const svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement;
    if (svg.localName !== "svg") return;
    const style = getComputedStyle(document.body);
    const background = style.backgroundColor;
    const foreground = style.color;
    const [x, y, width, height] = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    const surface = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    for (const [name, value] of Object.entries({ x, y, width, height, fill: background })) surface.setAttribute(name, value);
    svg.querySelectorAll("path").forEach((path) => path.setAttribute("fill", foreground));
    svg.prepend(surface);
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  } catch { /* Keep the static brand favicon if enhancement is unavailable. */ }
}

export function setProjectTitle(project) {
  const objectives = { identity: "Identidad", books: "Diseño editorial", photography: "Fotografía", posters: "Afiches" };
  const objective = project.objective || objectives[project.family] || project.type || "Proyecto";
  document.title = `${project.title} | ${objective}`;
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
}

export function initShell() {
  initClock();
  initCursor();
  updateFavicon();
}
