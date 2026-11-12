function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function makePalette(colors) {
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
