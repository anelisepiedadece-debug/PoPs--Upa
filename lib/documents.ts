import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./local-db.ts";
import { cloudEnabled, cloudRequest } from "./cloud.ts";
export async function storePdf(file: File): Promise<string> {
  if (file.size > 3 * 1024 * 1024)
    throw new Error("O PDF deve ter no máximo 3 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (
    bytes.subarray(0, 5).toString() !== "%PDF-" ||
    !bytes.subarray(-2048).includes(Buffer.from("%%EOF"))
  )
    throw new Error("Envie um arquivo PDF válido.");
  const id = randomUUID();
  if (cloudEnabled()) {
    await cloudRequest("/storage/v1/object/pops-upa-private/" + id + ".pdf", {
      method: "POST",
      headers: { "Content-Type": "application/pdf", "x-upsert": "false" },
      body: bytes,
    });
    return id;
  }
  const folder = path.join(dataDir, "documents");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(path.join(folder, id + ".pdf"), bytes, {
    mode: 0o600,
    flag: "wx",
  });
  return id;
}

export async function readPdf(id: string): Promise<Uint8Array> {
  if (cloudEnabled()) {
    const response = await cloudRequest(
      "/storage/v1/object/authenticated/pops-upa-private/" + id + ".pdf",
    );
    return new Uint8Array(await response.arrayBuffer());
  }
  return readFile(path.join(dataDir, "documents", id + ".pdf"));
}
