export function initAccordions() {
  const sections = document.querySelectorAll(".accordion");

  sections.forEach((section) => {
    section.addEventListener("toggle", () => {
      section.toggleAttribute("data-animate", section.open);
    });
  });

  function openSection(id, focus = false) {
    const section = document.getElementById(id);
    if (!section?.matches(".accordion")) return;
    section.open = true;
    if (focus) section.querySelector("summary").focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-open-section]").forEach((link) => {
    link.addEventListener("click", () => {
      openSection(link.dataset.openSection, true);
    });
  });

  window.addEventListener("hashchange", () => {
    openSection(window.location.hash.slice(1));
  });
  openSection(window.location.hash.slice(1));
}
