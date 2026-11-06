import { createImageGallery, imageKey } from "./image-gallery.js";
import { initSmoothScroll } from "./motion.js";
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
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) closeEntry(event);
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
  palette.dataset.count = colors.length;
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

let projectPhotos = [];

function isPhoto(item) {
  return /\.jpe?g$/i.test(new URL(item.original || item.src, document.baseURI).pathname);
}

function collectPhotos(project) {
  const photos = [];
  const seen = new Set();
  function add(item) {
    const key = imageKey(item);
    if (key && !seen.has(key) && (project.family === "photography" || isPhoto(item))) {
      seen.add(key);
      photos.push(item);
    }
  }
  if (project.hero || project.cover) add({
    src: project.hero || project.cover, original: project.heroOriginal || project.coverOriginal,
    w: project.heroW || project.w, h: project.heroH || project.h,
    alt: project.heroAlt || project.alt, sources: project.heroSources, name: project.heroName,
  });
  (project.sections || []).forEach((section) => (section.items || []).forEach((item) => add({
    ...item, name: item.name || (section.layout === "product-triptych" ? item.caption : undefined),
  })));
  return photos;
}

function openGallery(item, collection) {
  const items = collection?.length ? collection : isPhoto(item) && projectPhotos.length ? projectPhotos : [item];
  imageGallery.open(items, Math.max(0, items.findIndex((entry) => imageKey(entry) === imageKey(item))));
}

function makeMedia(item, sizes, expandable = false, galleryItems) {
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
    button.addEventListener("click", () => openGallery(item, galleryItems));
    button.append(image);
    frame.append(button);
  } else {
    frame.append(image);
  }
  media.append(frame);
  if (item.caption) media.append(makeElement("figcaption", "project-media__caption", item.caption));
  return media;
}

