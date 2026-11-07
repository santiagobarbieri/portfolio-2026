import { collectProjectAssets } from "./project-assets.js";
import { startLoading, waitForImages } from "./loading.js";
import { initShell } from "./shell.js";

const viewport = document.querySelector("[data-sandbox-viewport]");
const world = document.querySelector("[data-sandbox-world]");
const controls = document.querySelector("[data-sandbox-controls]");
const dialog = document.querySelector("[data-sandbox-detail]");
const scaleLabel = document.querySelector("[data-sandbox-scale]");
const storageKey = "portfolio-sandbox-camera-v1";
const bounds = { w: 3800, h: 3250 };
const groups = [
  { id: "books", name: "Portadas de libro", short: "Libros", x: 690, y: 700, r: 420, width: 128, height: 182 },
  { id: "posters", name: "Afiches y formatos", short: "Afiches", x: 1830, y: 1040, r: 560, width: 140, height: 198 },
  { id: "logos", name: "Logos y símbolos", short: "Logos", x: 3050, y: 710, r: 460, width: 180, height: 144 },
  { id: "graphics", name: "Ilustración y aplicaciones", short: "Gráfica", x: 700, y: 2050, r: 400, width: 170, height: 150 },
  { id: "photos", name: "Fotografía", short: "Fotos", x: 2510, y: 2440, r: 570, width: 170, height: 134 },
];
let camera = { x: 0, y: 0, scale: 1 };
let frame = 0;
let drag = null;
let pinch = null;
let moved = false;
let sourceButton;
let viewportSize = { w: 0, h: 0 };
const pointers = new Map();
const groupButtons = new Map();

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function classify(item) {
  const section = (item.sectionTitle || "").toLowerCase();
  if (item.projectSlug === "stephen-king") return item.sectionBlock === "cover-study" ? "books" : "logos";
  if (/lacre/i.test(item.caption || "")) return "graphics";
  if (/afiche|historia/.test(section)) return "posters";
  if (/logo|marca|monograma|iconograf/.test(section) && !/ilustraci/.test(section)) return "logos";
  if (/ilustraci|sello|estampilla|sticker/.test(section)) return "graphics";
  return "photos";
}

// Alternate project origins inside each group, without shuffling on every visit.
function interleave(items) {
  const projects = new Map();
  items.forEach((item) => {
    if (!projects.has(item.projectSlug)) projects.set(item.projectSlug, []);
    projects.get(item.projectSlug).push(item);
  });
  const result = [];
  while ([...projects.values()].some((list) => list.length)) {
    projects.forEach((list) => { if (list.length) result.push(list.shift()); });
  }
  return result;
}

function makeImage(item, eager = false) {
  const img = element("img");
  const preview = [...(item.sources || [])].sort((a, b) => a.w - b.w)[0];
  img.src = preview?.src || item.src;
  img.alt = item.alt || item.name || "";
  img.width = item.w;
  img.height = item.h;
  img.draggable = false;
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  return img;
}

function darkMount(item) {
  const source = decodeURIComponent(item.original || item.src);
  return item.projectSlug === "orfeo" && item.sectionTitle === "Logotipo"
    || item.projectSlug === "el-armado" && (/\/Logo\.png$/i.test(source) || /iconography 2/i.test(source));
}

function makePalette(colors) {
  const container = document.querySelector("[data-detail-palette]");
  container.replaceChildren();
  (colors || []).filter(({ hex }) => /^#[0-9a-f]{6}$/i.test(hex)).slice(0, 5).forEach(({ name, hex }) => {
    const item = element("span", "sandbox-detail__color");
    const swatch = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    swatch.setAttribute("viewBox", "0 0 24 24");
    swatch.setAttribute("aria-hidden", "true");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12"); circle.setAttribute("cy", "12"); circle.setAttribute("r", "11"); circle.setAttribute("fill", hex);
    swatch.append(circle);
    item.append(swatch, element("span", null, name), element("span", null, hex));
    container.append(item);
  });
  container.hidden = !container.childElementCount;
  container.setAttribute("aria-label", "Paleta del proyecto o de la portada");
}

function openPiece(item, button) {
  sourceButton = button;
  const media = document.querySelector("[data-detail-media]");
  media.replaceChildren(makeImage(item, true));
  media.dataset.mount = button.dataset.mount || "none";
  document.querySelector("[data-detail-origin]").textContent = `${item.projectTitle}${item.sectionTitle ? ` · ${item.sectionTitle}` : ""}`;
  document.querySelector("[data-detail-title]").textContent = item.name;
  document.querySelector("[data-detail-description]").textContent = item.reading || item.projectDescription || "";
  makePalette(item.group === "photos" ? [] : item.colors || item.projectPalette);
  const link = document.querySelector("[data-detail-link]");
  link.href = `./project.html?p=${encodeURIComponent(item.projectSlug)}`;
  link.setAttribute("aria-label", `Ver proyecto completo: ${item.projectTitle}`);
  saveCamera();
  dialog.showModal();
  document.querySelector("[data-detail-close]").focus({ preventScroll: true });
}

