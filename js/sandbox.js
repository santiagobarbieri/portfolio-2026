import { collectProjectAssets } from "./project-assets.js";
import { startLoading, waitForImages } from "./loading.js";
import { initShell } from "./shell.js";
import { buildSandboxLayout } from "./sandbox-layout.js";
import { createSandboxCamera, fitRectangle, worldPoint } from "./sandbox-camera.js";

const viewport = document.querySelector("[data-sandbox-viewport]");
const world = document.querySelector("[data-sandbox-world]");
const controls = document.querySelector("[data-sandbox-controls]");
const dialog = document.querySelector("[data-sandbox-detail]");
const scaleLabel = document.querySelector("[data-sandbox-scale]");
const locationLabel = document.querySelector("[data-sandbox-location]");
const map = document.querySelector("[data-sandbox-map]");
const mapButton = document.querySelector("[data-sandbox-map-button]");
const storageKey = "portfolio-sandbox-camera-v3";
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const groupDefinitions = [
  { id: "books", name: "Portadas de libro", short: "Libros", label: "Libros", anchor: [0.3, 0.3], width: 128, height: 182 },
  { id: "posters", name: "Posters", short: "Posters", label: "Posters", anchor: [0.56, 0.4], width: 140, height: 198 },
  { id: "logos", name: "Logos y símbolos", short: "Logos", label: "Logos", anchor: [0.68, 0.25], width: 180, height: 138 },
  { id: "graphics", name: "Ilustración y aplicaciones", short: "Gráfica", label: "Gráfica", anchor: [0.35, 0.68], width: 160, height: 144 },
  { id: "photos", name: "Fotografía", short: "Fotos", label: "Fotos", anchor: [0.64, 0.66], width: 180, height: 138 },
];
let layout;
let camera;
let mapView;
let layoutKey;
let moved = false;
let keyboard = true;
let drag;
let pinch;
let sourceButton;
let saveTimer;
let piecesCount = 0;
let activeFilter = null;
const pointers = new Map();
const mapGroups = new Map();

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
  return item.projectSlug === "olas-ditella" && /\/Logo\.svg$/i.test(source)
    || item.projectSlug === "orfeo" && item.sectionTitle === "Logotipo"
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
  camera.stop();
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
  piecesCount = all.length;
  layout = buildSandboxLayout(groupDefinitions.map((group) => ({ ...group, items: interleave(all.filter((item) => classify(item) === group.id)) })));
  layoutKey = "mixed-v1|" + layout.groups.map((group) => `${group.id}:${group.pieces.length}`).join("|");
  world.style.width = `${layout.bounds.width}px`;
  world.style.height = `${layout.bounds.height}px`;
  layout.groups.forEach((group) => {
    const orbit = element("section", "sandbox-filter-node");
    orbit.dataset.group = group.id;
    orbit.setAttribute("aria-labelledby", `sandbox-group-${group.id}`);
    Object.assign(orbit.style, { left: `${group.x - group.radius}px`, top: `${group.y - group.radius}px`, width: `${group.radius * 2}px`, height: `${group.radius * 2}px` });
    const heading = element("h2", "sandbox-filter-node__heading");
    heading.id = `sandbox-group-${group.id}`;
    const focus = element("button", "sandbox-filter-node__button");
    focus.type = "button";
    focus.setAttribute("aria-label", `Filtrar ${group.name}: ${group.pieces.length} piezas`);
    focus.setAttribute("aria-pressed", "false");
    focus.dataset.filter = group.id;
    focus.dataset.cursorAction = `Filtrar ${group.short.toLowerCase()}`;
    focus.append(element("span", "sandbox-filter-node__title", group.label), element("span", "sandbox-filter-node__count", `${group.pieces.length} piezas`));
    focus.addEventListener("click", () => { if (!moved) toggleFilter(group.id); });
    heading.append(focus);
    orbit.append(heading);
    world.append(orbit);
    group.pieces.forEach(({ item: asset, x, y, width, height }, index) => {
      const item = { ...asset, group: group.id, name: asset.name || `Fotografía ${String(index + 1).padStart(2, "0")}` };
      const button = element("button", "sandbox-piece");
      button.type = "button";
      Object.assign(button.dataset, { group: group.id, project: item.projectSlug, cursorAction: "Ver procedencia", x, y });
      button.setAttribute("aria-label", `${item.name} — ${item.projectTitle}`);
      button.setAttribute("aria-haspopup", "dialog");
      if (darkMount(item)) button.dataset.mount = "dark";
      Object.assign(button.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` });
      const image = makeImage(item);
      button.setAttribute("aria-busy", String(!image.complete));
      const settled = () => button.removeAttribute("aria-busy");
      image.addEventListener("load", settled, { once: true });
      image.addEventListener("error", () => {
        settled(); button.dataset.error = "true";
        button.append(element("span", "sandbox-piece__error", "Vista previa no disponible"));
      }, { once: true });
      button.append(image);
      button.addEventListener("click", () => {
        if (moved) return;
        openPiece(item, button);
      });
      world.append(button);
    });
    const jump = element("button", null, group.short);
    jump.type = "button";
    jump.dataset.cursorAction = `Filtrar ${group.short.toLowerCase()}`;
    jump.dataset.filter = group.id;
    jump.setAttribute("aria-pressed", "false");
    jump.setAttribute("aria-label", `Filtrar ${group.name} · ${group.pieces.length} piezas`);
    jump.addEventListener("click", () => toggleFilter(group.id));
    jump.append(element("span", "sandbox-filter-count", String(group.pieces.length)));
    document.querySelector("[data-sandbox-groups]").append(jump);
  });
}

function makeMap() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${layout.bounds.width} ${layout.bounds.height}`);
  svg.setAttribute("aria-hidden", "true");
  layout.groups.forEach((group) => {
    const marks = group.pieces.map((piece) => {
      const mark = document.createElementNS(svg.namespaceURI, "rect");
      mark.setAttribute("x", piece.x - piece.width / 2); mark.setAttribute("y", piece.y - piece.height / 2);
      mark.setAttribute("width", piece.width); mark.setAttribute("height", piece.height);
      mark.classList.add("sandbox-map__piece");
      svg.append(mark);
      return mark;
    });
    mapGroups.set(group.id, marks);
  });
  mapView = document.createElementNS(svg.namespaceURI, "rect");
  mapView.classList.add("sandbox-map__view");
  svg.append(mapView);
  mapButton.append(svg);
  map.open = false;
}

function updateCamera(state, size) {
  world.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
  world.style.setProperty("--sandbox-scale", state.scale);
  const overview = state.scale <= fitRectangle(layout.bounds, size, 24).scale * 1.15;
  const overviewValue = overview ? "1" : "0";
  if (world.dataset.overview !== overviewValue) world.dataset.overview = overviewValue;
  const scale = `${Math.round(state.scale * 100)}%`;
  if (scaleLabel.value !== scale) scaleLabel.value = scale;
  const filterNodes = state.scale >= 0.35 ? "1" : "0";
  if (world.dataset.filterNodes !== filterNodes) world.dataset.filterNodes = filterNodes;
  const instruction = document.querySelector("[data-sandbox-instruction]");
  const hint = overview ? "Tocá un círculo para filtrar y acercarte" : matchMedia("(pointer: coarse)").matches ? "Arrastrá para recorrer · pellizcá para acercar" : "Arrastrá para recorrer · + y − cambian la escala";
  if (instruction.textContent !== hint) instruction.textContent = hint;
  const x = Math.max(0, -state.x / state.scale), y = Math.max(0, -state.y / state.scale);
  mapView.setAttribute("x", x); mapView.setAttribute("y", y);
  mapView.setAttribute("width", Math.max(0, Math.min(layout.bounds.width, (size.width - state.x) / state.scale) - x));
  mapView.setAttribute("height", Math.max(0, Math.min(layout.bounds.height, (size.height - state.y) / state.scale) - y));
}

function saveCamera() {
  if (!camera) return;
  clearTimeout(saveTimer);
  const center = worldPoint(camera.state, camera.size.width / 2, camera.size.height / 2);
  try { sessionStorage.setItem(storageKey, JSON.stringify({ layout: layoutKey, filter: activeFilter, cx: center.x, cy: center.y, scale: camera.state.scale })); } catch {}
}
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveCamera, 180); }
function renderFilter() {
  const filtered = layout.groups.find((group) => group.id === activeFilter);
  const label = filtered ? `${filtered.name} · ${filtered.pieces.length} de ${piecesCount} piezas` : `Todo el mapa · ${piecesCount} piezas`;
  if (locationLabel.textContent !== label) locationLabel.textContent = label;
  document.querySelectorAll(".sandbox-piece").forEach((piece) => {
    piece.dataset.muted = String(Boolean(activeFilter && piece.dataset.group !== activeFilter));
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button.dataset.filter === activeFilter;
    button.setAttribute("aria-pressed", String(selected));
    button.dataset.cursorAction = selected ? "Quitar filtro" : `Filtrar ${layout.groups.find((group) => group.id === button.dataset.filter).short.toLowerCase()}`;
  });
  mapGroups.forEach((marks, id) => marks.forEach((mark) => mark.classList.toggle("sandbox-map__piece--muted", Boolean(activeFilter && id !== activeFilter))));
}
function toggleFilter(id) {
  activeFilter = activeFilter === id ? null : id;
  renderFilter();
  camera.fit(layout.groups.find((group) => group.id === activeFilter)?.bounds || layout.bounds);
}
function opening(immediate = false) {
  activeFilter = null;
  renderFilter();
  camera.fit(layout.bounds, immediate);
}

function navigationKey(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const step = event.shiftKey ? 200 : 90;
  const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
  if (moves[event.key]) { event.preventDefault(); camera.pan(...moves[event.key]); }
  else if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); camera.zoom(camera.destination.scale * (event.key === "-" ? 0.8 : 1.25)); }
  else if (event.key === "0") { event.preventDefault(); opening(); }
  else if (event.key === "1") { event.preventDefault(); camera.zoom(1); }
  else if (event.key === "Home") { event.preventDefault(); opening(); }
}

