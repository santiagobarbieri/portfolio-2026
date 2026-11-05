import { initShell } from "./shell.js";
import { initArchive } from "./index.js";
import { startLoading } from "./loading.js";

initShell();
const complete = startLoading("Cargando archivo");
try {
  await initArchive();
} finally {
  complete();
}
