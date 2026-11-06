const labels = {
  identity: "Identidad visual",
  passion: "Passion project",
  photography: "Colección de fotos",
};

export function makeProjectType(family) {
  if (!labels[family]) return null;
  const label = document.createElement("span");
  label.className = "project-type";
  label.dataset.family = family;
  label.textContent = labels[family];
  return label;
}
