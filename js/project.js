import { makeProjectType } from "./project-type.js";
import { initShell } from "./shell.js";

const content = document.querySelector("[data-entry-content]");
const title = document.querySelector("[data-entry-title]");
const slug = new URLSearchParams(window.location.search).get("p");

function closeEntry(event) {
  if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;
  const previous = document.referrer ? new URL(document.referrer) : null;
  if (previous?.origin === window.location.origin && /\/(?:index\.html)?$/.test(previous.pathname)) {
    event?.preventDefault();
    window.history.back();
  } else if (event?.type === "keydown") {
    window.location.href = "./index.html";
  }
}

document.querySelector("[data-close-entry]")?.addEventListener("click", closeEntry);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector(".project-preview[open]")) closeEntry(event);
});

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function makeImage(item, eager = false, sizes = "(max-width: 600px) calc(100vw - 32px), (max-width: 900px) 45vw, 400px") {
  if (!item?.src) return null;
  const source = new URL(item.src, document.baseURI);
  if (source.origin !== window.location.origin) return null;
  const image = makeElement("img");
  image.src = source.href;
  image.alt = item.alt || "";
  image.decoding = "async";
  const sources = (Array.isArray(item.sources) ? item.sources : []).filter((source) => source.src && source.w > 0);
  if (sources.length) {
    image.srcset = sources.map((item) => `${new URL(item.src, document.baseURI).href} ${item.w}w`).join(", ");
    image.sizes = sizes;
  }
  if (item.w > 0 && item.h > 0) {
    image.width = item.w;
    image.height = item.h;
  }
  if (!eager) image.loading = "lazy";
  else image.fetchPriority = "high";
  return image;
}

function setPageTitle(name, description, cover) {
  title.textContent = name;
  document.title = `${name} — Santiago Barbieri`;
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  if (cover) {
    const meta = makeElement("meta");
    meta.setAttribute("property", "og:image");
    meta.content = new URL(cover, document.baseURI).href;
    document.head.append(meta);
  }
}

function makePalette(colors) {
  const palette = makeElement("div", "project-palette");
  colors.forEach(({ name, hex }) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    const item = makeElement("figure", "project-palette__item");
    const swatch = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    swatch.classList.add("project-palette__swatch");
    swatch.setAttribute("viewBox", "0 0 100 100");
    swatch.setAttribute("aria-hidden", "true");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "50");
    circle.setAttribute("fill", hex);
    swatch.append(circle);
    const caption = makeElement("figcaption", "project-palette__name", name);
    caption.append(makeElement("span", "project-palette__hex", hex.toUpperCase()));
    item.append(swatch, caption);
    palette.append(item);
  });
  return palette;
}

let preview = null;

function openPreview(item) {
  if (!preview) {
    preview = makeElement("dialog", "project-preview");
    preview.setAttribute("aria-labelledby", "project-preview-title");
    const header = makeElement("div", "project-preview__header");
    const heading = makeElement("h2", "project-preview__title", "Afiche");
    heading.id = "project-preview-title";
    const close = makeElement("button", "project-preview__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar ampliación");
    close.addEventListener("click", () => preview.close());
    header.append(heading, close);
    preview.append(header, makeElement("div", "project-preview__stage"));
    preview.addEventListener("close", () => {
      preview.querySelector(".project-preview__stage").replaceChildren();
    });
    document.body.append(preview);
  }
  const stage = preview.querySelector(".project-preview__stage");
  const largest = [...(item.sources || [])].sort((a, b) => b.w - a.w)[0];
  const image = makeImage({ ...item, ...largest, sources: [] }, true);
  if (!image) return;
  preview.querySelector(".project-preview__title").textContent = item.caption || item.alt || "Afiche";
  stage.replaceChildren(image);
  stage.setAttribute("aria-busy", "true");
  image.decode().catch(() => {
    if (stage.contains(image)) stage.replaceChildren(makeElement("p", null, "No se pudo cargar la imagen."));
  }).finally(() => {
    if (!stage.querySelector("img") || stage.contains(image)) stage.removeAttribute("aria-busy");
  });
  preview.showModal();
}

function makeMedia(item, sizes, expandable = false) {
  const image = makeImage(item, false, sizes);
  if (!image) return null;
  const media = makeElement("figure", "project-media");
  const frame = makeElement("div", "project-media__image");
  if (["compact", "medium", "wide"].includes(item.size)) media.dataset.size = item.size;
  if (expandable) {
    const button = makeElement("button", "project-media__expand");
    button.type = "button";
    button.setAttribute("aria-label", `Ampliar: ${item.caption || item.alt || "afiche"}`);
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => openPreview(item));
    button.append(image);
    frame.append(button);
  } else {
    frame.append(image);
  }
  media.append(frame);
  if (item.caption) media.append(makeElement("figcaption", "project-media__caption", item.caption));
  return media;
}

