import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDir = path.join(process.cwd(), "storage");

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const fullPath = path.join(storageDir, fileName);
    const raw = await readFile(fullPath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(fileName: string, value: unknown) {
  await mkdir(storageDir, { recursive: true });
  const fullPath = path.join(storageDir, fileName);
  await writeFile(fullPath, JSON.stringify(value, null, 2), "utf8");
}
