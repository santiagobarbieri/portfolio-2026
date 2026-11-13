const labels = {
  identity: "Proyectos",
  books: "Librería",
  posters: "Afiches",
  passion: "Afiches",
  photography: "Colecciones",
};

export function makeProjectType(family) {
  if (!labels[family]) return null;
  const label = document.createElement("span");
  label.className = "project-type";
  label.dataset.family = family;
  label.textContent = labels[family];
  return label;
}
