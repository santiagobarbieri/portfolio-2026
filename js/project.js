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
  if (event.key === "Escape") closeEntry(event);
});

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function makeImage(item, eager = false) {
  if (!item?.src) return null;
  const source = new URL(item.src, document.baseURI);
  if (source.origin !== window.location.origin) return null;
  const image = makeElement("img");
  image.src = source.href;
  image.alt = item.alt || "";
  image.decoding = "async";
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

function renderSection(data, index) {
  const section = makeElement("section", "project-section");
  const heading = makeElement("div", "project-section__heading");
  const number = data.n || String(index + 1).padStart(2, "0");
  const sectionTitle = makeElement("h2", "tab", number);
  sectionTitle.id = `section-${index + 1}`;
  section.setAttribute("aria-labelledby", sectionTitle.id);
  heading.append(sectionTitle, makeElement("p", null, data.title || "Imágenes"));
  const body = makeElement("div", "project-section__content");

  if (data.block === "palette" && Array.isArray(data.colors)) {
    body.append(makePalette(data.colors));
  } else {
    const items = Array.isArray(data.items) ? data.items : [];
    let columns = 1;
    if (!["logo", "sequence", "text"].includes(data.block)) {
      columns = items.length >= 7 ? 4 : items.length >= 3 ? 3 : items.length;
    }
    const images = makeElement("div", `project-section__images project-section__images--${Math.max(1, columns)} project-section__images--${data.block || "grid"}`);
    items.forEach((item) => {
      const image = makeImage(item);
      if (!image) return;
      if (item.w / item.h > 2.5) image.classList.add("project-section__wide");
      images.append(image);
    });
    if (images.children.length) body.append(images);
    if (data.text) body.append(makeElement("p", null, data.text));
  }
  section.append(heading, body);
  return section;
}

function renderProject(project) {
  content.classList.remove("entry-fallback");
  const article = makeElement("article", `project-entry${project.cover ? "" : " project-entry--text"}`);
  setPageTitle(`${project.title} - Overlook`, project.description, project.cover);
  const heroSource = project.hero || project.cover;
  if (heroSource) {
    const hero = makeElement("figure", "project-entry__hero");
    const image = makeImage({
      src: heroSource,
      alt: project.heroAlt || project.alt || `${project.title} — ${project.type}`,
      w: project.heroW || project.w,
      h: project.heroH || project.h,
    }, true);
    if (image) hero.append(image);
    article.append(hero);
  }

  const intro = makeElement("section", "project-entry__intro");
  intro.append(makeElement("h2", "tab", "Proyecto"));
  const metadata = makeElement("dl", "project-metadata");
  const rows = [["Proyecto", project.title], ["Tipo", project.type]];
  if (Array.isArray(project.meta)) rows.push(...project.meta);
  else if (project.meta && typeof project.meta === "object") rows.push(...Object.entries(project.meta));
  rows.forEach(([name, value]) => {
    if (!value) return;
    metadata.append(makeElement("dt", null, name), makeElement("dd", null, value));
  });
  intro.append(metadata);
  if (project.description) intro.append(makeElement("p", null, project.description));
  article.append(intro);

  const sections = Array.isArray(project.sections) ? project.sections : [];
  if (!sections.length && Array.isArray(project.images) && project.images.length) {
    sections.push({ n: "01", title: "Imágenes", block: "grid", items: project.images.map((item) => typeof item === "string" ? { src: item, alt: `${project.title} — Imágenes` } : item) });
  }
  sections.forEach((section, index) => article.append(renderSection(section, index)));
  content.replaceChildren(article);
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