function initNavigation() {
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    if (event.ctrlKey) {
      const rect = viewport.getBoundingClientRect();
      camera.zoom(camera.destination.scale * Math.exp(-event.deltaY * 0.005), event.clientX - rect.left, event.clientY - rect.top);
    } else camera.pan(-(event.shiftKey ? event.deltaY : event.deltaX) * factor, -(event.shiftKey ? 0 : event.deltaY) * factor);
  }, { passive: false });
  document.addEventListener("pointerdown", () => { keyboard = false; }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") keyboard = true;
    if (!pointers.size && ["Tab", "Enter", " "].includes(event.key)) moved = false;
  }, true);
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    camera.stop(); moved = false;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, state: camera.state, lastX: event.clientX, lastY: event.clientY, time: performance.now(), vx: 0, vy: 0 };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()], rect = viewport.getBoundingClientRect();
      pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: camera.state.scale, anchor: worldPoint(camera.state, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top) };
      moved = true;
    }
  });
  window.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()], rect = viewport.getBoundingClientRect();
      const scale = Math.max(camera.minimumScale, Math.min(1.8, pinch.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.distance)));
      camera.move({ x: (a.x + b.x) / 2 - rect.left - pinch.anchor.x * scale, y: (a.y + b.y) / 2 - rect.top - pinch.anchor.y * scale, scale }, true);
      return;
    }
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) { moved = true; viewport.setPointerCapture(event.pointerId); }
    if (!moved) return;
    const time = performance.now(), elapsed = Math.max(8, time - drag.time);
    drag.vx = (event.clientX - drag.lastX) / elapsed;
    drag.vy = (event.clientY - drag.lastY) / elapsed;
    drag.lastX = event.clientX; drag.lastY = event.clientY; drag.time = time;
    camera.move({ ...drag.state, x: drag.state.x + dx, y: drag.state.y + dy }, true);
  });
  const release = (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    const momentum = moved && drag && !pinch && !preference.matches && performance.now() - drag.time < 70 && event.type !== "pointercancel";
    if (momentum) camera.pan(Math.max(-120, Math.min(120, drag.vx * 70)), Math.max(-120, Math.min(120, drag.vy * 70)));
    pinch = null; drag = null;
    if (pointers.size === 1) {
      const [id, point] = [...pointers][0];
      drag = { id, ...point, state: camera.state, lastX: point.x, lastY: point.y, time: performance.now(), vx: 0, vy: 0 };
    }
    if (!pointers.size) setTimeout(() => { moved = false; }, 0);
    scheduleSave();
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  const cancelGesture = () => {
    const interrupted = pointers.size > 0;
    for (const id of pointers.keys()) if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    pointers.clear(); drag = null; pinch = null;
    if (interrupted) moved = true;
    camera.stop(); saveCamera();
  };
  window.addEventListener("blur", cancelGesture);
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelGesture(); });
  viewport.addEventListener("dragstart", (event) => event.preventDefault());
  viewport.addEventListener("focusin", (event) => {
    if (!keyboard || !event.target.matches(".sandbox-piece")) return;
    const rect = event.target.getBoundingClientRect(), area = viewport.getBoundingClientRect();
    if (rect.left < area.left + 12 || rect.right > area.right - 12 || rect.top < area.top + 12 || rect.bottom > area.bottom - 12) camera.center(Number(event.target.dataset.x), Number(event.target.dataset.y), true);
  });
  viewport.addEventListener("keydown", navigationKey);
  document.querySelectorAll("[data-sandbox-zoom]").forEach((button) => button.addEventListener("click", () => camera.zoom(camera.destination.scale * (button.dataset.sandboxZoom === "in" ? 1.25 : 0.8))));
  document.querySelector("[data-sandbox-fit]").addEventListener("click", () => opening());
  document.querySelector("[data-sandbox-reset]").addEventListener("click", () => camera.zoom(1));
  document.querySelector("[data-detail-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => sourceButton?.focus({ preventScroll: true }));
  window.addEventListener("pagehide", () => { saveCamera(); camera.stop(); });
  new ResizeObserver(() => {
    if (Math.abs(viewport.clientWidth - camera.size.width) > 0.5 || Math.abs(viewport.clientHeight - camera.size.height) > 0.5) camera.resize({ width: viewport.clientWidth, height: viewport.clientHeight });
  }).observe(viewport);
  const frameObserver = new ResizeObserver(fitFrame);
  frameObserver.observe(controls);
  frameObserver.observe(document.querySelector(".sandbox-header"));
  initMapNavigation();
}

