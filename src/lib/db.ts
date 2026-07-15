import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export async function readData<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data) as T;
}

export async function writeData<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