function makeVariants(items, label = "Variantes", posters = false, galleryItems = items) {
  const group = makeElement("div", "project-variants");
  group.append(makeElement("h3", "project-variants__title", label));
  const grid = makeElement("div", "project-variants__grid");
  if (posters) grid.classList.add("project-poster-grid");
  if (items.length === 1) grid.classList.add("project-variants__grid--single");
  items.forEach((item) => {
    const media = makeMedia(item, posters ? "(max-width: 600px) 18vw, 80px" : "150px", true, galleryItems);
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
    notes.append(makeElement("h3", "project-cover-notes__title", "Paleta"), makePalette(data.colors));
  }
  if (data.inspiration) {
    notes.append(makeElement("h3", "project-cover-notes__title", "Lectura visual"), makeElement("p", "project-cover-notes__text", data.inspiration));
  }
  if (data.variants?.length) notes.append(makeVariants(data.variants, "Variantes de portada", false, [...(data.items || []), ...data.variants]));
  return notes;
}

function renderSection(data, index) {
  const section = makeElement("section", "project-section");
  const layouts = new Set(["brand-board", "uniform-grid", "contact-sheet", "symbol-grid", "reference-sheet", "product-triptych"]);
  const layout = layouts.has(data.layout) ? data.layout : data.block === "logo" ? "brand-board" : null;
  if (layout) section.classList.add(`project-section--${layout}`);
  if (data.block === "cover-study") section.classList.add("project-section--cover-study");
  if (data.block === "text") section.classList.add("project-section--text");
  section.id = `section-${index + 1}`;
  section.tabIndex = -1;
  const number = data.n || String(index + 1).padStart(2, "0");
  const heading = makeElement("div", "project-section__heading");
  const sectionTitle = makeElement("h2", "project-section__title");
  sectionTitle.id = `section-title-${index + 1}`;
  sectionTitle.append(makeElement("span", "project-section__number", number), makeElement("span", "project-section__label", data.title || "Imágenes"));
  section.setAttribute("aria-labelledby", sectionTitle.id);
  heading.append(sectionTitle);
  const body = makeElement("div", "project-section__content");

  if (data.block === "palette" && Array.isArray(data.colors)) {
    body.append(makePalette(data.colors));
  } else if (data.block === "comparison") {
    const spread = makeElement("div", "project-section__images project-comparison");
    if (layout === "brand-board") spread.classList.add("project-comparison--brand-board");
    const primary = makeElement("div", "project-comparison__main");
    const galleryItems = [...(data.items || []), ...(data.variants || [])];
    (data.items || []).forEach((item) => {
      const media = makeMedia(item, undefined, true, galleryItems);
      if (media) primary.append(media);
    });
    spread.append(primary);
    if (data.variants?.length) spread.append(makeVariants(data.variants, data.variantsTitle, data.frame === "poster", galleryItems));
    body.append(spread);
  } else {
    const images = makeElement("div", `project-section__images project-section__images--${data.block || "grid"}`);
    if (layout) images.classList.add(`project-section__images--${layout}`);
    if (layout === "product-triptych") images.classList.add("project-section__images--uniform-grid");
    const posterGrid = data.frame === "poster";
    if (posterGrid) images.classList.add("project-poster-grid");
    if (["poster", "portrait", "landscape", "square", "story"].includes(data.frame)) images.classList.add(`project-section__images--frame-${data.frame}`);
    const items = Array.isArray(data.items) ? data.items : [];
    items.forEach((item) => {
      const collection = isPhoto(item) ? undefined : [...items, ...(data.variants || [])];
      const media = makeMedia(item, posterGrid ? "(max-width: 600px) 18vw, (max-width: 900px) 17vw, 160px" : undefined, posterGrid || layout === "uniform-grid" || layout === "product-triptych" || data.block === "cover-study", collection);
      if (media) images.append(media);
    });
    if (data.block === "cover-study") images.append(makeCoverNotes(data));
    if (images.children.length) body.append(images);
    if (data.text) body.append(makeElement("p", null, data.text));
  }
  section.append(heading, body);
  return section;
}

function jumpToSection(event) {
  const link = event.target.closest("a");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  history.replaceState(null, "", link.hash);
  const overview = document.querySelector(".project-overview");
  if (overview && !matchMedia("(min-width: 901px)").matches) overview.open = false;
  target.scrollIntoView({ block: "start", behavior: "instant" });
  projectScroll.scrollTo(scrollY, { immediate: true });
  target.focus({ preventScroll: true });
}

function makeCatalogue(sections, config) {
  const catalogue = makeElement("section", "project-section project-catalogue");
  catalogue.id = "project-catalogue";
  catalogue.tabIndex = -1;
  const heading = makeElement("div", "project-section__heading");
  const title = makeElement("h2", "project-section__title", config.title || "Portadas");
  title.id = "project-catalogue-title";
  catalogue.setAttribute("aria-labelledby", title.id);
  heading.append(title);
  const grid = makeElement("div", "project-catalogue__grid project-poster-grid");
  sections.forEach((section, index) => {
    if (section.block !== "cover-study" || !section.items?.length) return;
    const link = makeElement("a", "project-catalogue__link");
    link.href = `#section-${index + 1}`;
    link.setAttribute("aria-label", `Ver ${section.title}: paleta y lectura visual`);
    const media = makeMedia({ ...section.items[0], caption: section.title }, "(max-width: 600px) 18vw, 160px");
    if (!media) return;
    link.append(media);
    grid.append(link);
  });
  grid.addEventListener("click", jumpToSection);
  catalogue.append(heading, grid);
  return catalogue;
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
  if (project.catalogue) entries.unshift({ id: "project-catalogue", text: "Todas las portadas" });
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
  navigation.addEventListener("click", jumpToSection);
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

function renderPhotoCollection(project) {
  document.body.classList.add("photo-collection-page");
  content.classList.remove("entry-fallback");
  setPageTitle(project.title, project.description, project.cover);
  const article = makeElement("article", "project-entry photo-collection");
  const count = makeElement("p", "photo-collection__count", `${String(projectPhotos.length).padStart(2, "0")} fotografías`);
  const grid = makeElement("div", "photo-collection__grid");
  projectPhotos.forEach((item, index) => {
    const figure = makeElement("figure", "photo-collection__item");
    const button = makeElement("button", "photo-collection__open");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", `Abrir fotografía ${index + 1}${item.name ? ` — ${item.name}` : ""}`);
    const frame = makeElement("span", "photo-collection__frame");
    const image = makeImage(item, index < 3, "(max-width: 900px) 30vw, 280px");
    if (image) frame.append(image);
    const caption = makeElement("span", "photo-collection__caption");
    caption.append(makeElement("span", "photo-collection__number", String(index + 1).padStart(2, "0")));
    if (item.name) caption.append(makeElement("span", "photo-collection__name", item.name));
    button.append(frame, caption);
    button.addEventListener("click", () => imageGallery.open(projectPhotos, index));
    figure.append(button);
    grid.append(figure);
  });
  const information = makeElement("section", "photo-collection__information");
  information.setAttribute("aria-label", "Ficha del proyecto");
  information.append(makeElement("h2", "photo-collection__title", "Proyecto"));
  const metadata = makeElement("dl", "project-metadata");
  [["Proyecto", project.title], ...(project.meta || [])].forEach(([label, value]) => {
    if (value) metadata.append(makeElement("dt", null, label), makeElement("dd", null, value));
  });
  information.append(metadata);
  article.append(makeElement("h1", "visually-hidden", project.title), count, grid, information);
  content.replaceChildren(article);
}

function renderProject(project) {
  projectPhotos = collectPhotos(project);
  if (project.family === "photography") { renderPhotoCollection(project); return; }
  content.classList.remove("entry-fallback");
  const article = makeElement("article", `project-entry${project.cover ? "" : " project-entry--text"}`);
  if (/^[a-z0-9-]+$/.test(project.slug)) article.classList.add(`project-entry--${project.slug}`);
  if (/^[a-z0-9-]+$/.test(project.presentation || "")) article.classList.add(`project-entry--${project.presentation}`);
  setPageTitle(project.title, project.description, project.cover);
  const header = makeElement("header", "project-entry__header");
  header.append(makeElement("h1", "project-entry__title", project.title));
  const classification = makeElement("div", "project-entry__classification");
  const type = makeProjectType(project.family);
  if (type) classification.append(type);
  if (project.family !== "identity" && project.type) classification.append(makeElement("span", "project-entry__discipline", project.type));
  header.append(classification);
  article.append(header);
  const opening = makeElement("div", "project-entry__opening");
  const heroSource = project.hero || project.cover;
  if (heroSource) {
    const hero = makeElement("figure", "project-entry__hero");
    const heroItem = { src: heroSource, alt: project.heroAlt || project.alt || `${project.title} — ${project.type}`, w: project.heroW || project.w, h: project.heroH || project.h, sources: project.heroSources, original: project.heroOriginal || project.coverOriginal };
    const image = makeImage(heroItem, true);
    if (image) {
      if (isPhoto(heroItem)) {
        const open = makeElement("button", "project-media__expand");
        open.type = "button";
        open.setAttribute("aria-label", "Abrir fotografías del proyecto");
        open.setAttribute("aria-haspopup", "dialog");
        open.addEventListener("click", () => openGallery(heroItem));
        open.append(image);
        hero.append(open);
      } else hero.append(image);
    }
    opening.append(hero);
  }
  if (project.palette) {
    const palette = makeElement("section", "project-color-summary");
    palette.id = "project-colors";
    palette.tabIndex = -1;
    const heading = makeElement("h2", "project-color-summary__title", project.palette.title || "Paleta");
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
  if (project.catalogue) article.append(makeCatalogue(sections, project.catalogue));
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

const projectScroll = initSmoothScroll();
const imageGallery = createImageGallery({ onOpen: () => projectScroll.stop(), onClose: () => projectScroll.start() });
initShell();
document.addEventListener("portfolio:content-ready", () => projectScroll.resize(), { once: true });
renderEntry();
