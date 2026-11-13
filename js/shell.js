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


/** Rank the existing page colours without changing the project palette. */
function faviconLuminance(colour) {
  const hex = colour.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  const channels = hex
    ? (hex.length === 3 ? [...hex].map((digit) => digit + digit) : hex.match(/../g)).map((part) => parseInt(part, 16))
    : colour.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) return null;
  const linear = channels.map((channel) => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

/** Tab chrome is private; the exposed colour-scheme preference is our signal. */
async function updateFavicon() {
  try {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    const response = await fetch(new URL("../assets/Favicon.svg", import.meta.url));
    if (!response.ok) return;
    const svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement;
    if (svg.localName !== "svg") return;
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const render = () => {
      const style = getComputedStyle(document.body);
      const palette = [style.backgroundColor, style.getPropertyValue("--accent").trim() || style.color]
        .map((colour) => ({ colour, luminance: faviconLuminance(colour) }))
        .filter(({ luminance }) => luminance !== null)
        .sort((a, b) => a.luminance - b.luminance);
      if (!palette.length) return;
      const { colour } = scheme.matches ? palette[palette.length - 1] : palette[0];
      svg.querySelectorAll("path").forEach((path) => path.setAttribute("fill", colour));
      const href = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
      if (icon.href !== href) icon.href = href;
    };
    render();
    scheme.addEventListener("change", render);
    window.addEventListener("pageshow", render);
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