function renderPieces(projects) {
  const all = projects.flatMap((project) => collectProjectAssets(project, { includeIntro: true }).map((item) => ({
    ...item, projectDescription: project.description, projectPalette: project.palette?.colors,
  })));
  groups.forEach((group) => {
    const items = interleave(all.filter((item) => classify(item) === group.id));
    if (!items.length) return;
    const orbit = element("section", "sandbox-orbit");
    orbit.setAttribute("aria-label", `${group.name} · ${items.length} piezas`);
    Object.assign(orbit.style, { left: `${group.x - group.r}px`, top: `${group.y - group.r}px`, width: `${group.r * 2}px`, height: `${group.r * 2}px` });
    const label = element("div", "sandbox-orbit__label");
    label.append(element("h2", "sandbox-orbit__title", group.name), element("span", "sandbox-orbit__count", `${items.length} piezas`));
    orbit.append(label);
    world.append(orbit);
    items.forEach((asset, index) => {
      const angle = -Math.PI / 2 + index / items.length * 2 * Math.PI;
      const item = { ...asset, group: group.id, name: asset.name || `Fotografía ${String(index + 1).padStart(2, "0")}` };
      const button = element("button", "sandbox-piece");
      button.type = "button";
      button.dataset.group = group.id;
      button.dataset.project = item.projectSlug;
      button.dataset.cursorAction = "Ver procedencia";
      button.setAttribute("aria-label", `${item.name} — ${item.projectTitle}`);
      button.setAttribute("aria-haspopup", "dialog");
      if (darkMount(item, group.id)) button.dataset.mount = "dark";
      Object.assign(button.style, { left: `${group.x + Math.cos(angle) * group.r}px`, top: `${group.y + Math.sin(angle) * group.r}px`, width: `${group.width}px`, height: `${group.height}px` });
      button.append(makeImage(item));
      button.addEventListener("click", () => { if (!moved) openPiece(item, button); });
      world.append(button);
    });
    const jump = element("button", null, group.short);
    jump.type = "button";
    jump.dataset.cursorAction = `Ver ${group.short.toLowerCase()}`;
    jump.addEventListener("click", () => centerGroup(group));
    document.querySelector("[data-sandbox-groups]").append(jump);
    groupButtons.set(group.id, jump);
  });
}

function constrain() {
  camera.scale = Math.min(1.6, Math.max(0.075, camera.scale));
  const fit = (position, size, screen) => {
    if (size * camera.scale < screen - 80) return (screen - size * camera.scale) / 2;
    return Math.min(80, Math.max(screen - size * camera.scale - 80, position));
  };
  camera.x = fit(camera.x, bounds.w, viewport.clientWidth);
  camera.y = fit(camera.y, bounds.h, viewport.clientHeight);
}