function makeVariants(items, label = "Variantes", posters = false) {
  const group = makeElement("div", "project-variants");
  group.append(makeElement("h3", "tab project-variants__title", label));
  const grid = makeElement("div", "project-variants__grid");
  if (posters) grid.classList.add("project-poster-grid");
  items.forEach((item) => {
    const media = makeMedia(item, posters ? "(max-width: 600px) 18vw, 80px" : "150px", posters);
    if (!media) return;
    media.classList.add("project-variant");
    media.dataset.aspect = item.w / item.h < 0.85 ? "poster" : item.w / item.h > 1.3 ? "landscape" : "square";
    grid.append(media);
  });
  group.append(grid);
  return group;
}

function makeCoverNotes(data) {
  const notes = makeElement("div", "project-cover-notes");
  if (data.colors?.length) {
    notes.append(makeElement("h3", "tab project-cover-notes__title", "Paleta"), makePalette(data.colors));
  }
  if (data.inspiration) {
    notes.append(makeElement("h3", "tab project-cover-notes__title", "Lectura visual"), makeElement("p", "project-cover-notes__text", data.inspiration));
  }
  if (data.variants?.length) notes.append(makeVariants(data.variants, "Variantes de portada"));
  return notes;
}

function renderSection(data, index) {
  const section = makeElement("section", "project-section");
  const layouts = new Set(["brand-board", "uniform-grid", "contact-sheet"]);
  const layout = layouts.has(data.layout) ? data.layout : data.block === "logo" ? "brand-board" : null;
  if (layout) section.classList.add(`project-section--${layout}`);
  if (data.block === "cover-study") section.classList.add("project-section--cover-study");
  section.id = `section-${index + 1}`;
  section.tabIndex = -1;
  const number = data.n || String(index + 1).padStart(2, "0");
  const heading = makeElement("div", "project-section__heading");
  const sectionTitle = makeElement("h2", "tab");
  sectionTitle.id = `section-title-${index + 1}`;
  sectionTitle.append(makeElement("span", "project-section__number", number), makeElement("span", "project-section__label", data.title || "Imágenes"));
  section.setAttribute("aria-labelledby", sectionTitle.id);
  heading.append(sectionTitle);
  const body = makeElement("div", "project-section__content");

  if (data.block === "palette" && Array.isArray(data.colors)) {
    body.append(makePalette(data.colors));
  } else if (data.block === "comparison") {
    const spread = makeElement("div", "project-section__images project-comparison");
    const primary = makeElement("div", "project-comparison__main");
    (data.items || []).forEach((item) => {
      const media = makeMedia(item, undefined, data.frame === "poster");
      if (media) primary.append(media);
    });
    spread.append(primary);
    if (data.variants?.length) spread.append(makeVariants(data.variants, data.variantsTitle, data.frame === "poster"));
    body.append(spread);
  } else {
    const images = makeElement("div", `project-section__images project-section__images--${data.block || "grid"}`);
    if (layout) images.classList.add(`project-section__images--${layout}`);
    const posterGrid = data.frame === "poster";
    if (posterGrid) images.classList.add("project-poster-grid");
    if (["poster", "portrait", "landscape", "square", "story"].includes(data.frame)) images.classList.add(`project-section__images--frame-${data.frame}`);
    const items = Array.isArray(data.items) ? data.items : [];
    items.forEach((item) => {
      const media = makeMedia(item, posterGrid ? "(max-width: 600px) 18vw, (max-width: 900px) 17vw, 160px" : undefined, posterGrid);
      if (media) images.append(media);
    });
    if (data.block === "cover-study") images.append(makeCoverNotes(data));
    if (images.children.length) body.append(images);
    if (data.text) body.append(makeElement("p", null, data.text));
  }
  section.append(heading, body);
  return section;
}

function makeProjectSidebar(project, sections, hasPalette) {
  const sidebar = makeElement("aside", "project-sidebar");
  sidebar.setAttribute("aria-label", "Ficha del proyecto");
  const overview = makeElement("details", "project-overview");
  const summary = makeElement("summary", "tab project-overview__summary", "Proyecto");
  const body = makeElement("div", "project-overview__body");
  body.dataset.lenisPrevent = "";
  const metadata = makeElement("dl", "project-metadata");
  const rows = [["Proyecto", project.title], ["Tipo", project.type]];
  if (Array.isArray(project.meta)) rows.push(...project.meta);
  else if (project.meta && typeof project.meta === "object") rows.push(...Object.entries(project.meta));
  rows.forEach(([name, value]) => {
    if (value) metadata.append(makeElement("dt", null, name), makeElement("dd", null, value));
  });
  body.append(metadata);
  if (project.description) body.append(makeElement("p", "project-overview__description", project.description));
  const navigation = makeElement("nav", "project-index");
  navigation.setAttribute("aria-label", "Secciones del proyecto");
  const list = makeElement("ul");
  const entries = sections.map((section, index) => ({ id: `section-${index + 1}`, text: `${section.n || String(index + 1).padStart(2, "0")} ${section.title}` }));
  if (hasPalette) entries.unshift({ id: "project-colors", text: "Color" });
  entries.forEach(({ id, text }) => {
    const item = makeElement("li");
    const link = makeElement("a", null, text);
    link.href = `#${id}`;
    item.append(link);
    list.append(item);
  });
  navigation.append(makeElement("h2", "project-index__title", "Secciones"), list);
  body.append(navigation);
  overview.append(summary, body);
  sidebar.append(overview);
  const desktop = matchMedia("(min-width: 901px)");
  const fitOverview = () => { overview.open = desktop.matches; };
  desktop.addEventListener("change", fitOverview);
  fitOverview();
  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, "", link.hash);
    target.scrollIntoView({ block: "start", behavior: "instant" });
    target.focus({ preventScroll: true });
    if (!desktop.matches) overview.open = false;
  });
  return sidebar;
}

