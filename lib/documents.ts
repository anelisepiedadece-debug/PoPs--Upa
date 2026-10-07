import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./db.ts";
export async function storePdf(file: File): Promise<string> {
  if (file.size > 15 * 1024 * 1024)
    throw new Error("O PDF deve ter no máximo 15 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (
    bytes.subarray(0, 5).toString() !== "%PDF-" ||
    !bytes.subarray(-2048).includes(Buffer.from("%%EOF"))
  )
    throw new Error("Envie um arquivo PDF válido.");
  const folder = path.join(dataDir, "documents");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const id = randomUUID();
  await writeFile(path.join(folder, id + ".pdf"), bytes, {
    mode: 0o600,
    flag: "wx",
  });
  return id;
}
