import { copyFileSync, mkdirSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(path.join(root, "public"), { recursive: true });
copyFileSync(
  path.join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
  path.join(root, "public/pdf.worker.min.mjs"),
);
console.log(
  "Worker do leitor PDF preparado a partir da dependência verificada pelo npm.",
);

for (const folder of ["cmaps", "standard_fonts", "wasm", "iccs"])
  cpSync(
    path.join(root, "node_modules/pdfjs-dist", folder),
    path.join(root, "public/pdf-assets", folder),
    { recursive: true },
  );