function trackProjectSections(sidebar) {
  if (!("IntersectionObserver" in window)) return;
  const links = [...sidebar.querySelectorAll("a")];
  const visible = new Set();
  let active = null;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    const target = [...visible].sort((a, b) => Math.abs(a.getBoundingClientRect().top - 110) - Math.abs(b.getBoundingClientRect().top - 110))[0];
    if (!target || active === target.id) return;
    active = target.id;
    links.forEach((link) => {
      if (link.hash === `#${active}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-90px 0px -40% 0px" });
  links.forEach((link) => {
    const target = document.getElementById(link.hash.slice(1));
    if (target) observer.observe(target);
  });
}

function renderProject(project) {
  content.classList.remove("entry-fallback");
  const article = makeElement("article", `project-entry${project.cover ? "" : " project-entry--text"}`);
  if (/^[a-z0-9-]+$/.test(project.slug)) article.classList.add(`project-entry--${project.slug}`);
  setPageTitle(`${project.title} - Overlook`, project.description, project.cover);
  const type = makeProjectType(project.family);
  if (type) {
    const classification = makeElement("div", "project-entry__classification");
    classification.append(type);
    if (project.family !== "identity") classification.append(makeElement("span", "project-entry__discipline", project.type));
    article.append(classification);
  }
  const opening = makeElement("div", "project-entry__opening");
  const heroSource = project.hero || project.cover;
  if (heroSource) {
    const hero = makeElement("figure", "project-entry__hero");
    const image = makeImage({ src: heroSource, alt: project.heroAlt || project.alt || `${project.title} — ${project.type}`, w: project.heroW || project.w, h: project.heroH || project.h }, true);
    if (image) hero.append(image);
    opening.append(hero);
  }
  if (project.palette) {
    const palette = makeElement("section", "project-color-summary");
    palette.id = "project-colors";
    palette.tabIndex = -1;
    const heading = makeElement("h2", "tab", project.palette.title || "Paleta");
    heading.id = "project-colors-title";
    palette.setAttribute("aria-labelledby", heading.id);
    palette.append(heading);
    if (project.palette.colors?.length) palette.append(makePalette(project.palette.colors));
    if (project.palette.description) palette.append(makeElement("p", "project-color-summary__description", project.palette.description));
    opening.append(palette);
  }
  article.append(opening);
  const sections = Array.isArray(project.sections) ? project.sections : [];
  if (!sections.length && Array.isArray(project.images) && project.images.length) {
    sections.push({ n: "01", title: "Imágenes", block: "grid", items: project.images.map((item) => typeof item === "string" ? { src: item, alt: `${project.title} — Imágenes` } : item) });
  }
  sections.forEach((section, index) => article.append(renderSection(section, index)));
  const sidebar = makeProjectSidebar(project, sections, Boolean(project.palette));
  content.replaceChildren(sidebar, article);
  trackProjectSections(sidebar);
}

async function renderEntry() {
  if (slug === "about" || slug === "contact") {
    window.location.replace(`./${slug}.html`);
    return;
  }
  if (!slug) {
    document.dispatchEvent(new CustomEvent("portfolio:content-ready"));
    return;
  }

  try {
    const response = await fetch(new URL("../data/projects.json", import.meta.url));
    if (!response.ok) throw new Error("Registry unavailable");
    const projects = await response.json();
    let project = projects.find((item) => item.slug === slug);
    if (!project) {
      setPageTitle("Entrada no encontrada");
      return;
    }
    if (project.details) {
      const detailsURL = new URL(project.details, document.baseURI);
      if (detailsURL.origin === window.location.origin) {
        const detailsResponse = await fetch(detailsURL);
        if (detailsResponse.ok) project = { ...project, ...await detailsResponse.json() };
      }
    }
    renderProject(project);
  } catch {
    setPageTitle("Archivo");
    // The fallback return link remains available if project data cannot load.
  } finally {
    document.dispatchEvent(new CustomEvent("portfolio:content-ready"));
  }
}

initShell();
renderEntry();
