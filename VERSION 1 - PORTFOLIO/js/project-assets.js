import { imageKey } from "./image-gallery.js";

export function makeHeroItem(project) {
  const usesCover = !project.hero || imageKey({ src: project.hero }) === imageKey({ src: project.cover });
  return {
    src: project.hero || project.cover,
    original: project.heroOriginal || (usesCover ? project.coverOriginal : undefined),
    w: project.heroW || project.w, h: project.heroH || project.h,
    alt: project.heroAlt || project.alt || `${project.title} — ${project.type}`,
    sources: project.heroSources || (usesCover ? project.coverSources : undefined),
    name: project.heroName,
    size: project.heroSize,
    gallery: project.heroGallery,
  };
}

export function collectProjectAssets(project) {
  const assets = new Map();
  const photography = project.family === "photography";
  function add(item, name, contextual = false) {
    if (item.gallery === false) return;
    const key = imageKey(item);
    if (!key) return;
    const existing = assets.get(key);
    if (!existing) assets.set(key, { ...item, name: item.name || name, contextualName: contextual, explicitName: Boolean(item.name) });
    else if (contextual && !existing.contextualName && !existing.explicitName) {
      existing.name = item.name || name;
      existing.contextualName = true;
    }
    if (existing && contextual) {
      for (const field of ["sectionTitle", "sectionBlock", "sectionIndex", "colors", "reading"]) {
        if (item[field] !== undefined) existing[field] = item[field];
      }
    }
    if (existing && item.size && !existing.size) existing.size = item.size;
  }
  if (project.hero || project.cover) add({ ...makeHeroItem(project), projectSlug: project.slug, projectTitle: project.title }, photography ? undefined : project.title);
  const sections = project.sections || (project.images?.length ? [{ title: "Imágenes", items: project.images }] : []);
  sections.forEach((section) => {
    if (section.gallery === false) return;
    const primary = section.items || [];
    const variants = section.variants || [];
    function label(item, index, variant) {
      if (photography) return item.name;
      const title = section.title || "Imagen";
      if (item.name) return item.name;
      if (item.caption) return variant ? `${title} — ${item.caption}` : section.block === "cover-study" ? title : item.caption;
      const count = variant ? variants.length : primary.length;
      return count > 1 ? `${title} — ${String(index + 1).padStart(2, "0")}` : title;
    }
    primary.forEach((value, index) => {
      const item = typeof value === "string" ? { src: value } : value;
      add({ ...item, projectSlug: project.slug, projectTitle: project.title, sectionTitle: section.title, sectionBlock: section.block, sectionIndex: sections.indexOf(section), colors: section.colors, reading: section.inspiration }, label(item, index, false), true);
    });
    variants.forEach((item, index) => add({ ...item, projectSlug: project.slug, projectTitle: project.title, sectionTitle: section.title, sectionBlock: section.block, sectionIndex: sections.indexOf(section), colors: section.colors, reading: section.inspiration }, label(item, index, true), true));
  });
  return [...assets.values()];
}

