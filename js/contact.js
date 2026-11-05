import { initShell } from "./shell.js";

initShell();

// Keep the incomplete form honest until the real contact service is connected.
document.querySelector("#contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
});
