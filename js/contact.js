import { initShell } from "./shell.js";
import { startLoading, waitForImages } from "./loading.js";

const complete = startLoading("Cargando Contacto");
try {

initShell();

const form = document.querySelector("#contact-form");
const steps = [...form.querySelectorAll("[data-contact-step]")];
const links = [...document.querySelectorAll("[data-contact-step-link]")];
const body = form.querySelector("[data-contact-body]");
const next = form.querySelector("[data-contact-next]");
const back = form.querySelector("[data-contact-back]");
const status = document.getElementById("contact-status");
form.noValidate = true;
let current = 0;
let visited = 0;
let brief = "";

function isProject() { return form.elements["request-kind"].value !== "Consulta"; }

function review() {
  const data = new FormData(form);
  const values = [
    ["Motivo", data.get("request-kind")],
    ...(isProject() ? [["Marca", data.get("company")], ["Servicios", data.getAll("services").join(", ")]] : []),
    [isProject() ? "Idea" : "Consulta", data.get("message")],
    ...(isProject() ? [["Plazo", data.get("deadline") || "A definir"], ["Presupuesto", data.get("budget") ? `${data.get("budget")} ${data.get("currency")}` : "A definir"]] : []),
    ["Referencia", data.get("reference")], ["Contexto", data.get("context")], ["Nombre", data.get("name")], ["Correo electrónico", data.get("email")],
  ].filter(([, value]) => String(value || "").trim());
  const result = form.querySelector("[data-contact-review]");
  result.replaceChildren();
  values.forEach(([label, value]) => {
    const dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = label; dd.textContent = value;
    result.append(dt, dd);
  });
  brief = values.map(([label, value]) => `${label}\n${value}`).join("\n\n");
}

function valid() {
  for (const field of steps[current].querySelectorAll("input, textarea, select")) {
    if (field.closest("[hidden]") || field.disabled) continue;
    if (!field.reportValidity()) return false;
  }
  return true;
}

function show(index, focus = true) {
  current = index;
  visited = Math.max(visited, current);
  steps.forEach((step, i) => { step.hidden = i !== current; });
  form.querySelectorAll("[data-project-fields]").forEach((group) => { group.hidden = !isProject(); });
  form.querySelector("[data-contact-details-title]").textContent = isProject() ? "Contame la idea" : "¿Cuál es tu consulta?";
  const messageLabel = form.querySelector("[data-contact-message-label]");
  messageLabel.firstChild.textContent = isProject() ? "La idea y lo que querés lograr " : "Tu consulta ";
  document.querySelector("[data-contact-progress]").textContent = `${String(current + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  links.forEach((link, i) => {
    link.disabled = i > visited;
    if (i === current) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  back.disabled = current === 0;
  next.hidden = current === steps.length - 1;
  status.textContent = current === steps.length - 1 ? "El envío todavía no está conectado." : "";
  if (current === steps.length - 1) review();
  body.scrollTop = 0;
  if (focus) steps[current].querySelector("legend").focus({ preventScroll: true });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (current < steps.length - 1 && valid()) show(current + 1);
});
next.addEventListener("click", () => { if (valid()) show(current + 1); });
back.addEventListener("click", () => { if (current) show(current - 1); });
links.forEach((link, index) => link.addEventListener("click", () => { if (index < current || valid()) show(index); }));
form.querySelector("[data-contact-copy]").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(brief);
    status.textContent = "Resumen copiado. Todavía no fue enviado.";
  } catch {
    const text = form.querySelector("[data-contact-brief]");
    text.textContent = brief;
    text.hidden = false;
    const selection = getSelection(), range = document.createRange();
    range.selectNodeContents(text); selection.removeAllRanges(); selection.addRange(range);
    text.focus();
    status.textContent = "Copiá el texto seleccionado. Todavía no fue enviado.";
  }
});
form.querySelector("[data-contact-download]").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = "consulta-santiago-barbieri.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Resumen guardado. Todavía no fue enviado.";
});
form.querySelectorAll("[data-contact-copy], [data-contact-download]").forEach((button) => { button.disabled = false; });
document.body.classList.add("contact-page--guided");
document.querySelector("[data-contact-steps]").hidden = false;
form.querySelector("[data-contact-navigation]").hidden = false;
show(0, false);

await waitForImages(form);
} finally { complete(); }