function paint() {
  frame = 0;
  constrain();
  viewportSize = { w: viewport.clientWidth, h: viewport.clientHeight };
  world.style.setProperty("--sandbox-scale", camera.scale);
  world.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`;
  scaleLabel.value = `${Math.round(camera.scale * 100)}%`;
  const center = { x: (viewport.clientWidth / 2 - camera.x) / camera.scale, y: (viewport.clientHeight / 2 - camera.y) / camera.scale };
  const closest = groups.reduce((a, b) => Math.hypot(a.x - center.x, a.y - center.y) < Math.hypot(b.x - center.x, b.y - center.y) ? a : b);
  groupButtons.forEach((button, id) => id === closest.id ? button.setAttribute("aria-current", "location") : button.removeAttribute("aria-current"));
}
function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
function saveCamera() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      cx: (viewport.clientWidth / 2 - camera.x) / camera.scale,
      cy: (viewport.clientHeight / 2 - camera.y) / camera.scale,
      scale: camera.scale,
    }));
  } catch {}
}
function centerGroup(group) {
  camera.scale = Math.min(0.95, Math.max(0.42, Math.min(viewport.clientWidth / (group.r * 2 + 240), viewport.clientHeight / (group.r * 2 + 240))));
  camera.x = viewport.clientWidth / 2 - group.x * camera.scale;
  camera.y = viewport.clientHeight / 2 - group.y * camera.scale;
  paint(); saveCamera();
}
function zoom(value, x = viewport.clientWidth / 2, y = viewport.clientHeight / 2) {
  const next = Math.max(0.075, Math.min(1.6, value));
  const ratio = next / camera.scale;
  camera.x = x - (x - camera.x) * ratio;
  camera.y = y - (y - camera.y) * ratio;
  camera.scale = next;
  schedule();
}
function fitAll() {
  camera.scale = Math.min((viewport.clientWidth - 40) / bounds.w, (viewport.clientHeight - 40) / bounds.h);
  camera.x = (viewport.clientWidth - bounds.w * camera.scale) / 2;
  camera.y = (viewport.clientHeight - bounds.h * camera.scale) / 2;
  paint(); saveCamera();
}

function initNavigation() {
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    if (event.ctrlKey) {
      const rect = viewport.getBoundingClientRect();
      zoom(camera.scale * Math.exp(-event.deltaY * 0.005), event.clientX - rect.left, event.clientY - rect.top);
    } else {
      camera.x -= (event.shiftKey ? event.deltaY : event.deltaX) * factor;
      camera.y -= (event.shiftKey ? 0 : event.deltaY) * factor;
      schedule();
    }
  }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    moved = false;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: camera.x, originY: camera.y };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const rect = viewport.getBoundingClientRect();
      const x = (a.x + b.x) / 2 - rect.left, y = (a.y + b.y) / 2 - rect.top;
      pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: camera.scale, x: (x - camera.x) / camera.scale, y: (y - camera.y) / camera.scale };
      moved = true;
    }
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const rect = viewport.getBoundingClientRect();
      camera.scale = Math.max(0.075, Math.min(1.6, pinch.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.distance)));
      camera.x = (a.x + b.x) / 2 - rect.left - pinch.x * camera.scale;
      camera.y = (a.y + b.y) / 2 - rect.top - pinch.y * camera.scale;
      schedule(); return;
    }
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) { moved = true; viewport.setPointerCapture(event.pointerId); }
    if (moved) { camera.x = drag.originX + dx; camera.y = drag.originY + dy; schedule(); }
  });
  const release = (event) => {
    pointers.delete(event.pointerId);
    pinch = null;
    drag = null;
    if (pointers.size === 1) {
      const [id, point] = [...pointers][0];
      drag = { id, ...point, originX: camera.x, originY: camera.y };
    }
    saveCamera();
    if (!pointers.size) setTimeout(() => { moved = false; }, 0);
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  viewport.addEventListener("dragstart", (event) => event.preventDefault());
  viewport.addEventListener("focusin", (event) => {
    if (!event.target.matches(".sandbox-piece")) return;
    const rect = event.target.getBoundingClientRect();
    const area = viewport.getBoundingClientRect();
    if (rect.left < area.left + 12 || rect.right > area.right - 12 || rect.top < area.top + 12 || rect.bottom > area.bottom - 12) {
      camera.x = viewport.clientWidth / 2 - parseFloat(event.target.style.left) * camera.scale;
      camera.y = viewport.clientHeight / 2 - parseFloat(event.target.style.top) * camera.scale;
      paint();
    }
  });
  viewport.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const step = event.shiftKey ? 200 : 80;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[event.key]) { event.preventDefault(); camera.x += moves[event.key][0]; camera.y += moves[event.key][1]; schedule(); }
    else if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); zoom(camera.scale * (event.key === "-" ? 0.8 : 1.25)); }
    else if (event.key === "Home") { event.preventDefault(); centerGroup(groups[1]); }
  });
  document.querySelectorAll("[data-sandbox-zoom]").forEach((button) => button.addEventListener("click", () => zoom(camera.scale * (button.dataset.sandboxZoom === "in" ? 1.25 : 0.8))));
  document.querySelector("[data-sandbox-fit]").addEventListener("click", fitAll);
  document.querySelector("[data-detail-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => sourceButton?.focus({ preventScroll: true }));
  window.addEventListener("pagehide", saveCamera);
  new ResizeObserver(() => {
    if (viewportSize.w) {
      camera.x += (viewport.clientWidth - viewportSize.w) / 2;
      camera.y += (viewport.clientHeight - viewportSize.h) / 2;
    }
    paint();
  }).observe(viewport);
  const fitFrame = () => {
    viewport.style.bottom = `${controls.getBoundingClientRect().height + 12}px`;
    viewport.style.top = `${document.querySelector(".sandbox-header").getBoundingClientRect().bottom + 8}px`;
    schedule();
  };
  const frameObserver = new ResizeObserver(fitFrame);
  frameObserver.observe(controls);
  frameObserver.observe(document.querySelector(".sandbox-header"));
  fitFrame();
}

const complete = startLoading("Cargando mesa de trabajo");
try {
  initShell();
  const response = await fetch("./data/projects.json", { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Registry unavailable");
  const registry = await response.json();
  const loaded = await Promise.allSettled(registry.filter((item) => item.kind === "project").map(async (project) => {
    const result = await fetch(project.details, { signal: AbortSignal.timeout(15000) });
    if (!result.ok) throw new Error("Project unavailable");
    return { ...project, ...await result.json() };
  }));
  const projects = loaded.filter((item) => item.status === "fulfilled").map((item) => item.value);
  if (!projects.length) throw new Error("No artwork available");
  renderPieces(projects);
  viewport.hidden = controls.hidden = false;
  document.querySelector("[data-sandbox-fallback]").hidden = true;
  initNavigation();
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch {}
  if (saved && [saved.cx, saved.cy, saved.scale].every(Number.isFinite)) {
    camera = { x: viewport.clientWidth / 2 - saved.cx * saved.scale, y: viewport.clientHeight / 2 - saved.cy * saved.scale, scale: saved.scale };
    paint();
  }
  else centerGroup(groups[1]);
  await waitForImages(viewport);
} catch {
  viewport.hidden = controls.hidden = true;
  const fallback = document.querySelector("[data-sandbox-fallback]");
  fallback.hidden = false;
  fallback.querySelector("p").textContent = "No se pudo preparar la mesa. Recargá la página o abrí uno de los proyectos.";
} finally { complete(); }
