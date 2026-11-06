import { initShell } from "./shell.js";
import { initArchive } from "./index.js";
import { startLoading } from "./loading.js";

const complete = startLoading("Cargando archivo");
try {
  initShell();
  await initArchive();
} finally {
  complete();
}