function fitFrame() {
  controls.style.setProperty("--sandbox-dock-height", `${controls.getBoundingClientRect().height}px`);
  viewport.style.bottom = `${controls.getBoundingClientRect().height + 12}px`;
  viewport.style.top = `${document.querySelector(".sandbox-header").getBoundingClientRect().bottom + 8}px`;
}

function initMapNavigation() {
  let pointer;
  const position = (event, immediate) => {
    const svg = mapButton.querySelector("svg");
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    camera.center(point.x, point.y, immediate);
  };
  mapButton.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault(); pointer = event.pointerId; mapButton.setPointerCapture(pointer); position(event, true);
  });
  mapButton.addEventListener("pointermove", (event) => { if (event.pointerId === pointer) position(event, true); });
  mapButton.addEventListener("pointerup", () => { pointer = undefined; scheduleSave(); });
  mapButton.addEventListener("pointercancel", () => { pointer = undefined; });
  mapButton.addEventListener("click", (event) => { if (event.detail === 0) opening(); });
  mapButton.addEventListener("keydown", navigationKey);
  map.addEventListener("keydown", (event) => { if (event.key === "Escape") { map.open = false; map.querySelector("summary").focus(); } });
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
  makeMap(); fitFrame();
  camera = createSandboxCamera({ viewport: { width: viewport.clientWidth, height: viewport.clientHeight }, bounds: layout.bounds, onChange: updateCamera, onRest: scheduleSave });
  initNavigation();
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch {}
  if (saved?.layout === layoutKey && [saved.cx, saved.cy, saved.scale].every(Number.isFinite)) {
    activeFilter = layout.groups.some((group) => group.id === saved.filter) ? saved.filter : null;
    renderFilter();
    camera.move({ x: viewport.clientWidth / 2 - saved.cx * saved.scale, y: viewport.clientHeight / 2 - saved.cy * saved.scale, scale: saved.scale }, true);
  } else opening(true);
  await waitForImages(viewport);
} catch {
  viewport.hidden = controls.hidden = true;
  const fallback = document.querySelector("[data-sandbox-fallback]");
  fallback.hidden = false;
  fallback.querySelector("p").textContent = "No se pudo preparar la mesa. Recargá la página o abrí uno de los proyectos.";
} finally { complete(); }
